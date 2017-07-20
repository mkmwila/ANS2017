/*  File name : localPoseSensor.js
   ==========================================================================
	Component ID = 41
	Function : Report Local Pose message provides the position and orientation 
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
const io = require('socket.io-client');
const socket = io.connect('http://192.168.0.1:3000', { reconnect: true });  // replaced the ip address 

var me = {
    id: 41,
    name: 'Local Pose Sensor'
};
var systemTree = [me];
console.log('\n\n***** Local Pose Sensor is Running! *****\n')
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

    // 2.1 SetLocalPose : Message ID = 0403h
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the set command

    socket.on('0403h', (nodeInfo) => {
        var setLPoseData = nodeinfo.data;
        nodeInfo.messageID = '4400h';
        nodeInfo.data = setLPoseData; // ideally update with data readfrom hardware
        nodeInfo.sequenceNo = 1;

        console.log('\n\n => Setting Local Pose...\n\n');

    });

  
    // 2.2 QueryLocalPose : Message ID = 2403h
    //----------------------------------------------------
    // Respond with message ID : 4403h => ReportLocalPose
    socket.on('2403h', (nodeInfo) => {
    // log to console -> can also log to file
    console.log(`\n\n =>  Query of Local Pose Pose received  from ${nodeInfo.sender.name}!`);
    console.log(`\null => sending Local Pose data to ${nodeInfo.sender.name}...`); 

    // get Global Pose data from hardware. Here we use dummy data    
        var LPoseData = {
            "Timestamp": Date.now(),
            "x": 15,
            "y": -25,
            "r": 20.5,
            "speed": 1.3
        };
    // Format the packet to send  
        nodeInfo.messageID = '4403h';
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


});// end of theconnection estalished block of code

/*
//============================================================================================
//             A test of the local pose node JAUS messaging (uncomment  and edit to run it )
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
