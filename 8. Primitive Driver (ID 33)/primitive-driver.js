/*  File :primitive-driver.js
  ==========================================================================
	Component ID = 33
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
// 1. Binding the socket -io to an http server 
//----------------------------------------------

var app = require('express')();
var http = require('http').Server(app);
var iio = require('socket.io')(http);
var PORT = 30000;

// 2. Constant values that define the driving mode
//-------------------------------------------------

var DISABLED = 0;
var MANUAL = 1;
var AUTO = 2;
var SUCCESS = true,
    FAILED = false;

var me = {
    id: 33,
    name: 'Primitive Driver'
};
var systemTree = [me];

console.log('\n\n***** Primitive Driver is Running! *****\n')


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
        var ExecuteList = nodeInfo.data;
        nodeInfo.messageID = '4400h';
        nodeInfo.sequenceNo = 1;

        console.log('\n\n =>Executing  List...\n\n');
        console.log(`\n\n =>The received list is  ${ExecuteList}`);

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

    // 2.4 SetWrenchEffort : Message ID = 0405h
    //---------------------------------------------------------------------
    // respond with message ID : 4400h => Acknowledgemt to the set 
    // set the Wrench Effort

    socket.on('0405h', (nodeInfo) => {
        var wrenchEffort = nodeinfo.data;
        nodeInfo.messageID = '4400h';
        nodeInfo.data = wrenchEffort; // ideally update with data readfrom hardware
        nodeInfo.sequenceNo = 1;

        console.log('\n\n => Setting wrench effort...\n\n');

    });
    
    // 3.1 Variables that will  hold the converted wrench effort
    //  into values that actually drives the stepper and servo motors
    /*****************************************************************
     
    Here they are declared  as an object 'primitiveDriver' and initialized
    The methods or functions could be added here too.Please modify the name 
    of variables accordingly */

    var primitiveDriver = {

        // attributes
        status: DISABLED,
        throttleServoMotorAngle: 0,
        SteeringStepperMotorSteps: 0,
        breakingServoMotorAngle: 0
            // functions or methods

    };


    // 2.3 QueryWrenchEffort : Message ID = 2405h
    //----------------------------------------------------
    // Respond with message ID : 4405h => ReportWrenchEffort
    socket.on('2405h', (nodeInfo) => {
        // log to console -> can also log to file
        console.log(`\n\n =>  Query of Wrench Effort received  from ${nodeInfo.sender.name}!`);
        console.log(`\null => sending Wrench Effort data to ${nodeInfo.sender.name}...`);

        // get Global Pose data from hardware. Here we use dummy data    
        var wrenchEffort = {
            PresenceVector: 1, // Boolean 1 or 0
            PropulsiveLinearEffortX: 0, // Percentage (0 to 100)
            PropulsiveLinearEffortY: 0, // Percentage (0 to 100)
            PropulsiveLinearEffortZ: 0, // Percentage (0 to 100)
            PropulsiveRotationalEffortX: 0, // Percentage (0 to 100)
            PropulsiveRotationalEffortY: 0, // Percentage (0 to 100)
            PropulsiveRotationalEffortZ: 0, // Percentage (0 to 100)
            ResistiveLinearEffortX: 0, // Percentage (0 to 100)
            ResistiveLinearEffortY: 0, // Percentage (0 to 100)
            ResistiveLinearEffortZ: 0, // Percentage (0 to 100)
            ResistiveRotationalEffortY: 0, // Percentage (0 to 100)
            ResistiveRotationalEffortZ: 0 // Percentage (0 to 100)

        };
                    // 3.3 primitiveDriver methods 
            //----------------------------
        primitiveDriver.reportWrenchEffort = function() {
            var result = FAILED;
            var currentWrenchEffortJSON = JSON.stringify(this.wrenchEffort);
            console.log('\n\n =>  Sending Wrench Effort :\n\n');
            io.emit('reportWrenchEffort', currentWrenchEffortJSON);
            //console.log(currentWrenchEffort);
            return SUCCESS;
        }
        primitiveDriver.setWrenchEffort = function(wrenchEffort) {
            var result = SUCCESS;

            // first try to set it in the hardware and read the values from the sensors
            // do it with a timeout async functions  and ORing the result variable with the result
            // of each parameter. if all are successful the end result will be SUCCESS.
            /*********************************************************************************** */

            //put that code here or call that function here;

            // Then update the parameter with the ones measured from the sensors (feedback) 
            /*******************************************************************************
            *  */
            this.wrenchEffort.PresenceVector = primitiveDriver.wrenchEffort.PresenceVector;
            this.wrenchEffort.PropulsiveLinearEffortX = wrenchEffort.PropulsiveLinearEffortX;
            this.wrenchEffort.PropulsiveLinearEffortY = wrenchEffort.PropulsiveLinearEffortY;
            this.wrenchEffort.PropulsiveLinearEffortZ = wrenchEffort.PropulsiveLinearEffortZ;
            this.wrenchEffort.PropulsiveRotationalEffortX = wrenchEffort.PropulsiveRotationalEffortX;
            this.wrenchEffort.PropulsiveRotationalEffortY = wrenchEffort.PropulsiveRotationalEffortY;
            this.wrenchEffort.PropulsiveRotationalEffortZ = wrenchEffort.PropulsiveRotationalEffortZ;
            this.wrenchEffort.ResistiveLinearEffortX = wrenchEffort.ResistiveLinearEffortX;
            this.wrenchEffort.ResistiveLinearEffortY = wrenchEffort.ResistiveLinearEffortY;
            this.wrenchEffort.ResistiveLinearEffortZ = wrenchEffort.ResistiveLinearEffortZ;
            this.wrenchEffort.ResistiveRotationalEffortY = wrenchEffort.ResistiveRotationalEffortY;
            this.wrenchEffort.ResistiveRotationalEffortZ = wrenchEffort.ResistiveRotationalEffortZ;

            // send an acknowledgement message to the Vector driver (SUCCESS or FAILED)
            /************************************************************************** */
            io.emit('setWrenchEffortResult', result);

            // return the result of this function to the caller of the function
            /******************************************************************* */
            return result;

        }
        // 4. Handling of socket io events 
//---------------------------------

// 4.1 on Client connection
/****************************/
io.on('connection', function(client) {
    // display a message on the console
    console.log('\n\n =>Client Connected!\n\n');

    // 4.2 example of handling a message that the client has emitted ( here 'CH01') 
    /***************************************************************************/
    // This example must be replaced with Dismissed controller message handling
    client.on('test', function(from, msg) {

        console.log('Message ', from, 'saying', msg);

    });

    // Handling of the Set Wrench effort (Message ID: 0405h);
    /**********************************************************/
    client.on('setWrenchEffort', function(wrenchEffort) {

        var sW = primitiveDriver.setWrenchEffort(wrenchEffort);

        console.log(wrenchEffort);
        if (sW === SUCCESS) {
            console.log('\n\n => Setting the wrench effort was Successful!');
        } else {
            console.log('\n\n => Setting the wrench effort Failed!');
        }

    });

    // Hanling of the OCU Slider actions to set the wrench effort
    /************************************************************* */

    // response to breaks slider
    client.on('breaks', function (breaks) {
        console.log('\n\n breaks => ' + breaks + ' %');
        primitiveDriver.wrenchEffort.ResistiveLinearEffortX = breaks;
    });

    // response to speed slider
    client.on('speed', function (speed) {
        console.log('\n\n speed => ' + speed + ' %');
        primitiveDriver.wrenchEffort.PropulsiveLinearEffortX = speed;
    });

    // response to direction slider
    client.on('dir', function (dir) {
        console.log('\n\n Heading => ' + dir + ' degrees');
        primitiveDriver.wrenchEffort.PropulsiveRotationalEffortZ= dir;
    });

    // Handling of the Query Wrench effort (Message ID: 2405h )
    /**********************************************************/
    //client.on('queryWrenchEffort', primitiveDriver.reportWrenchEffort());
    client.on('queryWrenchEffort', function() {
         primitiveDriver.reportWrenchEffort();
    });
    client.on('disconnect', function() {

        // body... 

    });


});


    // 5. Web Server handlin of http Request from the OCU
    //----------------------------------------------------

    app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
    });
    // start the server ,listen on port 5000 and display a message to interact with user
    http.listen(PORT, function () {
    console.log('\n\n**** Primitive Driver Web server running on port ' + PORT + ' ****');
    });
        // Dismiss Controller
        primitiveDriver.dismissController = function() {
            var result;

        }
        
        // Format the packet to send  
        nodeInfo.messageID = '4405h';
        nodeInfo.data = wrenchEffort;
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