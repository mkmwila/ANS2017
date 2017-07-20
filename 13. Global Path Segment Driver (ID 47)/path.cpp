/*
 * Path.cpp
 *
 *  	Created on: 22 May 2017
 *      Author    : Ajith Gopal
 *      Project   : GBATT Autonomous Navigation
 *		Compiler: Dev-C++ 5.11
 */
 
#include <iostream>
#include <iomanip>
#include <queue>
#include <string>
#include <math.h>
#include <ctime>
#include <cstdlib>
#include <stdio.h>
#include <fstream>
#include <json.hpp>
#include <sstream>
#include <chrono>

using namespace std;
using namespace std::chrono;
using namespace nlohmann;


const int n=24; //initialisation of horizontal size of the map
const int m=12; //initialisation of vertical size size of the map
static int trav_map[n][m];
// if dir==8
//{
	const int dir=8; // number of possible directions to go at any position
	static int dx[dir]={1, 1, 0, -1, -1, -1, 0, 1};
	static int dy[dir]={0, 1, 1, 1, 0, -1, -1, -1};
//}
/* uncomment if you only want to use 4 directions
if dir==4
{	
	static int dir=4;
	static int dx[dir]={1, 0, -1, 0};
	static int dy[dir]={0, 1, 0, -1};
}
*/
static char c;


// A-star algorithm.
// The route returned is a string of direction digits.
int *pathFind( const int & xStart, const int & yStart, 
                 const int & xFinish, const int & yFinish )
{
    int current_grid_y=yStart; //Set  current position to start
	int current_grid_x=xStart;
	
	int goal_grid_y=yFinish; // Set goal position
	int goal_grid_x=xFinish;
		
	int i;
	int j;
	
	float d_cost[8]; // cost associated with possible movements
	float cost_goal[n][m]; // cost to goal for each position on map
	float cost_total[8]; // total A* cost

	int max_cells=m*n; // maximum cells in map
	static int route[4225][2]; //maximum possible size of route - should be max_cells but c++ does not waant to accept the variable hence 4225

	route[1][0]=current_grid_x; 
	route[1][1]=current_grid_y;

	int *route_pntr=&route[0][0]; // Declares and initialises pointer to return
	int a=1; // index for route storage
		
	if (trav_map[goal_grid_x][goal_grid_y]==1) //Returns an eror flag if the goal is an obstacle
	{
		ofstream pathfile; 
		pathfile.open("trajectory.json", ios::out);
		pathfile<<"{\nYour destination is an obstacle!\n}";
		pathfile.close();
		route[0][0]=-1;
		return route_pntr;
	}

	for (i=0; i<n; i++)
	{
		for (j=0; j<m; j++)
		{
			cost_goal[i][j]=sqrt((goal_grid_x-i)*(goal_grid_x-i)+(goal_grid_y-j)*(goal_grid_y-j)); // Calculates distance to goal cost
		}
	}
	for (i=0; i<8; i++)
	{
		d_cost[i]=sqrt(dy[i]*dy[i]+dx[i]*dx[i]); // Calculates distance to next cell cost
	}
	
	int new_grid_x; // Possible new x-position
	int new_grid_y; // Possible new y-position
	int index_reset=0; //reset variable
	int index=0; // Tracks position of lowest cost grid option
	
	// repeat until goal is reached
	while (!(current_grid_x==goal_grid_x && current_grid_y==goal_grid_y)) //Repeat until goal is reached
	{
		if (trav_map[current_grid_x][current_grid_y+1]==1 && trav_map[current_grid_x+1][current_grid_y+1]==1 && trav_map[current_grid_x+1][current_grid_y]==1 && trav_map[current_grid_x+1][current_grid_y-1]==1 && trav_map[current_grid_x][current_grid_y-1]==1 && trav_map[current_grid_x-1][current_grid_y-1]==1 && trav_map[current_grid_x-1][current_grid_y]==1 && trav_map[current_grid_x-1][current_grid_y+1]==1) //Returns eror flag if surrounded by obstacles
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
			new_grid_x=current_grid_x+dx[i];
			new_grid_y=current_grid_y+dy[i];
					
			if(!(new_grid_x<0 || new_grid_x>n-1 || new_grid_y<0 || new_grid_y>m-1))
			{
				(trav_map[new_grid_x][new_grid_y]==0)? cost_total[i]=d_cost[i]+cost_goal[new_grid_x][new_grid_y]:cost_total[i]=0; //calculates total cost of new position
			}
			else
			{
				cost_total[i]=0;
			}
		}
		
		for (i=0; i<7; i++) //moves index to first non-zero position
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
			if (cost_total[i+1]<cost_total[index] && cost_total[i+1]!=0) //finds position of lowes cost grid option
			{
				index=i+1;
			}
		}
		
		float penalty=((fabs(current_grid_y-goal_grid_y))+1)*6;	//calculates a penalty to dissuade moving back to previous positions 	
		cost_goal[current_grid_x][current_grid_y]=cost_goal[current_grid_x][current_grid_y]+penalty;
			
		current_grid_x=current_grid_x+dx[index]; //moves to new grid position
		current_grid_y=current_grid_y+dy[index];

		a+=1;

		route[a][0]=current_grid_x; //adds new position to route
		route[a][1]=current_grid_y;	
		
		if (route[a][0]==route[a-2][0] && route[a][1]==route[a-2][1]) //Removes duplicate waypoints if moved to a previous position
		{
			trav_map[route[a-1][0]][route[a-1][1]]=1;
			a-=2;
		}
		
		for(int n=0;n<a;n++) //Optimises route
		{
			for(i=0;i<8;i++)
			{
				if (route[a][0]==(route[a-n][0]+dx[i]) && route[a][1]==(route[a-n][1])+dy[i]) //check if new route grid point is ajacent to 2nd previous point
				{
					route[a-n+1][0]=route[a][0]; //move directly from 2nd previous point
					route[a-n+1][1]=route[a][1];
					a=a-n+1;
				}
			}
		}
		index=index_reset;
	}
	
	route[0][0]=a; //appends the size of the route array to the route array
	route[0][1]=a;
	
	return route_pntr;
}


