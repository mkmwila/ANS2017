/* Joining and leaving the room is done on the server
===================================================== */
//1. Joining a room
//-------------------
socket.join('roomName');

//2. to leave the room
//----------------------
socket.leave ('roomName');

//2. to send  message to everymember of the room
//-----------------------------------------------
// note here that an acknowledgement
io.to('roomName').emit ('eventName', data, () =>{}); 

// to send message eo everyone in the room  except the sender 
//------------------------------------------------------------
socket.broadcast.to('roomName').emit('eventName', data, () =>{}); 

// to send the message to the sender only in the room
//----------------------------------------------------
// no reason to target a room
socket.emit('eventName', data, () =>{});  

// rooms as applied to the JAUS application
//=========================================

// 1. every node joins a room named after the node ID
// when targeting that node, the server just use the method
socket.broadcast.to('node.id').emit





/*

5	Component Definitions	18
5.1	COMMAND AND CONTROL COMPONENTS	18
5.1.1	System Commander (ID 40)	18
5.1.2	Subsystem Commander (ID 32)	19
5.2	COMMUNICATIONS COMPONENTS	19
5.2.1	Communicator (ID 35)	19
5.3	PLATFORM COMPONENTS	20
5.3.1	Global Pose Sensor (ID 38)	20
5.3.2	Local Pose Sensor (ID 41)	20
5.3.3	Velocity State Sensor (ID 42)	21
5.3.4	Primitive Driver (ID 33)	22
5.3.5	Reflexive Driver (ID 43)	22
5.3.6	Global Vector Driver (ID 34)	23
5.3.7	Local Vector Driver (ID 44)	25
5.3.8	Global Waypoint Driver (ID 45)	27
5.3.9	Local Waypoint Driver (ID 46)	28
5.3.10	Global Path Segment Driver (ID 47)	30
5.3.11	Local Path Segment Driver (ID 48)	34

5.5	ENVIRONMENT SENSOR COMPONENTS	47
5.5.1	Visual Sensor (ID 37)	47
5.5.2	Range Sensor (ID 50)	48
5.5.3	World Model Vector Knowledge Store (ID 61)	48
5.6	PLANNING COMPONENTS	50
5.6.1	Mission Planner	51
5.6.2	Mission Spooler (36)	51
*/


