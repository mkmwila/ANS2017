/*  File :missionSpooler.js
  ==========================================================================
	Component ID = 36
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
var me = {
    id: 36,
    name: 'Mission Spooler'
};
var subSystemCommander = {
    id:32,
    name: 'Sub-System Commander'
}; 
var systemTree = [me];

console.log('\n\n***** Mission Spooler is Running! *****\n')
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
var ack = {
    command: '0403h'
};
/* Handling the messages */
socket.on('0E00h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is requesting to start the mission ${nodeInfo.data.name}`);
    
    socket.emit('4400h', nodeInfo, (ack) => {
        console.log(JSON.stringify(ack, null, 4));
    });
    nodeInfo.recipient= subSystemCommander,
    socket.emit('0E00h', nodeInfo, (ack) => {
      console.log(JSON.stringify(ack, null, 4));
  });
});

socket.on('0E02h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is requesting to stop the mission ${nodeInfo.data.name}`);
 
    socket.emit('4400h', nodeInfo, (ack) => {
        console.log(JSON.stringify(ack, null, 4));
    });
    nodeInfo.recipient= subSystemCommander,
    socket.emit('0E02h', nodeInfo, (ack) => {
      console.log(JSON.stringify(ack, null, 4));
  });
});

socket.on('0E03h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is requesting to pause the mission ${nodeInfo.data.name}`);
 
    socket.emit('4400h', nodeInfo, (ack) => {
        console.log(JSON.stringify(ack, null, 4));
    });
    nodeInfo.recipient= subSystemCommander,
    socket.emit('0E03h', nodeInfo, (ack) => {
      console.log(JSON.stringify(ack, null, 4));
  });
});

socket.on('0E04h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is requesting to resume the mission ${nodeInfo.data.name}`);
 
    socket.emit('4400h', nodeInfo, (ack) => {
        console.log(JSON.stringify(ack, null, 4));
    });
    nodeInfo.recipient= subSystemCommander,
    socket.emit('0E04h', nodeInfo, (ack) => {
      console.log(JSON.stringify(ack, null, 4));
  });
});
