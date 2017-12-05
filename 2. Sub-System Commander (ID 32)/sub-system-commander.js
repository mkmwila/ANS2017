/*  File name : system-commander.js
   ==========================================================================
	Component ID = 40
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
    id: 32,
    name: 'Sub-System Commander'
};
var planner = {
  id: 48,
  name: 'Path Planner'
};
var primDriver = {
  id: 33,
  name: 'Primitive Driver'
};
var ocu = {
  id: 40,
  name: 'Operator Control Unit'
};
var systemTree = [me];

console.log('\n\n***** System Commander is Running! *****\n')
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

//==========================================================================================
  //                                  1. Management services
  ///=========================================================================================

  // 1.1 SetAuthority : Message ID = 0001h
  //----------------------------------------
  socket.on('0001h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is Setting Authority on  ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '0001h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });


  // 1.2 Shutdown : Message ID = 0002h
  //-----------------------------------
  socket.on('0002h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is Shutting down the  ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '0002h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

  // 1.3 Standby : Message ID = 0003h
  //-----------------------------------
  socket.on('0003h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is Sending a Standby command to ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '0003h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);  // do something about this
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

  // 1.4 Resume : Message ID = 0004h
  //-----------------------------------
  socket.on('0004h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is Sending a Resume command to  ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '0004h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

  // 1.5 Reset : Message ID = 0005h
  //-----------------------------------------
  socket.on('0005h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is Sending a Reset command to ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '0005h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);  // do something about this
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

  // 1.6 SetEmergency : Message ID = 0006h
  //-----------------------------------------
  socket.on('0006h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is Setting an Emergengy situation in the ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '0006h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);  // do something about this
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

  // 1.7 ClearEmergency : Message ID = 0007h
  //-----------------------------------------
  socket.on('0007h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is clearing the emergency situation set in the ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '0007h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);  // do something about this
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

  // 1.8 SetTime : Message ID = 0011h
  //-----------------------------------------
  socket.on('0011h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is Setting the time of the  ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '0011h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);  // do something about this
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });


  // 1.9 QueryStatus : Message ID = 2002h
  //-----------------------------------------
  socket.on('2002h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is quering the Status of the ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '2002h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);  // do something about this
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

  // 1.10 QueryHeartbeatPulse : Message ID = 2202h
  //-----------------------------------------
  socket.on('2202h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is Querying the HeartBeat Pulse of  ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '2202h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);  // do something about this
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

  // 1.11 QueryTime : Message ID = 2011h
  //-----------------------------------------
  socket.on('2011h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is Querying the time from the ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '2011h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);  // do something about this
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

  // 1.12 ReportStatus : Message ID = 4002h
  //-----------------------------------------
  socket.on('4002h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is Reporting its status to the ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '4202h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);  // do something about this
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

  // 1.13 ReportHeartbeatPulse : Message ID = 4202h
  //------------------------------------------------
  socket.on('4202h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is Reporting its HeartBeat Pulse to the ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '4202h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);  // do something about this
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

  // 1.14 ReportTime : Message ID = 4011h
  //-----------------------------------------
  socket.on('4011h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is Reporting its Time to the ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '4011h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);  // do something about this
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

// 1.15 Acknowledgement : Message ID = 4400h
  //-----------------------------------------------------
  socket.on('4400h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is sending an Acknowledgement ${nodeInfo.recipient.name}`);

    // NB. Refactoring : The following block of code must be a function
    // as it appears in every message event

    var ack = {
      command: '4E00h',
      sender: nodeInfo.sender.name,
      sequence: nodeInfo.sequence
    };

    // checking if recipient is still connected 
    var sentTo = systemTree.filter((node) => {
      return node.name === nodeInfo.recipient.name;
    });

    // retrieving its socket id  
    var destination = sentTo[0].socketID;

    //Formatting 
    ack.recipient = sentTo[0].name;
    ack.timestamp = moment().valueOf();
    var nack = setTimeout(() => { console.log('Timed out!') }, 1000);  // do something about this
    socket.broadcast.to(destination).emit(nodeInfo.messageID, nodeInfo);
    acknowledge(ack);
    clearTimeout(nack);
  });

  socket.on('0E00h', (nodeInfo, acknowledge) => {
    console.log(`\n => ${nodeInfo.sender.name} is starting the mission ${nodeInfo.data.name}`);
    var ack = {
        command: '0403h'
    };
    socket.emit('4400h', nodeInfo, (ack) => {
        console.log(JSON.stringify(ack, null, 4));
    });
    
    // reterieving tha data

    var updatedMap = nodeInfo.data;
    updatedMap.from = me.name;
    updatedMap.to = planner.name;
    updatedMap._id = '59bbbb26084970077c2971fd';
    updatedMap.__v = 0;    
    delete updatedMap.id;
    delete updatedMap.name;
    delete updatedMap.description;
    

    //  1.1 initialize recipient and command
    var messageID = '4A23h';
    var recipientID = 48;
    var sequence = 1;

    // 1.2.Checking if recipient node is connected   
    var destNodeInfo = systemTree.filter((node) => {
      return node.id === recipientID;
  });

  if (destNodeInfo.length === 0) { // if not connected
      console.log('  \n => The Path Planner node is not connected to the G-Bat Network!');
  } else { // if connected
      // 1.3. Formatting the packet to be sent
      var nodeInfo = {
          messageID: messageID,
          sender: me,
          recipient: destNodeInfo[0],
          data: updatedMap,
          sequenceNo: sequence,
         
      };
       console.log('\n\n -> nodeInfo => ', JSON.stringify(nodeInfo, null, 4));
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


});
