/*  File name : globalPoseSensor.js
   ==========================================================================
	Component ID = 38
	Function : Report Global Pose message provides the position and orientation 
	           of the platform relative to a local reference frame.
    
    The position of the platform is given in Cartesian coordinates x, y, and z, 
    relative to a defined local reference frame.

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
const socket = io.connect('http://C6-MiFi:3000', { reconnect: true });  // replaced the ip address 

var me = {
    id: 38,
    name: 'Gloal Pose Sensor'
};
var systemTree = [me];
console.log('\n\n***** Global Pose Sensor is Running! *****\n')
//==================================================================================================================
//                                         1. Connecting to the G-Bat Network
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
//                                         2. Hanling of Global Pose messages 
//==================================================================================================================

    // 2.1 SetGlobalPose : Message ID = 0402h
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the set command

    socket.on('0402h', (nodeInfo) => {
        var setGPoseData = nodeinfo.data;
        nodeInfo.messageID = '4400h';
        nodeInfo.data = setGPoseData; // ideally update with data readfrom hardware
        nodeInfo.sequenceNo = 1;

        console.log('\n\n => Setting Global Pose...\n\n');

    });

    // 2.2 SetGeomagneticProperty : Message ID = 0412h
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the set command
    socket.on('0412h', (nodeInfo) => {
        var setGeoMagnData = nodeinfo.data;
        nodeInfo.messageID = '4400h';
        nodeInfo.data = setGeoMagnData; // ideally update with data readfrom hardware
        nodeInfo.sequenceNo = 1;
        console.log('\n\n => Setting Geomagnetic Property...!\n\n');

    });

    // 2.3 QueryGlobalPose : Message ID = 2402h
    //----------------------------------------------------
    // Respond with message ID : 4402h => ReportGlobalPose
    socket.on('2402h', (nodeInfo) => {
    // log to console -> can also log to file
    console.log(`\n\n =>  Query of GlobalPose Pose received  from ${nodeInfo.sender.name}!`);
    console.log(`\null => sending Global Pose data to ${nodeInfo.sender.name}...`); 

    // get Global Pose data from hardware. Here we use dummy data    
        var GPoseData = {
            "Timestamp": Date.now(),
            "Lat": 15,
            "Long": 25,
            "Alt": 200,
            "speed": 1.3
        };
    // Format the packet to send  
        nodeInfo.messageID = '4402h';
        nodeInfo.data = GPoseData;
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

     
    // 2. QueryGeomagneticProperty : Message ID = 2412h
    //-------------------------------------------------------------
    // Respond with message ID : 4412h => ReportGeomagneticProperty
    socket.on('2412h', () => {
    // log to console -> can also log to file
    console.log(`\n\n =>  Query of Geomagnetic Properties received  from ${nodeInfo.recipient.name}!`);
    console.log(`\null => sending Geomagnetic Properties data to ${nodeInfo.recipient.name}...`);     
    // get Geomagnetic Property data from hardware. Here we use dummy data    
        var GeoMagProp = {
            Hx : -0176,
            Hy : 0.034,
            Hy : 0834
        };
        // Format the packet to send  
        nodeInfo.messageID = '4412h';
        nodeInfo.data = GPoseData;
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
});// end of theconnection estalished block of code


/*

//============================================================================================
//            3. A test of the local pose node JAUS messaging
//============================================================================================
// will run 10 seconds after the module has initialised 
console.log('\n\n***** Starting Local Pose Sensor test *****\n')
setTimeout(() => {

    var messageID = '2402h';
    var data = {};
    //var recipientID = 33; // testing to send the request a wrong  node (Prim Driver)
    var recipientID = 61; // testing to send the request to an unconnected node
    var sequence = 1;

     // Checking if recipient node is connected   
        var destNodeInfo = systemTree.filter((node) => {
            return node.id === recipientID;
        });
    // send the message
  if (destNodeInfo.length === 0) { // if not connected
            console.log('recipient node not connected to the G-Bat Network!');
        } else { // if connected
            // 1. Formatting the packet to be sent
            var nodeInfo = {
                messageID: messageID,
                sender: me,
                recipient: destNodeInfo[0],
                data: data,
                sequenceNo: sequence
            };
            console.log('\n\n -> nodeInfo => ', JSON.stringify(nodeInfo, null, 4));
            console.log(`\n\n -> Sending ${nodeInfo.messageID} command to ${nodeInfo.recipient.name}....`);
            socket.emit(nodeInfo.messageID, nodeInfo, (ack) => {
                if (ack.recipient === 'undefined') {
                    console.log('recipient node did not respond!');
                } else {

                    console.log('\n\n => ack :->  ', JSON.stringify(ack, null, 4));
                }
            });
        }
}, 10000);

*/