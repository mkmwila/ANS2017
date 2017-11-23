
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


/*
 routes - dedicated for the localiser and traversability grid 
*/
var positionObject ={};
var angleObject ={};
var yawObject = {};
// localPose
app.post('/worldModel/localPose/position',function(req,res){
    var positionData = req.body;
    var yaw = getYawAngle();
    console.log('yaw angle about to be sent', yaw);
    positionData = {'x':parseFloat(positionData.x),'y':parseFloat(positionData.y),'yaw': parseInt(getYawAngle().yaw)};
    console.log('postion data',positionData);
    setPositionPose(positionData);
    res.json({'message':positionData});
});

// localiser
app.get('/worldModel/localiser/position',function(req,res){
    // passing the location data to the localiser
    var positionData = getPositionPose();
    console.log('gettting location', positionData);
    res.json(positionData);
});

app.post('/worldModel/position',synchronisationUtil.getVihicePosition) // gets position 
app.post('/worldModel/traversability',synchronisationUtil.getVehicleClass) // gets class for traversability 
app.post('/worldModel/obstacles',synchronisationUtil.getDynamicObstacleDetection) // route for dynamic obstabcle detection

/*
 * getting the yho angle from the Global Pose 
*/

app.post('/worldModel/GPose/angle',function(req,res){
    var yaw = req.body;
    console.log('yaw angle', yaw);
    setYawAngle(yaw);
    console.log('Global Pose Yaw angle', yaw);
    res.json({"message": 'angle recieved'});
});
// parse yaw angle to the localiser
app.get('/worldModel/globalpose/yaw',function(req,res){
    // send yaw angle to the localiser
    var yaw = getYawAngle();
    console.log('sending Yaw Angle ..', yaw);
    res.json(yaw);
})

/*
  Hepler Region
*/
function setPositionPose(position){
positionObject = position;
return; 
}

function getPositionPose(){
return positionObject;
}

function setYawAngle(yaw){
    yawObject = yaw;
    return;
}

function getYawAngle(){
    return yawObject;
}

app.listen(3000,function(){
    console.log('world model lsitening at %s', '3000');
});