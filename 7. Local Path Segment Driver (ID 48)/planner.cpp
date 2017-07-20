#include <stdio.h>

using namespace std;

int main() {

	 char received_Data [8192];
   char* processed_Data;

     //printf("Hello from Planner!!");
     
 // The Application waits for the data from the world model in a string format
 // The  received data will be stored in the received_Data variable(buffer)
 //----------------------------------------------------------------------------

  //gets( received_Data);     // warning: unsafe (see fgets instead)
  fgets(received_Data, sizeof(received_Data), stdin);
  fprintf(stderr, received_Data);
 // printf ("receined data => ");
 // printf(received_Data);


// Now, do your Processing and store it as a Jason String in processed_Data variable
// here below is just an example to be formatted correctly according to the application
// requirements
//-----------------------------------------------------------------------------------

processed_Data ="{\"Data\":[{\"Distance\":72.8000106811523,\"Linear_Velocity\":11,\"Steering_Angle\":0.0},{\"Distance\":5.19999694824219,\"Linear_Velocity\":10.1666669845581,\"Steering_Angle\":0.0},{\"Distance\":9.84336280822754,\"Linear_Velocity\":10.1666669845581,\"Steering_Angle\":0.100000001490116},{\"Distance\":112.462554931641,\"Linear_Velocity\":11,\"Steering_Angle\":0.0},{\"Distance\":107.262580871582,\"Linear_Velocity\":11,\"Steering_Angle\":0.0}],\"name\":\"Planner PC\",\"timeStamp\":1499773918}";

// Send the result to the Node.js parent process with the 'stdout' event
//------------------------------------------------------------------------

fprintf(stdout, processed_Data);

// the following code is for debug purposes: use the 'stderr' event to display
// the received data inside the C++ child process to be commented out in the production
//version of the code
//-------------------------------------------------------------------------------------

fprintf(stderr, received_Data);
fclose(stdout);
}
