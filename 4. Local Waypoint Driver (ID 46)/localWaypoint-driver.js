/*  File :local-waypointDriver.js
  ==========================================================================
	Component ID = 44
	Function : 

    It is implemented in Node.js as a socket-io clients  connecting to a server 
    running on the communicator node.

	Author : Martin K. Mwila
    Title : Senior Electronic Engineer.
    Company : CSIR - DPSS - Landward Sciences
    Project : G-Bat Autonomous Navigation System
    Date  : 10-Jan-2017
    ==========================================================================*/
const moment = require('moment');
const io = require('socket.io-client');
const socket = io.connect('C6-MiFi.:3000', { reconnect: true });  // replaced the ip address 

   var me = {
    id: 44,
    name: 'Local Waypoint Driver'
};
var systemTree = [me];

console.log('\n\n***** Local Waypoint Driver is Running! *****\n')
//==================================================================================================================
//                                          Connecting to the G-Bat Network
//==================================================================================================================
socket.on('connect', () => { // begining of the connection estalished block of code
    // display a message on the console
    console.log('\n\n => Connection to the G-Bat Network has been established!!\n\n');
    // console.log(sensorIo);

    socket.on('register', (regData, identify) => {
        identify(me);
    });

    socket.on('registration', (regInfo) => {
        console.log(`\n => A ${regInfo.name} has connected to the G-Bat Network!`);
    });

    socket.on('deregistration', (regInfo) => {
        console.log(`\n => A ${regInfo.name} has disconnected from the G-Bat Network!`);
    });

    socket.on('systemUpdate', (update) => {

        systemTree = update;
        console.log('\n\n => Connected Nodes: ', JSON.stringify(systemTree, null, 4));

    });



    // Hanling disconnection
    //----------------------
    socket.on('disconnect', () => {
        console.log('Connection to the G-Bat network has been terminated!');
    });

//==================================================================================================================
//                                          2.Handling messages
//==================================================================================================================

    // 2.1 SetTravelSpeed : Message ID = 040Ah
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the set 
    // set the travel speed

    socket.on('040Ah', (nodeInfo) => {
        var travelSpeed = nodeinfo.data;
        nodeInfo.messageID = '4400h';
        nodeInfo.data = travelSpeed; // ideally update with data readfrom hardware
        nodeInfo.sequenceNo = 1;

        console.log('\n\n => Setting Travel Speed...\n\n');

    });

    // 2.2  ExecuteList : Message ID = 041Eh
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the set command
    // execute the list as set in nodeInfo.data

    socket.on('041Eh', (nodeInfo) => {
        var ExecuteList = nodeinfo.data;
        nodeInfo.messageID = '4400h';
        nodeInfo.sequenceNo = 1;

        console.log('\n\n =>Executing  List...\n\n');

        nodeInfo.data = ExecuteList; // ideally update with executed list and status ( probably in a loop)
    });

 // 2.3 QueryTravelSpeed : Message ID = 240Ah
    //----------------------------------------------------
    // Respond with message ID : 440Ah => ReportTravelSpeed
    socket.on('240Ah', (nodeInfo) => {
    // log to console -> can also log to file
    console.log(`\n\n =>  Query of Travel Speed received  from ${nodeInfo.sender.name}!`);
    console.log(`\null => sending Travel Speed data to ${nodeInfo.sender.name}...`); 

    // get Global Pose data from hardware. Here we use dummy data    
        var LPoseData = {
            "Timestamp": Date.now(),
            "x": 15,
            "y": -25,
            "r": 20.5,
            "speed": 1.3
        };
    // Format the packet to send  
        nodeInfo.messageID = '440Ah';
        nodeInfo.data = LPoseData;
        nodeInfo.sequenceNo = 1;
    // send the response -> this block of code must be in a function   
        nodeInfo.recipient = nodeInfo.sender;
        nodeInfo.sender = me;
        nodeInfo.timeStamp = Date.now();
        socket.emit(nodeInfo.messageID, nodeInfo, (ack) => { //socket io emit block
            if (ack.recipient === 'undefined') {
                console.log('recipient node did not respond!');
            } else {

                console.log('\n\n => ack :->  ', JSON.stringify(ack, null, 4));
            }
        });//end of socket io emit block
    });

   
});// end of the connection estalished block of code