float *trajectory(int *global_route, float speed_limit, float cell_size, float wheel_base, float theta_limit, int xPos, int yPos, int xDest, int yDest)
{
// Local coordinate frame uses x-direction from left to right and y-direction from top to bottom of map/grid
	
	int goal_grid_x=xDest; // same as per global  path above
	int goal_grid_y=yDest;
	int reset=0;
	int length_route=10; // worst case if distance between waypoints equals wheelbase - see waypoint calc below
	int i;
	int max_waypoint_index=((length_route*cell_size)/wheel_base)+3;
	float waypoint[max_waypoint_index][2]={(*(global_route+2)+0.5)*cell_size, (*(global_route+3)+0.5)*cell_size}; // Size of waypoint =20 based on max waypoint index defined above
	int length_waypoint=20; // from waypoint initialisation on line above
	int reset_1=1; 
	int waypoint_index=0; // tracks waypoint index 
	double steering;
	int size_global=*global_route;
	float steering_angle[(3*size_global)]; // Steering angle in radians for the next ?? waypoints
	float linear_velocity[(3*size_global)]; // Throttle position for the next ?? waypoints
	float distance[(3*size_global)]; // time perriod to maintain speed and angular velocity state for the next ?? wayoints
	
/* Although the entire route is calculated as a series of waypoints from current position to goal,
the steering angle (heading) and throttle position (speed) is only calculated to get to the "next" waypoint.
The "next" waypoint looks 2 waypoints ahead for curve fitting to prevent sharp turns due to sudden direction changes
which is characteristic of the grid based path planning methodology
The current position is always the first waypoint, hence only waypoint[0][], waypoint[1][] and waypoijnt[2][]
are considered in the trajectory algorithm below 

Calculates the trajectory for the next 5 waypoints - 
looking 2 waypoints ahead implies we consider the next 7 to 9 waypoints depending on whether a curve bypasses a waypoint
*/

	float colinear; // Check if 3 points lie on a straight line using area of triangle method
	int j=0;
	float current_x=(*(global_route+2)+0.5)*cell_size; // start y position
	float current_y=(*(global_route+3)+0.5)*cell_size; // start x position
		
	for (i=4; i<(2*size_global+1); i+=2) // for next however waypoints - use i<(2*size_global+1) for complete trajectory - to be truncated to first 5 control commands
	{
		if (*(global_route+i)==goal_grid_x && *(global_route+i+1)==goal_grid_y) // checks if next waypoint is the goal
		{
			linear_velocity[j]=speed_limit; //  
			steering_angle[j]=0;
			distance[j]=(sqrt((((*(global_route+i+1)+0.5)*cell_size-current_x)*((*(global_route+i+1)+0.5)*cell_size-current_x))+(((*(global_route+i)+0.5)*cell_size-current_y)*((*(global_route+i)+0.5)*cell_size-current_y))))/3; 
			
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
			
			j=j+5;
			 
			break;
		}
		
		colinear=(*(global_route+i-2)*(*(global_route+i+1)-*(global_route+i+3)))+(*(global_route+i)*(*(global_route+i+3)-*(global_route+i-1)))+(*(global_route+i+2)*(*(global_route+i-1)-*(global_route+i+1))); //Checks colinearity of next three points
		
		if (fabs(colinear)<0.001)
		{
			linear_velocity[j]=speed_limit; 
			steering_angle[j]=0;
			distance[j]=(sqrt(((((*(global_route+i)+0.5)*cell_size)-current_x)*(((*(global_route+i)+0.5)*cell_size)-current_x))+((((*(global_route+i+1)+0.5)*cell_size)-current_y)*(((*(global_route+i+1)+0.5)*cell_size)-current_y)))); 
			j++;
			current_x=(*(global_route+i)+0.5)*cell_size; // updates current position
			current_y=(*(global_route+i+1)+0.5)*cell_size; 
		}
		else
		{
				float waypoint0[2]={current_x,current_y}; // current absolute position
				float waypoint_grid[2]={(*(global_route+i)+0.5)*cell_size,(*(global_route+i+1)+0.5)*cell_size}; //next grid point absolute position
				float waypoint_grid_next[2]={(*(global_route+i+2)+0.5)*cell_size,(*(global_route+i+3)+0.5)*cell_size}; // third grid point absolute position
			
				float vect_a1=(waypoint_grid[0]-waypoint0[0]); //Used for cross product - x component of vector A (current to grid)
				float vect_a2=(waypoint_grid[1]-waypoint0[1]);
				float vect_b1=(waypoint_grid_next[0]-waypoint_grid[0]); //Used for cross product - x component of vector B (grid to grid next)
				float vect_b2=(waypoint_grid_next[1]-waypoint_grid[1]);
				
				float cross_product=(vect_a1*vect_b2)-(vect_a2*vect_b1); // z component of 3D cross product. Shows direction which is used to determine turning direction
				
				float cos_theta=fabs((waypoint_grid[0]-waypoint0[0])/(sqrt((waypoint_grid[0]-waypoint0[0])*(waypoint_grid[0]-waypoint0[0])+(waypoint_grid[1]-waypoint0[1])*(waypoint_grid[1]-waypoint0[1])))); //theta is angle of line joining current to next point to horizontal
				float sin_theta=sqrt(1-(cos_theta*cos_theta));
				
				float cos_gamma=fabs((waypoint_grid_next[0]-waypoint_grid[0])/(sqrt((waypoint_grid_next[0]-waypoint_grid[0])*(waypoint_grid_next[0]-waypoint_grid[0])+(waypoint_grid_next[1]-waypoint_grid[1])*(waypoint_grid_next[1]-waypoint_grid[1])))); //gamma is angle of line joining next point to 2nd next point to horizontal
				float cos_gamma1=(waypoint_grid_next[0]-waypoint_grid[0])/(sqrt((waypoint_grid_next[0]-waypoint_grid[0])*(waypoint_grid_next[0]-waypoint_grid[0])+(waypoint_grid_next[1]-waypoint_grid[1])*(waypoint_grid_next[1]-waypoint_grid[1])));
				float gamma=acos(cos_gamma1);
				float sin_gamma=sqrt(1-(cos_gamma*cos_gamma));
				float sin_gamma1=sin(gamma);
				
				float pi=3.141593;
				
				float waypoint1[2]; //point to start reducing speed before cornering
				float waypoint2[2]; //point to start cornering
				float waypoint3[2]; //point to exit corner
				float x0; //position of turn center
				float y0;
			
			for (steering=0.05; steering<theta_limit; steering+=0.05)
			{
				float r1=wheel_base/tan(steering);
				int turn=4; // wheel base multiple to allow for start of turning
				int reduced=turn*2; //wheel base multiple to start slowing down for turn
				
				if (waypoint_grid[0]>=waypoint0[0] && waypoint_grid[1]<=waypoint0[1]) // first quadrant - y is positive downward
				{
					waypoint1[0]=(waypoint_grid[0]-(reduced*wheel_base)*cos_theta);
					waypoint1[1]=(waypoint_grid[1]+(reduced*wheel_base)*sin_theta);
					waypoint2[0]=(waypoint_grid[0]-(turn*wheel_base)*cos_theta);
					waypoint2[1]=(waypoint_grid[1]+(turn*wheel_base)*sin_theta);
				}
				
				else if (waypoint_grid[0]<waypoint0[0] && waypoint_grid[1]<=waypoint0[1]) // second quadrant
				{
					waypoint1[0]=(waypoint_grid[0]+(reduced*wheel_base)*cos_theta); 
					waypoint1[1]=(waypoint_grid[1]+(reduced*wheel_base)*sin_theta);
					waypoint2[0]=(waypoint_grid[0]+(turn*wheel_base)*cos_theta);
					waypoint2[1]=(waypoint_grid[1]+(turn*wheel_base)*sin_theta);
				}
				
				else if (waypoint_grid[0]<waypoint0[0] && waypoint_grid[1]>waypoint0[1]) // third quadrant
				{
					waypoint1[0]=(waypoint_grid[0]+(reduced*wheel_base)*cos_theta); 
					waypoint1[1]=(waypoint_grid[1]-(reduced*wheel_base)*sin_theta);
					waypoint2[0]=(waypoint_grid[0]+(turn*wheel_base)*cos_theta);
					waypoint2[1]=(waypoint_grid[1]-(turn*wheel_base)*sin_theta);
				}
				
				else if (waypoint_grid[0]>=waypoint0[0] && waypoint_grid[1]>waypoint0[1]) // fourth quadrant
				{
					waypoint1[0]=(waypoint_grid[0]-(reduced*wheel_base)*cos_theta); //sin is negative
					waypoint1[1]=(waypoint_grid[1]-(reduced*wheel_base)*sin_theta);
					waypoint2[0]=(waypoint_grid[0]-(turn*wheel_base)*cos_theta);
					waypoint2[1]=(waypoint_grid[1]-(turn*wheel_base)*sin_theta);
				}
				
			
				if (waypoint_grid_next[0]>=waypoint_grid[0] && waypoint_grid_next[1]<=waypoint_grid[1]) // first quadrant - y is positive downward
				{
					waypoint3[0]=(waypoint_grid[0]+(turn*wheel_base)*cos_gamma);
					waypoint3[1]=(waypoint_grid[1]-(turn*wheel_base)*sin_gamma);
					x0=waypoint2[0]+(r1*sin_theta);
					y0=waypoint2[1]-(r1*cos_theta);
				}
				
				else if (waypoint_grid_next[0]<waypoint_grid[0] && waypoint_grid_next[1]<=waypoint_grid[1]) // second quadrant - y is positive downward
				{
					waypoint3[0]=(waypoint_grid[0]-(turn*wheel_base)*cos_gamma);
					waypoint3[1]=(waypoint_grid[1]-(turn*wheel_base)*sin_gamma);
					x0=waypoint2[0]-(r1*sin_theta);
					y0=waypoint2[1]-(r1*cos_theta);
				}
				
				else if (waypoint_grid_next[0]<waypoint_grid[0] && waypoint_grid_next[1]>waypoint_grid[1]) // third quadrant - y is positive downward
				{
					waypoint3[0]=(waypoint_grid[0]-(turn*wheel_base)*cos_gamma);
					waypoint3[1]=(waypoint_grid[1]+(turn*wheel_base)*sin_gamma);
					x0=waypoint2[0]-(r1*sin_theta);
					y0=waypoint2[1]+(r1*cos_theta);
				}
				
				else if (waypoint_grid_next[0]>=waypoint_grid[0] && waypoint_grid_next[1]>waypoint_grid[1]) // fourth quadrant - y is positive downward
				{
					waypoint3[0]=(waypoint_grid[0]+(turn*wheel_base)*cos_gamma);
					waypoint3[1]=(waypoint_grid[1]+(turn*wheel_base)*sin_gamma);
					x0=waypoint2[0]+(r1*sin_theta);
					y0=waypoint2[1]+(r1*cos_theta);
				}
				
				current_x=waypoint3[0]; // current x position
				current_y=waypoint3[1]; // current y position
				
				float r2=sqrt(((waypoint3[0]-x0)*(waypoint3[0]-x0))+((waypoint3[1]-y0)*(waypoint3[1]-y0)));
				float delta=r2-r1;
				float dist_sq=(((waypoint3[0]-waypoint2[0])*(waypoint3[0]-waypoint2[0]))+((waypoint3[1]-waypoint2[1])*(waypoint3[1]-waypoint2[1]))); // distance squared between i and i+2
				float cos_alpha=(fabs((2*r1*r1-dist_sq)/(2*r1*r1))); // angle subtended by curve between i and i+2 - law of cosines
				float alpha=acos(cos_alpha);
				
				if (fabs(delta)<0.5)
				{
					linear_velocity[j]=speed_limit; // max speed until waypoint before entering turn 
					steering_angle[j]=0;
					distance[j]=sqrt((waypoint1[0]-waypoint0[0])*(waypoint1[0]-waypoint0[0])+(waypoint1[1]-waypoint0[1])*(waypoint1[1]-waypoint0[1])); 
					linear_velocity[j+1]=speed_limit-((steering/theta_limit)*speed_limit)+1; //reduce speed to cornering speed
					steering_angle[j+1]=0;
					distance[j+1]=sqrt((waypoint2[0]-waypoint1[0])*(waypoint2[0]-waypoint1[0])+(waypoint2[1]-waypoint1[1])*(waypoint2[1]-waypoint1[1])); 
					linear_velocity[j+2]=speed_limit-((steering/theta_limit)*speed_limit)+1; // inversely proportional to steering angle 
					(cross_product>0)?steering_angle[j+2]=steering:steering_angle[j+2]=(-1)*steering;
					distance[j+2]=r1*fabs(alpha); 
					j+=3;
					break;
				}
			}
		}
	}
			
	static float path_plan[8][3];
	
	for (i=0; i<j; i++)
	{
		path_plan[i][0]=linear_velocity[i];
		path_plan[i][1]=steering_angle[i];
		path_plan[i][2]=distance[i];
	}
	
	float *path_plan_pntr=&path_plan[0][0];

	return path_plan_pntr;
}

