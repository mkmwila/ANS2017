/*
 * Path.cpp
 *
 *  	Created on: 04 November 2016
 *      Author    : Ajith Gopal
 *      Project   : GBATT Autonomous Navigation
 */
 
#include <iostream>
#include <ctime>
#include <cstdlib>
#include <math.h>
#include <stdio.h>
#include <fstream>
#include <string>
#include <json.hpp>
#include <sstream>


using namespace std;
using namespace nlohmann;


int *global(int grid[65][65], float current_pos[4], float goal_pos[3], int number_of_rows, int number_of_columns);

float *trajectory(int *global_route, float speed_limit, float cell_size, float wheel_base, float theta_limit, float current_pose[4]);

int main(int argc, char** argv) {

	char received_Data [512];
	gets (received_Data);
 	fprintf(stderr, received_Data);
 	
	json input_data;
	input_data=json::parse(received_Data);
	
	float grid_block_size; // size of square cell in meters - input from path planner pc
	float pose[4]; // current x,y,heading, speed input from world pc
	float goal_pos[2];
	int map[65][65];
	int map_rows;
	int map_columns;
	
	map_rows=input_data.at("map").at("rows");
	map_columns=input_data.at("map").at("columns");
	
	for (int i=0; i<map_rows; i++)
	{
		for (int j=0; j<map_columns; j++)
		{
			map[i][j]=input_data.at("map").at("traversability").get<int>(); // Generate random obstacles
		}
	}
	
	grid_block_size=input_data.at("map").at("gridSize");
	pose[0]=input_data.at("location").at("x");
	pose[1]=input_data.at("location").at("y");
	pose[2]=input_data.at("location").at("r");
	pose[3]=input_data.at("speed");
	goal_pos[0]=input_data.at("destination").at("x");
	goal_pos[1]=input_data.at("destination").at("y");
	goal_pos[2]=input_data.at("destination").at("r");
	

	const float GBAT_wheel_base=1.3*2; // vehicle wheel base in meters x multiple for waypoint distance
	const float theta_max=0.6; // max possible steering angle ~34deg
	const float speed_max=11; // speed limit to 40km/h

	json local_path_plan;
	
	int *global_path=global(map, pose, goal_pos, map_rows, map_columns);
	
	if (*global_path==-1)
	{
		local_path_plan={
			
				{"timeStamp", time(0)},
				{"name","Planner PC"},
				{"Data",
			{
				{"Linear_Velocity", 0},
				{"Steering_Angle", 0},
				{"Distance", 0}
			},
			{
				{"Linear_Velocity", 0},
				{"Steering_Angle", 0},
				{"Distance", 0}
			},
			{
				{"Linear_Velocity", 0},
				{"Steering_Angle", 0},
				{"Distance", 0}
			},
			{
				{"Linear_Velocity", 0},
				{"Steering_Angle", 0},
				{"Distance", 0}
			},
			{
				{"Linear_Velocity", 0},
				{"Steering_Angle", 0},
				{"Distance", 0}
			}}};
	}
	else
	{
		float *local_path=trajectory(global_path, speed_max, grid_block_size, GBAT_wheel_base, theta_max, pose);
		local_path_plan={
			
				{"timeStamp", time(0)},
				{"name","Planner PC"},
				{"Data", 				
			{
				{"Linear_Velocity", *(local_path)},
				{"Steering_Angle", *(local_path+1)},
				{"Distance", *(local_path+2)}
			},
			{
				{"Linear_Velocity", *(local_path+3)},
				{"Steering_Angle", *(local_path+4)},
				{"Distance", *(local_path+5)}
			},
			{
				{"Linear_Velocity", *(local_path+6)},
				{"Steering_Angle", *(local_path+7)},
				{"Distance", *(local_path+8)}
			},
			{
				{"Linear_Velocity", *(local_path+9)},
				{"Steering_Angle", *(local_path+10)},
				{"Distance", *(local_path+11)}
			},
			{
				{"Linear_Velocity", *(local_path+12)},
				{"Steering_Angle", *(local_path+13)},
				{"Distance", *(local_path+14)}
			}}};
	};
	
		
	string path=local_path_plan.dump();
	
	const char* processed_Data=path.c_str();
	fprintf(stdout, processed_Data);	
	fclose(stdout);
	
	return 0;

}
	
