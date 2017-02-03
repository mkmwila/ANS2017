#include <stdio.h>

using namespace std;

int main() {

	 char received_Data [7000];
     char* processed_Data;

     printf("Hello from Planner!!");
     
 // The Application waits for the data from the world model in a string format
 // The  received data will be stored in the received_Data variable(buffer)
 //----------------------------------------------------------------------------

  fgets (received_Data);     // warning: unsafe (see fgets instead)
  printf(received_Data);


// Now, do your Processing and store it as a Jason String in processed_Data variable
// here below is just an example to be formatted correctly according to the application
// requirements
//-----------------------------------------------------------------------------------

processed_Data = "{\"timeStamp\":145879652,\"name\":\"Planner PC\",\"Data\":[1,8,7,9,5]}";

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