int main(int argc, char** argv) {
	
	steady_clock::time_point start=steady_clock::now();

	char received_Data [7512];
	gets (received_Data);
 	fprintf(stderr, received_Data);
 
//  Use the string below to simulate input from World Model. Need to comment out above 3 lines that is receiving data
// Case Study 1
// 	string received_Data=R"({"from":"worldModel","location":{"x":4,"y":-2,"r":4.5},"to":"planner","speed":11.11,"destination":{"x":21,"y":-1,"r":2.5},"map":{"rows":12,"columns":24,"gridSize":83.2,"traversability":[[0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]},"_id":"587b406b4f23ca6998ea6520","__v":0})";	 	
// Case Study 2
//	string received_Data=R"({"from":"worldModel","location":{"x":9,"y":-2,"r":4.5},"to":"planner","speed":11.11,"destination":{"x":22,"y":-7,"r":2.5},"map":{"rows":12,"columns":24,"gridSize":83.2,"traversability":[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]},"_id":"587b406b4f23ca6998ea6520","__v":0})";
// Case Study 3
//	string received_Data=R"({"from":"worldModel","location":{"x":4,"y":-6,"r":4.5},"to":"planner","speed":11.11,"destination":{"x":18,"y":-6,"r":2.5},"map":{"rows":12,"columns":24,"gridSize":83.2,"traversability":[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]},"_id":"587b406b4f23ca6998ea6520","__v":0})";
// Case Study 4
//	string received_Data=R"({"from":"worldModel","location":{"x":4,"y":-6,"r":4.5},"to":"planner","speed":11.11,"destination":{"x":19,"y":-6,"r":2.5},"map":{"rows":12,"columns":24,"gridSize":83.2,"traversability":[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0],[0,0,0,1,1,1,1,0,0,1,0,0,1,1,0,1,1,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1,0,1,0,0,0],[0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]},"_id":"587b406b4f23ca6998ea6520","__v":0})";
// Case Study 5
//	string received_Data=R"({"from":"worldModel","location":{"x":6,"y":-5,"r":4.5},"to":"planner","speed":11.11,"destination":{"x":17,"y":-8,"r":2.5},"map":{"rows":12,"columns":24,"gridSize":83.2,"traversability":[[0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,1,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0],[0,0,1,0,1,1,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0],[0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,1,1,1,1,1,1,0,1,0],[0,0,1,0,1,1,1,1,1,0,1,0,0,0,1,0,0,0,0,0,1,0,1,0],[0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,1,0,1,0,1,0],[0,0,1,1,1,1,1,1,1,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0]]},"_id":"587b406b4f23ca6998ea6520","__v":0})";
// Case Study 6
//	string received_Data=R"({"from":"worldModel","location":{"x":1,"y":0,"r":4.5},"to":"planner","speed":11.11,"destination":{"x":22,"y":-10,"r":2.5},"map":{"rows":12,"columns":24,"gridSize":83.2,"traversability":[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,1,1,0,0,0,1,0,0,1,1,0,0,0,1,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],[0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0],[0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,0],[0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0]]},"_id":"587b406b4f23ca6998ea6520","__v":0})";
// Case Study 7
//	string received_Data=R"({"from":"worldModel","location":{"x":1,"y":-1,"r":4.5},"to":"planner","speed":11.11,"destination":{"x":21,"y":-10,"r":2.5},"map":{"rows":12,"columns":24,"gridSize":83.2,"traversability":[[0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],[0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],[0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,1,1,1,1,1,0,0,1,0,0,0,1,1,1,1,1,0,1,1,1,1],[0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,0,0],[0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0],[0,1,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0],[0,1,0,0,0,1,0,1,0,0,0,0,0,1,0,0,1,0,0,1,1,1,0,0],[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]]},"_id":"587b406b4f23ca6998ea6520","__v":0})";
// Case Study 8
//	string received_Data=R"({"from":"worldModel","location":{"x":2,"y":-5,"r":4.5},"to":"planner","speed":11.11,"destination":{"x":21,"y":-5,"r":2.5},"map":{"rows":12,"columns":24,"gridSize":83.2,"traversability":[[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0],[0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0]]},"_id":"587b406b4f23ca6998ea6520","__v":0})";


	json input_data;
	input_data=json::parse(received_Data);

	float grid_block_size; // size of square cell in meters - input from path planner pc
	int map_rows;
	int map_columns;
	
	map_rows=input_data.at("map").at("rows");
	map_columns=input_data.at("map").at("columns");
	
	for (int j=0; j<m; j++)
	{
		for (int i=0; i<n; i++)
		{
			trav_map[i][j]=input_data.at("map").at("traversability")[j][i]; // extract traversibility grid into array for internal processing
		//	cout<<trav_map[i][j];
		}
		//cout<<"\n";
	}
	
	int temp_y1=input_data.at("location").at("y"); 
	int temp_y2=input_data.at("destination").at("y");
	int xA, yA, rA, sA, xB, yB, rB; // x is x-position, y is y-position, r is orientation and s is speed. A is reference to current pose and B is reference to goal pose
	
	grid_block_size=input_data.at("map").at("gridSize");
	xA=input_data.at("location").at("x");
	yA=(-1)*temp_y1; // y input from world model is in negative direction
	rA=input_data.at("location").at("r");
	sA=input_data.at("speed");
	xB=input_data.at("destination").at("x");
	yB=(-1)*temp_y2;
	rB=input_data.at("destination").at("r");

//   cout<<"Map Size (X,Y): "<<n<<","<<m<<endl;
//    cout<<"Start: "<<xA<<","<<yA<<endl;
//    cout<<"Finish: "<<xB<<","<<yB<<endl;
    
    steady_clock::time_point start_global=steady_clock::now();
    int *global_path=pathFind(xA, yA, xB, yB);
    steady_clock::time_point end_global=steady_clock::now();
    
    double time_global=duration_cast<microseconds>(end_global-start_global).count();
    
	const float GBAT_wheel_base=1.3; // vehicle wheel base in meters 
	const float theta_max=0.6; // max possible steering angle ~34deg
	const float speed_max=11; // speed limit to 40km/h
		
	json local_path_plan;
	
	cout<<"\n";
	
	double time_trajectory;
	
	if (*global_path==-1)
	{
		cout<<"No Route Found";
		local_path_plan={
				
			
				{"timeStamp", time(0)},
				{"name","Planner PC"},
				{"Data",{
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
					}
					
					}
				}
				};
	}
	else
	{
		steady_clock::time_point start_trajectory=steady_clock::now();
        float *local_path=trajectory(global_path, speed_max, grid_block_size, GBAT_wheel_base, theta_max, xA, yA, xB, yB);
		steady_clock::time_point end_trajectory=steady_clock::now();
		
		time_trajectory=duration_cast<microseconds>(end_trajectory-start_trajectory).count();
		
		local_path_plan={
				{"timeStamp", time(0)},
				{"name","Planner PC"},
				{"Data",{
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
					}
					
					}
				}
				};
	};
	
	string path=local_path_plan.dump(); //converts local_path_plan to string
	
	const char* processed_Data=path.c_str();
	fprintf(stdout, processed_Data);	// sends data and also prints to screen
	steady_clock::time_point end=steady_clock::now();
	
//	cout<<"\nTime to calculate the global route (us): "<<time_global<<endl;
//	cout<<"Time to calculate the trajectory (us): "<<time_trajectory<<endl;
//	cout<<"Total Processing Time (us): "<<duration_cast<microseconds>(end-start).count()<<endl;
//	cout<<"\n";
	
	fclose(stdout);

		
	return 0;

}
	





