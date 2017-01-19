// const express = require('express');
// const path = require('path');
// const favicon = require('serve-favicon');
// const logger = require('morgan');
// const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');
// const fs = require("fs");
const model = require('./models/atn_models');
const world_model_schema = model.world_model;
// const moment = require('moment');
// const PORT = 5000;
const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000', { reconnect: true });  // replaced the ip address 

// var app = express();
// var server = require('http').createServer(app);//

var me = {
    id: 61,
    name: 'Vector Knowledge Store'
};

/*
console.log('about to insert the file');
fs.readFile('./subSystems/map.json', function (err, data) {
                 
                 console.log('insde the file', data.toString());
                new world_model_schema({"time_stamp":Date.now(),'from':'worldModel','location':{
                         'x':2,'y':-23,'r':4.50}, 'to':'planner','speed':11.11,'destination':{'x':13,'y':-14,'r':2.50}, 'map':data 
                 }).save(function(err){
                         if(err){
                               //  res.send('file not save' + err);
                         }else{
                                console.log('file saved !!');
                         }
                 });
                 world_model_schema.find().exec(function(err,results){
                        if(err){
                              //  return res.send(err);
                              console.log('There was an error while trying to get the map ' + err);

                        }else{
                           
                                                              // console.log('result',results);
                                                               console.log('mappping the results',String.fromCharCode(results.map[0]));
                        }

                 });

         });
        


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

*/

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



    // *****************************************
    // 1. Vector Knowlede Store Oblect Creation
    // *****************************************


    //=========================================================================================================
    //          1.1 Set Vector Knowledge Store Feature Class Metadata:: Message ID : 0A21h
    //=========================================================================================================
    //  
    // The response to this message is the message ID : 4400h => acknowledga Vector Knowledge Store Object Creation
    //

    socket.on('0A20h', (nodeInfo) => {
        var FCM = nodeInfo.data;
        nodeInfo.messageID = '4400h';
        nodeInfo.data = 'success'; // ideally update with status
        nodeInfo.sequenceNo = 1;
        nodeInfo.recipient = nodeInfo.sender;
        nodeInfo.sender = me;
        nodeInfo.timeStamp = Date.now();
        console.log('\n\n => Setting Vector Knowledge Store Feature Class Metadata...\n\n');
        socket.emit('4400h', nodeInfo, (ack) => {
            console.log(JSON.stringify(ack, null, 4));
        }); // emit e


    });



    //=========================================================================================================
    //          1.2 Create Vector Knowledge Store 0bject: Message ID : 0A21h
    //=========================================================================================================
    //  
    // The response to this message is the message ID : 4A24h => Report Data Transfer Terminated
    //
    socket.on('0A21h', (nodeInfo) => {
        var VKO = nodeInfo.data;;
        console.log(`\n\n =>  Request to create object received  from ${nodeInfo.sender.name}!`);
        nodeInfo.messageID = '4400h';
        nodeInfo.data = 'success'; // ideally update with status
        nodeInfo.sequenceNo = 1;
        nodeInfo.recipient = nodeInfo.sender;
        nodeInfo.sender = me;
        nodeInfo.timeStamp = Date.now();
        console.log('\n\n => Creating Vector Knowledge Store Object...\n\n');
        socket.emit('4400h', nodeInfo, (ack) => {
            console.log(JSON.stringify(ack, null, 4));
        }); // emit e


    });

    //=========================================================================================================
    //              1.3 Delete Vector Knowledge Store 0bject: Message ID : 0A24h
    //=========================================================================================================
    //  
    // The response to this message is the message ID : 4A24h => Report Data Transfer Terminated
    //
    socket.on('0A24h', (nodeInfo) => {
        var VKO = nodeInfo.data;;
        console.log(`\n\n =>  Request to delete object received  from ${nodeInfo.sender.name}!`);
        nodeInfo.messageID = '4400h';
        nodeInfo.data = 'success'; // ideally update with status
        nodeInfo.sequenceNo = 1;
        nodeInfo.recipient = nodeInfo.sender;
        nodeInfo.sender = me;
        nodeInfo.timeStamp = Date.now();
        console.log('\n\n => deleting Vector Knowledge Store Object...\n\n');
        socket.emit('4400h', nodeInfo, (ack) => {
            console.log(JSON.stringify(ack, null, 4));
        }); // emit e

    });



    //  ***********************************************
    // 2. Vector Knowlede Store Queries and reporting
    // ************************************************


    //=========================================================================================================
    //         2.1 Query Vector Knowledge Store Feature class metadata: Message ID : 2A21h
    //=========================================================================================================
    //  
    // The response to this message is the message ID : 4A21h => Report Vector Knowledge Store Feature class 
    // metadata
    socket.on('2A21h', (nodeInfo) => {
        // log to console -> can also log to file
        console.log(`\n\n =>  Query of Vector Knowledge Store Feature class metadata received  from ${nodeInfo.sender.name}!`);
        console.log(`\null => sending Vector Knowledge Store Feature class metadata to ${nodeInfo.sender.name}...`);

        // get Global Pose data from hardware. Here we use dummy data    
        var FCM = {
            "Timestamp": Date.now(),
            "metadata": "something"
        };
        // Format the packet to send  
        nodeInfo.messageID = '4A21h';
        nodeInfo.data = FCM;
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


    //=========================================================================================================
    //              2.2 Query Vector Knowledge Store bounds: Message ID : 2A22h
    //=========================================================================================================
    //  
    // The response to this message is the message ID : 4A20h => Report Vector Knowledge Store Object Creation
    //
    socket.on('2A20h', (nodeInfo) => {
        // log to console -> can also log to file
        console.log(`\n\n =>  Query of Vector Knowledge Store bounds received  from ${nodeInfo.sender.name}!`);
        console.log(`\null => sending Vector Knowledge Store bounds data to ${nodeInfo.sender.name}...`);

        // get Global Pose data from hardware. Here we use dummy data    
        var FCM = {
            "Timestamp": Date.now(),
            "metadata": "something"
        };
        // Format the packet to send  
        nodeInfo.messageID = '4A20h';
        nodeInfo.data = FCM;
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


    //=========================================================================================================
    //                  2.3 Query Vector Knowledge Store Object : Message ID : 2A23h
    //=========================================================================================================


    socket.on('2A23h', (nodeInfo) => {//
        // log to console -> can also log to file
        console.log(`\n\n =>  Query of Vector Knowledge Store Object received  from ${nodeInfo.sender.name}!`);
      
        // get Map data from mongo dB database 
        nodeInfo.messageID = '4A23h';
        nodeInfo.recipient = nodeInfo.sender;
        nodeInfo.sender = me;
        nodeInfo.timeStamp = Date.now();
        nodeInfo.sequenceNo = 1;
     ;
        console.log('getting the map:::');
        // have the data in the database
        // call mongo data
        world_model_schema.find().exec(function (err, results) {
            console.log('these are the results', results);
           
            if (err) {
                nodeInfo.data = err;
                 socket.emit(nodeInfo.messageID, nodeInfo, (ack) => {
                    console.log('failed to retreve data', err);
                }); // emit error
            } else {

                // add other properties, not stored in the database
                results.time_stamp = Date.now();
                results.speed = 20;
                results.from = 'worldModel';
                results.to = 'Planner';
                results.current_position = { 'x': 53, 'y': -10, 'theta': 23.5 };
                nodeInfo.data = results;
                //console.log('\n\n => this is result', results);
                console.log(`\null => sending Vector Knowledge Store 0ject to ${nodeInfo.recipient.name}...`);
                socket.emit(nodeInfo.messageID, nodeInfo, (ack) => {
                    console.log('-> OK');
                });
            }



        });
    });//

});

// server.listen(PORT, () => {

//     console.log(` ****** World Model Vector Knowledge Store is running on Port ${PORT} ********`);
// });


