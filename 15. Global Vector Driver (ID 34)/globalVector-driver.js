/*  File :globalVector-driver.js
  ==========================================================================
	Component ID = 34
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
const socket = io.connect('http://C6-MiFi:3000', { reconnect: true });  // replaced the ip address 

   var me = {
    id: 34,
    name: 'Global Vector Driver'
};
var systemTree = [me];

console.log('\n\n***** Global Vector Driver is Running! *****\n')
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
   
});// end of the connection estalished block of code