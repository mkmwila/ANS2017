


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
var positionObject ={};
// localPose
app.post('/worldModel/localPose/position',function(req,res){
    var positionData = req.body;
    positionData = {'x':parseFloat(positionData.x),'y':parseFloat(positionData.y),'r':parseFloat(positionData.r)};
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
  Hepler Region
*/
function setPositionPose(position){
positionObject = position;
return; 
}

function getPositionPose(){
return positionObject;
}

app.listen(3000,function(){

console.log('world model lsitening at %s', '3000');
});