
/*
 This part of the script initializes recieces instructions from the OCU and send the apriori map to the world_model message interface
*/
var express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require("fs");
var model = require('../models/atn_models');
const world_model_schema = model.world_model;
const moment = require('moment');
const PORT = 3000;
var mapData = require('../subSystems/map.json');
var server = require('http').createServer(app);//
var io= require ('socket.io')(server);
var app = express();
io.on('connection',function(socket){
  new world_model_schema(
    {
    "time_stamp":Date.now(),
    'from':'worldModel',
    'to':'planner','speed':11.11,
    'destination':{'x':2,'y':-1,'r':2.50},
    'map':mapData}).save(function(err){if(err){
      // tell the worldModel Server that we have recived and error pass the  massage to the server
      console.log('something Went Wrong');
    }
    else{
      console.log('Map initialized !!!');
    }
  });
    // check if the map is insterted on the database
    world_model_schema.findOne().exec(function(err,results){
      console.log('these are the results',results);
      if(err){
        console.log('There was an error while trying to get the map ' + err);
        io.emit('AprioriMap',{'message':error}); // send the map to the worldModel

      }
      else{
        io.emit('AprioriMap',results) // send the map to the worldModel
      }
  });
})


/*

//=========================================================================================================
//
//=========================================================================================================
// Add a connect listener for the segment driver
//----------------------------------------------

socket.on('connect', () => {
    // display a message on the console
    console.log('\n\n => Connection Established!!\n\n');
    // cons ole.log(sensorIo);

   socket.on('register', (regData,  identify) =>{
           identify(me);
    });

    socket.on('registration', (regInfo) =>{
        console.log(`\n => A ${regInfo.name} has connected to the G-Bat Network!`);
    });

    socket.on('deregistration', (regInfo) =>{
        console.log(`\n => A ${regInfo.name} has disconnected from the G-Bat Network!`);
    });


// Hanling disconnection
//----------------------
socket.on('disconnect', () => {
    console.log('Connection to the G-Bat network has been terminated!');
});



// *****************************************
1. Vector Knowlede Store Oblect Creation
*****************************************


//=========================================================================================================
//          1.1 Set Vector Knowledge Store Feature Class Metadata:: Message ID : 0A21h
//=========================================================================================================
//
// The response to this message is the message ID : 4A20h => Report Vector Knowledge Store Object Creation
//

socket.on('0A20h',(FCM) => {
        var result = {};

        console.log('Querying Object Creation..');
        result.timeStamp =  moment().valueOf();
        result.command = 'Set Feature Class Metadata';
        result.type = FCM.type;
        result.status = 1; // success
        socket.emit('4A20h',result, (ack) =>{
                                        console.log('OK');
                                    }); // emit e


});


//=========================================================================================================
//          1.2 Create Vector Knowledge Store 0bject: Message ID : 0A21h
//=========================================================================================================
//
// The response to this message is the message ID : 4A24h => Report Data Transfer Terminated
//
socket.on('0A21h',(object) => {
        var result = {};

        console.log('Querying Object Creation..');
        result.timeStamp =  moment().valueOf();
        result.command = 'Create Object';
        result.type = object.type;
        result.recipient= 'System Commader';
        result.status = 1; // success
        socket.emit('4A24h',result, (ack) =>{
                                        console.log('OK');
                                    }); // emit e


});

//=========================================================================================================
//              1.3 Delete Vector Knowledge Store 0bject: Message ID : 0A24h
//=========================================================================================================
//
// The response to this message is the message ID : 4A24h => Report Data Transfer Terminated
//
socket.on('0A24h',(object) => {
        var result = {};

        console.log('Querying Object Creation..');
        result.timeStamp =  moment().valueOf();
        result.command = 'Delete Object';
        result.type = object.type;
        result.recipient= 'System Commader';
        result.status = 1; // success
        socket.emit('4A24h',result, (ack) =>{
                                        console.log('OK');
                                    }); // emit e


});



//  ***********************************************
2. Vector Knowlede Store Queries and reporting
************************************************


//=========================================================================================================
//         2.1 Query Vector Knowledge Store Feature class metadata: Message ID : 2A21h
//=========================================================================================================
//
// The response to this message is the message ID : 4A21h => Report Vector Knowledge Store Feature class
// metadata

socket.on('2A21h',() => {
        var FCM = {};

        console.log('Querying Feature class metadata..');
        console.log('Reporting Feature class metadata..');
        FCM.timeStamp =  moment().valueOf();
        FCM.status = 1; // success
        socket.emit('4A21h',FCM, (ack) =>{
                                        console.log('OK');
                                    }); // emit e


});





//=========================================================================================================
//              2.2 Query Vector Knowledge Store bounds: Message ID : 2A22h
//=========================================================================================================
//
// The response to this message is the message ID : 4A20h => Report Vector Knowledge Store Object Creation
//
socket.on('2A22h',() => {
        var bounds = {};

        console.log('Querying bounds..');
        console.log('Reporting bounds..');
        bounds.timeStamp =  moment().valueOf();
        bounds.status = 1; // success
        socket.emit('4A22h',bounds, (ack) =>{
                                        console.log('OK');
                                    }); // emit e


});





//=========================================================================================================
//                  2.3 Query Vector Knowledge Store Object : Message ID : 2A23h
//=========================================================================================================
socket.on('4A23h',() => {

                   var mapData = {};
                    console.log('getting the map:::');
                    // have the data in the database
                    // call mongo data
                 world_model_schema.find().exec(function(err,results){
                        console.log('these are the results', results);
                        if(err){

                                socket.emit('2A20h',mapData, (ack) =>{
                                        console.log('OK');
                                    }); // emit error
                        }else{

                             // add other properties, not stored in the database
                            results.time_stamp = Date.now();
                                    results.speed = 20;
                                    results.from = 'worldModel';
                                    results.to = 'Planner';
                                    results.current_position = {'x': 53, 'y': -10,'theta': 23.5};
                                    //console.log('\n\n => this is result', results);
                                    console.log('Report Vector Knowledge Store Object => map Vector! ')
                                    socket.emit('2A20h',results, (ack) =>{
                                        console.log('OK');
                                    });
                       }



     });
});



});
*/
server.listen(PORT, () => {

    console.log(` ****** World Model Vector Knowledge Store is running on Port ${PORT} ********`);
});

//module.exports = app;
