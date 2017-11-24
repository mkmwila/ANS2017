
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mapInterfaceModel = require('./models/mongoSchema')
var mongoose  = require('mongoose');
var mapInterfaceUtil = mapInterfaceModel.mapInterfaceModel;
var synchronisationUtil = require('./models/worldModel.js');
var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// connect to the mongodb database 
mongoose.connect('mongodb://localhost/atnMessageInterface');

// localPose
app.post('/worldModel/localPose/position',function(req,res){
    var positionData = req.body; // get position data
    synchronisationUtil.localPoseSynchronisation(positionData,function(err,localPose){
        // localpose 
        if(err){
            return res.json(err);
        }else{
            return res.json(localPose);
        }
    })
});

// localiser
app.get('/worldModel/localiser/position',function(req,res){
    synchronisationUtil.localiserSynchronisation(function(err,position){
        if(err){
            return res.json(err)
        }else{
            return res.json(position);
        }
    });
});

app.post('/worldModel/position',synchronisationUtil.getVihicePosition) // gets position 
app.post('/worldModel/traversability/',synchronisationUtil.getVehicleClass) // gets class for traversability 
app.post('/worldModel/obstacles/',function(req,res){
    var dynamicObstacle = req.body;
    synchronisationUtil.getDynamicObstacleDetection(dynamicObstacle,function(err,obstacle){
        if(err){
            res.json(err);
        }else{
            res.json(dynamicObstacle);
        }
    })
});

app.post('/worldModel/GPose/angle',function(req,res){
    var yaw = req.body;
    synchronisationUtil.globalPoseSynchronisation(yaw,function(err,message){
        console.log('geting the yaw angle',yaw);
        if(err){
            res.json(err);
        }else{
            res.json(message);
        }
    });
});
// parse yaw angle to the localiser
app.get('/worldModel/globalpose/yaw',function(req,res){
    synchronisationUtil.globalPoseYawAngle(function(err,yaw){
        if(err){
            res.json(err)
        }
        else{
            res.json(yaw)
        }
    });
});


app.listen(3000,function(){
    console.log('world model Listening  at %s', '3000');
});