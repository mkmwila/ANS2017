/*  File : jaus-communicator.js
   ==========================================================================
  
    Author : Martin K. Mwila
    Title  : Senior Electronic Engineer.
    Company : CSIR - DPSS - Landward Sciences
    Project : G-Bat Autonomous Navigation System
    Date  : 26-Dec-2016
    ==========================================================================*/
const moment = require('moment');
const io = require('socket.io-client');
const socket = io.connect('http://C6-MiFi:3000', { reconnect: true });  // replaced the ip address 


var pathPlanning = './planner.exe';
var spawn = require('child_process').spawn;
var Planner = spawn(pathPlanning);

var Map = "{ TimeStamp : 15488843, currentPosition:[1,2], Destination: [58,-25], from: WorldModel           }";

// when data comes from the child process on stdout
//-------------------------------------------------

Planner.stdout.on('data', function (data) {

// the data is in the hex format => convert it to string!
    myData = data.toString();

    console.log('Received Data from c++ => ' + myData);
    console.log('myData is of type ' + typeof (myData));
    if (typeof (myData !== 'undefined')) {
        // convert the JSON format to an object
        myObject = JSON.parse(myData);
        // test the object
        console.log('Source: ' + myObject.name);
        console.log('Data[3]: ' + myObject.Data[3]);
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
}, 1000);