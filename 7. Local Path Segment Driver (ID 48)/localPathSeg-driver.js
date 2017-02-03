/*  File :local-pathSegDriver.js
  ==========================================================================
	Component ID = 48
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
const socket = io.connect('http://localhost:3000', { reconnect: true });  // replaced the ip address 
const spawn = require('child_process').spawn;
const pathPlanning = './path.exe';
var Planner = spawn(pathPlanning);



var me = {
    id: 48,
    name: 'Local Path Segment Driver'
};
var systemTree = [me];

var mapData = {};

var ExecuteList = {};

var Map = { TimeStamp: 15488843, currentPosition: [1, 2], Destination: [58, -25], from: 'WorldModel' };

console.log('\n\n***** Local Path Segment Driver is Running! *****\n')


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
    // Receive map data from Vector knowledge store : Message ID = 4400h
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the Data received
    socket.on('4A23h', (nodeInfo) => {  // Receiving the map block of code
        mapData = nodeInfo.data[0];
        console.log('\n\n => Received  Map data => ', JSON.stringify(mapData, null, 4));
        // retrieve the payload and process it
        //  mapData = JSON.stringify(Map, null, 4);
        var mapDataStr = JSON.stringify(mapData);


        // sending the map to the C++ compiled code
        //-----------------------------------------
        Planner.stdin.write(mapDataStr + '\n');


        // console.log('\n\n We sent data in the format of ', typeof (mapDataStr));
        console.log(`\n => its length is : ${mapDataStr.length}`);

        // console.log(`\n\n -> The data is ${mapDataStr}`);


        // when data comes from the child process on stdout
        //-------------------------------------------------

        Planner.stdout.on('data', function (data) {


            // 1.the data is in the hex format => convert it to string!
            // myData = data.toString();
            myData = data;

            console.log('Received Data from c++ => ' + myData);
            console.log('myData is of type ' + typeof (myData));
            if (typeof (myData !== 'undefined')) {
                //3.  convert the JSON format to an object
                myObject = JSON.parse(myData);
                executeList = myObject.Data;
                // test the object
                console.log('\n => sender : ' + myObject.name);
                console.log(` The Execute List is -> : ${executeList}`);

                // dummy
    //             executeList = [

    //     {
    //         "Linear_Velocity": 4,
    //         "Angular_Velocity": 3.5,
    //         "Distance": 6.8
    //     },
    //     {
    //         "Linear_Velocity": 6,
    //         "Angular_Velocity": 23.5,
    //         "Distance": 3.09
    //     },
    //     {
    //         "Linear_Velocity": 2.5,
    //         "Angular_Velocity": 12.9,
    //         "Distance": 10.6
    //     },
    //     {
    //         "Linear_Velocity": 1.23,
    //         "Angular_Velocity": 13.5,
    //         "Distance": 16.3
    //     },
    //     {
    //         "Linear_Velocity": 4.2,
    //         "Angular_Velocity": 3.5,
    //         "Distance": 60
    //     },
    // ];


                // 3 Send the ExecuteList to the Local Vector driver : Message ID = 041Eh 
                //3.1 Initialise the message to be sent
                messageID = '041Eh';
                data = executeList;
                recipientID = 44;
                sequence = 1;

                // 3.2.Checking if recipient node is connected   
                var destNodeInfo = systemTree.filter((node) => {
                    return node.id === recipientID;
                });

                if (destNodeInfo.length === 0) { // if not connected
                    console.log('recipient node not connected to the G-Bat Network!');
                } else { // if connected
                    // 3.3. Formatting the packet to be sent
                    var nodeInfo = {
                        messageID: messageID,
                        sender: me,
                        recipient: destNodeInfo[0],
                        data: data,
                        sequenceNo: sequence
                    };
                    console.log('\n\n -> nodeInfo => ', JSON.stringify(nodeInfo, null, 4));
                    //3.4 sending the message
                    console.log(`\n\n -> Sending ${nodeInfo.messageID} command to ${nodeInfo.recipient.name}....`);
                    socket.emit(nodeInfo.messageID, nodeInfo, (ack) => {
                        if (ack.recipient === 'undefined') {
                            console.log('recipient node did not respond!');
                        } else {
                            // 3.5 getting the acknowledgement and logging it to console
                            console.log('\n\n ack :->  ', JSON.stringify(ack, null, 4));
                        }
                    });
                }


            }

        });

        // // when data comes from the child process on stderr
        // // used here for debugging purposes
        // //-------------------------------------------------
        // Planner.stderr.on('data', function (data) {

        //     console.log('Data received inside the c++ code => ' + data);
        // });


        // format the acknowlegemet message
        var ackData = {};
        nodeInfo.messageID = '4400h';
        nodeInfo.data = ackData; // ideally update with data read from hardware
        nodeInfo.sequenceNo = 1;

    }); // end of receiving the map block of  code

    // Receive acknowledgement : Message ID = 4400h
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the Data received
    socket.on('4400h', (nodeInfo) => {
        console.log('\n\n  ack <-: ', JSON.stringify(nodeInfo, null, 4));
        // retrieve the payload and process it

        // format the acknowlegemet message
        var ackData = {};
        nodeInfo.messageID = '4400h';
        nodeInfo.data = ackData; // ideally update with data read from hardware
        nodeInfo.sequenceNo = 1;

    });

    // Receive Global Pose : Message ID = 4402h ( if needed)
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the Data received
    socket.on('4402h', (nodeInfo) => {
        console.log('\n\n => Received  Global Pose Data... => ', JSON.stringify(nodeInfo, null, 4));
        // retrieve the payload and process it

        // format the acknowlegemet message
        var ackData = {};
        nodeInfo.messageID = '4400h';
        nodeInfo.data = ackData; // ideally update with data read from hardware
        nodeInfo.sequenceNo = 1;

    });

});// end of the connection estalished block of code

//=============================================================================================
// what it can do after connection is established  -> to be inplemented in your code 
//=============================================================================================



// 2.1  2.3 Query Vector Knowledge Store Object : Message ID : 2A23h ( query Map)
//-------------------------------------------------------------------------------
//  => socket.emit('2A23h',...)
// responded to with message ID : 4A23h => getting the map
// set the travel speed



// 2.2 SetTravelSpeed : Message ID = 040Ah 
//---------------------------------------------------------------------
// => socket.emit('040Ah',...)
// responded to with message ID : 4400h => Acknowledgemt to the set 
// set the travel speed


// 2.3  ExecuteList : Message ID = 041Eh
//---------------------------------------------------------------------
// => socket.emit('041Eh',...)
// responded to with message ID : 4400h => Acknowledgemt to the set command
// execute the list as set in nodeInfo.data




//


//-------------------------------------------------------------------------------------------
//                          Tester code for Local path Segment
//-------------------------------------------------------------------------------------------
var messageID, data, recipientID, sequence;

// Waiting for the connection to be established and stable (5second with the setTimeout function)
setTimeout(() => {
    console.log(" *- Starting the Test... -*")
    //
    //1.  request map from the vector knowledge store
    //  1.1 initialize recipient and command
    messageID = '2A23h';
    data = {};
    recipientID = 61;
    sequence = 1;

    // 1.2.Checking if recipient node is connected   
    var destNodeInfo = systemTree.filter((node) => {
        return node.id === recipientID;
    });

    if (destNodeInfo.length === 0) { // if not connected
        console.log('recipient node not connected to the G-Bat Network!');
    } else { // if connected
        // 1.3. Formatting the packet to be sent
        var nodeInfo = {
            messageID: messageID,
            sender: me,
            recipient: destNodeInfo[0],
            data: data,
            sequenceNo: sequence
        };
        // console.log('\n\n -> nodeInfo => ', JSON.stringify(nodeInfo, null, 4));
        //1.4 sending the message
        console.log(`\n\n -> Sending ${nodeInfo.messageID} command to ${nodeInfo.recipient.name}....`);
        socket.emit(nodeInfo.messageID, nodeInfo, (ack) => {
            if (ack.recipient === 'undefined') {
                console.log('recipient node did not respond!');
            } else {
                // 3.5 getting the acknowledgement and logging it to console
                console.log('\n\n ack :->  ', JSON.stringify(ack, null, 4));
            }
        });
    }

    // 2. compute and  get the path segment from the C++ compiled program  Note can be done insi
    




}, 3000);