int *global(int grid[65][65], float current_pos[4], float goal_pos[3], int number_of_rows, int number_of_columns)
{

	//  A* search
	
	int current_grid_row=current_pos[0];
	int current_grid_column=current_pos[1];
	
	int goal_grid_row=goal_pos[0];
	int goal_grid_column=goal_pos[1];
	
	int i;
	int j;
	
	int d_row[]={0, 1, 1, 1, 0, -1, -1, -1}; // possible movements in x direction - includes diagonals
	int d_column[]={1, 1, 0, -1, -1, -1, 0, 1}; // possible movements in y direction - includes diagonals
	float d_cost[8]; // cost associated with possible movements
	float cost_goal[number_of_rows][number_of_columns]; // cost from new position to goal
	float cost_total[8]; // total A* cost

	int max_cells=number_of_rows*number_of_columns;
	static int route[4225][2]={current_grid_row, current_grid_column}; //set first waypoint on route as the initial grid location
	int a=0; // index for route storage

	int *route_pntr=&route[0][0];	
		
	if (grid[goal_grid_row][goal_grid_column]==1)
	{
		ofstream pathfile; 
		pathfile.open("trajectory.json", ios::out);
		pathfile<<"{\nYour destination is an obstacle!\n}";
		pathfile.close();
		route[0][0]=-1; // Flag to alert that destination is an obstacle
		return route_pntr;
	}

	for (i=0; i<number_of_rows; i++)
	{
		for (j=0; j<number_of_columns; j++)
		{
			cost_goal[i][j]=sqrt((goal_grid_row-i)*(goal_grid_row-i)+(goal_grid_column-j)*(goal_grid_column-j)); // Calculates distance to goal cost
		}
	}
	for (i=0; i<8; i++)
	{
		d_cost[i]=sqrt(d_row[i]*d_row[i]+d_column[i]*d_column[i]); // Calculates distance to next cell cost
	}
	
	int new_grid_row;
	int new_grid_column;
	int index_reset=0;
	int index;

			
	// repeat until goal is reached
	while (current_grid_row!=goal_grid_row || current_grid_column!=goal_grid_column)
	{
		if (grid[current_grid_row][current_grid_column+1]==1 && grid[current_grid_row+1][current_grid_column+1]==1 && grid[current_grid_row+1][current_grid_column]==1 && grid[current_grid_row+1][current_grid_column-1]==1 && grid[current_grid_row][current_grid_column-1]==1 && grid[current_grid_row-1][current_grid_column-1]==1 && grid[current_grid_row-1][current_grid_column]==1 && grid[current_grid_row-1][current_grid_column+1]==1)
		{
			ofstream pathfile; 
			pathfile.open("trajectory.json", ios::out);
			pathfile<<"{\nYou are surrounded by obstacles and cannot move!\n}";
			pathfile.close();
			route[0][0]=-1; // Flag to alert that you are surrounded by obstacles
			break;
		}
		
		for (i=0; i<8; i++)
		{
			new_grid_row=current_grid_row+d_row[i];
			new_grid_column=current_grid_column+d_column[i];
			(grid[new_grid_row][new_grid_column]==0)? cost_total[i]=d_cost[i]+cost_goal[new_grid_row][new_grid_column]:cost_total[i]=0;
		}
		
		for (i=0; i<7; i++)
		{
			if (cost_total[i]==0)
			{
				index=i+1;
			}
			else
			{
				break;
			}
		}
	
		for (i=index; i<7; i++)
		{
			if (cost_total[i+1]<cost_total[index] && cost_total[i+1]!=0)
			{
				index=i+1;
			}
		}
		
		float penalty=((fabs(current_grid_row-goal_grid_row))+1)*6;		
		cost_goal[current_grid_row][current_grid_column]=cost_goal[current_grid_row][current_grid_column]+penalty;
			
		current_grid_row=current_grid_row+d_row[index];
		current_grid_column=current_grid_column+d_column[index];

		a+=1;
		route[a][0]=current_grid_row;
		route[a][1]=current_grid_column;	


		if (route[a][0]==route[a-2][0] && route[a][1]==route[a-2][1])
		{
			grid[route[a-1][0]][route[a-1][1]]=1;
			a-=2;
		}
	
		index=index_reset;
	}
	

	return route_pntr;
}


