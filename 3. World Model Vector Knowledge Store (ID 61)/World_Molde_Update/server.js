

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mapInterfaceModel = require('./models/mongoSchema')
var mongoose  = require('mongoose');
mongoose.connect('mongodb://localhost/atnMessageInterface');
var mapInterfaceUtil = mapInterfaceModel.mapInterfaceModel;
var synchronisationUtil = require('./models/worldModel.js');
var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());



/*
 routes - dedicated for the localiser and traversability grid 
*/

 app.post('/worldModel/position',synchronisationUtil.getVihicePosition) // gets position 
 app.post('/worldModel/traversability',synchronisationUtil.getVehicleClass) // gets class for traversability 
 app.post('/worldModel/obstacles',synchronisationUtil.getDynamicObstacleDetection) // route for dynamic obstabcle detection
 app.get('/worldModel/localiser/position',function(req,res){
     // send the map and the postion to the localiser 
     synchronisationUtil.sendPoseLocation(function(err,poseLocationData){
         if(err){
             res.send({message:'an Error occured Whlist trying to send pose location' + err});
         }
         else{
             // success in sending location to the localiser
             res.send(poseLocationData);
         }
     });
 })
 app.listen(3000,function(){
     
     console.log('world model lsitening at %s', '3000');
 })

