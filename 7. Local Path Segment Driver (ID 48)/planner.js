
const moment = require('moment');
const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000', { reconnect: true });  // replaced the ip address 
var pathPlanning = './planner.exe';
var spawn = require('child_process').spawn;
var Planner = spawn(pathPlanning);

var me = {
    id: 48,
    name: 'Local Path Segment Driver'
};

var systemTree = [me];

var mapData = {};


var Data = { 
	TimeStamp : 15488843, 
	currentPosition:[1,2], 
	Destination: [58,-25], 
	from: "Martin"
};

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
});

var Map = JSON.stringify(Data);
// when data comes from the child process on stdout
//-------------------------------------------------

Planner.stdout.on('data', function (data) {

// the data is in the hex format => convert it to string!
   var myData = data.toString();
   //var myObject = JSON.parse(myData);

    console.log('Received Data from c++ => ' + myData);
    console.log('myData is of type ' + typeof (myData));
    if (typeof (myData !== 'undefined')) {

        console.log('inside parsing');
        // convert the JSON format to an object
      //  var myObject = JSON.parse(myData);
      //   console.log('myData is of type ' + typeof (myObject));
        // test the object
      //  console.log('Source: ' + myObject.name);
       // console.log('Data[3]: ' + myObject.Data[3]);
    }
});

// when data comes from the child process on stderr
// used here for debugging purposes
//-------------------------------------------------
Planner.stderr.on('data', function (data) {
    
        console.log('Data received inside the c++ code => ' + data);
});


// Simulate entering data for gets() after 1 second
setTimeout(function () {
    console.log( 'sending Data to the path planner c++ executable program (planner.exe) ....');
    Planner.stdin.write(Map);
    Planner.stdin.write('\n');
}, 100);

 socket.on('4A23h', (nodeInfo) => {  // Receiving the map block of code
        console.log('\n\n => Received  Map data => ', JSON.stringify(nodeInfo.data, null, 4));
        // retrieve the payload and process it
        mapData = JSON.stringify(Map, null, 4);
        // mapData = JSON.stringify(nodeInfo.data, null, 4);
});

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
    var executeList = [

        {
            "Linear_Velocity": 4,
            "Angular_Velocity": 3.5,
            "Distance": 6.8
        },
        {
            "Linear_Velocity": 6,
            "Angular_Velocity": 23.5,
            "Distance": 3.09
        },
        {
            "Linear_Velocity": 2.5,
            "Angular_Velocity": 12.9,
            "Distance": 10.6
        },
        {
            "Linear_Velocity": 1.23,
            "Angular_Velocity": 13.5,
            "Distance": 16.3
        },
        {
            "Linear_Velocity": 4.2,
            "Angular_Velocity": 3.5,
            "Distance": 60
        },
    ];


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


}, 50);