float *trajectory(int *global_route, float speed_limit, float cell_size, float wheel_base, float theta_limit, float current_pose[4])
{
// Local coordinate frame uses x-direction from left to right and y-direction from top to bottom of map/grid
	
	int reset=0;
	int length_route=10; // worst case if distance between waypoints equals wheelbase - see waypoint calc below
	int i;
	int max_waypoint_index=((length_route*cell_size)/wheel_base)+3;
	
	float waypoint[20][2]={(*(global_route+1)+0.5)*cell_size, (*global_route+0.5)*cell_size}; // Size of waypoint =20 based on max waypoint index defined above
	int length_waypoint=20; // from waypoint initialisation on line above
	int reset_1=1; 
	int waypoint_index=0; // tracks waypoint index 
	double steering;
	float steering_angle[10]; // Steering angle in radians for the next 10 waypoints
	float linear_velocity[10]; // Throttle position for the next 10 waypoints
	float distance[10]; // time perriod to maintain speed and angular velocity state for the next 10 wayoints
	//cout<<waypoint[0][0];	
	for (i=3; i<length_route*2; i+=2)
	{
		if (*(global_route+i)==*(global_route+i-2))
		{
			int temp=((*(global_route+i-1)-*(global_route+i-3))*cell_size)/wheel_base; //number of increments
			//cout<<"\nTemp1";
			int index=waypoint_index+1;
			int j;
			for (j=index; j<index+abs(temp); j++)
			{
				waypoint[j][1]=waypoint[j-1][1]+(temp/abs(temp))*wheel_base;
				waypoint[j][0]=waypoint[j-1][0];	
			}
			waypoint[j][1]=(*(global_route+i-1)+0.5)*cell_size;
			waypoint[j][0]=waypoint[j-1][0];
			waypoint_index=j;
		}
		else if (*(global_route+i-1)==*(global_route+i-3))
		{
			int temp=((*(global_route+i)-*(global_route+i-2))*cell_size)/wheel_base; //number of increments
			//cout<<"\nTemp2";
			int index=waypoint_index+1;
			int j;
			for (j=index; j<index+abs(temp); j++)
			{
				waypoint[j][1]=waypoint[j-1][1];
				waypoint[j][0]=waypoint[j-1][0]+(temp/abs(temp))*wheel_base;
			}
			waypoint[j][1]=waypoint[j-1][1];
			waypoint[j][0]=(*(global_route+i)+0.5)*cell_size;
			waypoint_index=j;
		}
		else
		{
			int temp=((*(global_route+i)-*(global_route+i-2))*cell_size)/wheel_base; //number of increments using delta x as an approximation
			//cout<<"\nTemp3" <<temp;
			int index=waypoint_index+1;
			int j;
			for (j=index; j<index+abs(temp); j++)
			{
				waypoint[j][0]=waypoint[j-1][0]+(temp/abs(temp))*wheel_base;
				waypoint[j][1]=waypoint[j-1][1]-(((*(global_route+i-1)-*(global_route+i-3))/(*(global_route+i)-*(global_route+i-2)))*wheel_base);			
				//negative sign on gradient is because y direction is positive down instead of positive up
				//cout<<"\n" <<j <<"Waypoint=" <<waypoint[j][0] <<"," <<waypoint[j][1];
			}
			waypoint[j][0]=(*(global_route+i)+0.5)*cell_size;
			waypoint[j][1]=(*(global_route+i-1)+0.5)*cell_size;
			waypoint_index=j;
		}
	}
	
	//cout<<waypoint_index;
	
/* Although the entire route is calculated as a series of waypoints from current position to goal,
the steering angle (heading) and throttle position (speed) is only calculated to get to the "next" waypoint.
The "next" waypoint looks 2 waypoints ahead for curve fitting to prevent sharp turns due to sudden direction changes
which is characteristic of the grid based path planning methodology
The current position is always the first waypoint, hence only waypoint[0][], waypoint[1][] and waypoijnt[2][]
are considered in the trajectory algorithm below 
*/

int goal=length_waypoint-1;


/* calculates the trajectory for the next 5 waypoints - 
looking 2 waypoints ahead implies we consider the next 7 to 9 waypoints depending on whether a curve bypasses a waypoint
*/

	float colinear; // Check if 3 points lie on a straight line using area of triangle method
	int j=0;
	
	for (i=0; i<10; i++) // for next however waypoints -  to be truncated to first 5 control commands
	{
		if (waypoint[i+1][0]==waypoint[i+2][0] && waypoint[i+1][1]==waypoint[i+2][1]) // checks if next waypoint is the goal
		{
			linear_velocity[j]=speed_limit; //  
			steering_angle[j]=0;
			distance[j]=(sqrt(((waypoint[i+1][0]-waypoint[i][0])*(waypoint[i+1][0]-waypoint[i][0]))+((waypoint[i+1][1]-waypoint[i][1])*(waypoint[i+1][1]-waypoint[i][1]))))/3; 
			
			linear_velocity[j+1]=linear_velocity[j]/2; //  
			steering_angle[j+1]=0;
			distance[j+1]=distance[j]; 
			
			linear_velocity[j+2]=linear_velocity[j+1]/2; //  
			steering_angle[j+2]=0;
			distance[j+2]=distance[j]; 
			
			linear_velocity[j+3]=0; //  
			steering_angle[j+3]=0;
			distance[j+3]=0; 
			
			linear_velocity[j+4]=0; //  
			steering_angle[j+4]=0;
			distance[j+4]=0;
			 
			break;
		}
		colinear=(waypoint[i][0]*(waypoint[i+1][1]-waypoint[i+2][1]))+(waypoint[i+1][0]*(waypoint[i+2][1]-waypoint[i][1]))+(waypoint[i+2][0]*(waypoint[i][1]-waypoint[i+1][1]));
	
		if (fabs(colinear)<0.001)
		{
			linear_velocity[j]=speed_limit; 
			steering_angle[j]=0;
			distance[j]=sqrt(((waypoint[i+2][0]-waypoint[i][0])*(waypoint[i+2][0]-waypoint[i][0]))+((waypoint[i+2][1]-waypoint[i][1])*(waypoint[i+2][1]-waypoint[i][1]))); 
			j++;
		}
		else if (waypoint[i+1][1]==waypoint[i][1] && waypoint[i+2][1]>waypoint[i][1])
		{
			for (steering=0.05; steering<theta_limit; steering+=0.05)
			{
				float r1=wheel_base/tan(steering);
				float x0=waypoint[i][0];
				float y0=waypoint[i][1]+r1;
				float r2=sqrt(((waypoint[i+2][0]-x0)*(waypoint[i+2][0]-x0))+((waypoint[i+2][1]-y0)*(waypoint[i+2][1]-y0)));
				float delta=r2-r1;
				float dist_sq=(((waypoint[i+2][0]-waypoint[i][0])*(waypoint[i+2][0]-waypoint[i][0]))+((waypoint[i+2][1]-waypoint[i][1])*(waypoint[i+2][1]-waypoint[i][1]))); // distance squared between i and i+2
				float cos_alpha=(fabs((2*r1*r1-dist_sq)/(2*r1*r1))); // angle subtended by curve between i and i+2 - law of cosines
				float alpha=acos(cos_alpha);
				
				if (fabs(delta)<0.5)
				{
					linear_velocity[j]=speed_limit-((steering/theta_limit)*speed_limit)+1; // inversely proportional to steering angle 
					(waypoint[i+1][0]<waypoint[i][0])?steering_angle[j]=(-1)*steering:steering_angle[j]=steering;
					distance[j]=r1*fabs(alpha); 
					i+=1;
					j++;
					break;
				}
			}
		}
		else if (waypoint[i+1][1]==waypoint[i][1] && waypoint[i+2][1]<waypoint[i][1])
		{
			for (steering=0.05; steering<theta_limit; steering+=0.05)
			{
				float r1=wheel_base/tan(steering);
				float x0=waypoint[i][0];
				float y0=waypoint[i][1]-r1;
				float r2=sqrt(((waypoint[i+2][0]-x0)*(waypoint[i+2][0]-x0))+((waypoint[i+2][1]-y0)*(waypoint[i+2][1]-y0)));
				float delta=r2-r1;
				float dist_sq=(((waypoint[i+2][0]-waypoint[i][0])*(waypoint[i+2][0]-waypoint[i][0]))+((waypoint[i+2][1]-waypoint[i][1])*(waypoint[i+2][1]-waypoint[i][1]))); // distance squared between i and i+2
				float cos_alpha=(fabs((2*r1*r1-dist_sq)/(2*r1*r1))); // angle subtended by curve between i and i+2 - law of cosines
				float alpha=acos(cos_alpha);
				
				if (fabs(delta)<0.5)
				{
					linear_velocity[j]=speed_limit-((steering/theta_limit)*speed_limit)+1;  
					(waypoint[i+1][0]<waypoint[i][0])?steering_angle[j]=steering:steering_angle[j]=(-1)*steering;
					distance[j]=r1*fabs(alpha); 
					i+=1;
					j++;
					break;
				}
			}
		}
		else if (waypoint[i+1][0]==waypoint[i][0] && waypoint[i+2][0]>waypoint[i][0])
		{
			for (steering=0.05; steering<theta_limit; steering+=0.05)
			{
				float r1=wheel_base/tan(steering);
				float x0=waypoint[i][0]+r1;
				float y0=waypoint[i][1];
				float r2=sqrt(((waypoint[i+2][0]-x0)*(waypoint[i+2][0]-x0))+((waypoint[i+2][1]-y0)*(waypoint[i+2][1]-y0)));
				float delta=r2-r1;
				float dist_sq=(((waypoint[i+2][0]-waypoint[i][0])*(waypoint[i+2][0]-waypoint[i][0]))+((waypoint[i+2][1]-waypoint[i][1])*(waypoint[i+2][1]-waypoint[i][1]))); // distance squared between i and i+2
				float cos_alpha=(fabs((2*r1*r1-dist_sq)/(2*r1*r1))); // angle subtended by curve between i and i+2 - law of cosines
				float alpha=acos(cos_alpha);
				
				if (fabs(delta)<0.5)
				{
					linear_velocity[j]=speed_limit-((steering/theta_limit)*speed_limit)+1;  
					(waypoint[i+1][1]<waypoint[i][1])?steering_angle[j]=steering:steering_angle[j]=(-1)*steering;
					distance[j]=r1*fabs(alpha); 
					i+=1;
					j++;
					break;
				}
			}
			
		}
		else if (waypoint[i+1][0]==waypoint[i][0] && waypoint[i+2][0]<waypoint[i][0])
		{
			for (steering=0.05; steering<theta_limit; steering+=0.05)
			{
				float r1=wheel_base/tan(steering);
				float x0=waypoint[i][0]-r1;
				float y0=waypoint[i][1];
				float r2=sqrt(((waypoint[i+2][0]-x0)*(waypoint[i+2][0]-x0))+((waypoint[i+2][1]-y0)*(waypoint[i+2][1]-y0)));
				float delta=r2-r1;
				float dist_sq=(((waypoint[i+2][0]-waypoint[i][0])*(waypoint[i+2][0]-waypoint[i][0]))+((waypoint[i+2][1]-waypoint[i][1])*(waypoint[i+2][1]-waypoint[i][1]))); // distance squared between i and i+2
				float cos_alpha=(fabs((2*r1*r1-dist_sq)/(2*r1*r1))); // angle subtended by curve between i and i+2 - law of cosines
				float alpha=acos(cos_alpha);
				
				if (fabs(delta)<0.5)
				{
					linear_velocity[j]=speed_limit-((steering/theta_limit)*speed_limit)+1; 
					(waypoint[i+1][1]<waypoint[i][1])?steering_angle[j]=(-1)*steering:steering_angle[j]=steering;
					distance[j]=r1*fabs(alpha); 
					i+=1;
					j++;
					break;
				}
			}
		}
			
	}
		
	static float path_plan[8][3];
	
	for (i=0; i<5; i++)
	{
		path_plan[i][0]=linear_velocity[i];
		path_plan[i][1]=steering_angle[i];
		path_plan[i][2]=distance[i];
	}
	
	float *path_plan_pntr=&path_plan[0][0];

	return path_plan_pntr;
}



