
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var multer = require('multer');
var fs = require("fs");
var OcuUtil = require('./routes/ocuUtility.js');
var async = require('async');
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongoose = require('mongoose');
var fs = require('fs');
// view engine setup
var engine = require('consolidate');
app.set('views',__dirname);
app.engine('html', engine.mustache);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/',function(req,res){res.render('public/gui.html')});

app.get('/ocu/missions/',function(req,res){
    OcuUtil.getAllMissions(function(err,missions){
      if(err){
        res.send('missions Error'+err);
      }
       res.send(missions)
    })
})

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
  cb(null, 'uploads/')
},

filename: function(req, file, cb) {
  cb(null, file.originalname);
}
});

var upload = multer({
storage: storage
});
var creatMis={};
// get data from the client
app.post('/', upload.any(),function(req,res){
// connect to th mongodababase
mongoClient.connect('mongodb://localhost:27017/ocu',function(err,db){
    var path = req.files[0].path;
    var imageName = req.files[0].originalname;
    var imagepath = {};
    imagepath.path = path;
    //console.log("BODY : : ", req.body);
    var createMissionObj =  {};
    createMissionObj.missionName=req.body.missionaNamee;
    createMissionObj.missionDescription=req.body.description;
    createMissionObj.destination={};
    createMissionObj.destination.x=req.body.x;
    createMissionObj.destination.y=req.body.y;
    createMissionObj.imageName = imageName;
    createMissionObj.path = path;
    createMissionObj.myImage = fs.readFileSync(path);
    creatMis = createMissionObj;
    console.log('createMission Obj',createMissionObj);
    //console.log('createMission Obj',createMissionObj.destination)
    db.collection('missions').save(createMissionObj);
   
})
  res.redirect("/")
})
// app.get('/createdMission',function(req,res){
//   console.log('new object : ', creatMis);

// })
  
// get selectedMissionInfo
app.get('/ocu/getMissionByName/:missionName',function(req,res){
  var missionName = req.params.missionName;
  console.log('selectedMission', missionName);
  // we need to findOn
  mongoClient.connect('mongodb://localhost:27017/ocu',function(err,db){
    db.collection('missions').find({'missionName':missionName}).toArray(function(err,Amission){
     
      console.log('selected mission',Amission);
      if(err){
        res.send(err)
      }else{
        res.send(Amission)
      }
      
    })
  })
})
app.get('/ocu/creatM',function(req,res){
  
  res.send(creatMis)
  
})
app.get('/ocu/getMissionByName/:missionName',function(req,res){
  var missionID = req.params.missionName;
   // we need to findOn
   console.log(req.params);
  mongoClient.connect('mongodb://localhost:27017/ocu',function(err,db){
    db.collection('missions').find({'missionName':missionID}).toArray(function(err,Amission){
     
      console.log('missions from mission db ',Amission);
      if(err){
        res.send(err)
      }else{
        res.send(Amission)
      }
      
    })
  })
})

var server = app.listen(9000,function(){
  var port = server.address().port;
  var host = server.address().address;
  console.log('LIstening on port http:' + host +":" + port);
});
