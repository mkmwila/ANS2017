
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
//var Schema = mongoose.Schema;
var fs = require('fs');
//var imageId = [];
var imageObject = {};

//var imgPath = 'banner03.jpg';
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



var imageId = null;
var missionDetailsObj = {};
async.waterfall([
  function(donecallback){
        // get data from the client
        app.post('/', upload.any(),function(req,res){
          // connect to th mongodababase
          mongoClient.connect('mongodb://localhost:27017/ocu',function(err,db){
            // mission name and description 
            //console.log('Data : ',req.body)
            var path = req.files[0].path;
            var imageName = req.files[0].originalname;
            var imagepath = {};
            imagepath.path = path;
          
            var createMissionObj =  req.body;
           // console.log('image', createMissionObj);
            createMissionObj.imageName = imageName;
            createMissionObj.path = path;
            createMissionObj.myImage = fs.readFileSync(path);
            console.log('createMission Obj',createMissionObj)
            db.collection('mapImages').save(createMissionObj,function(err,cb){
              if(err){
                return donecallback(err);
              }else{
                // set image 
                setMissionObject(cb.ops[0]._id)
                imageId = cb.ops[0]._id;
                console.log('Image Id :', cb.ops[0]._id);
               return donecallback(null,cb.ops[0]._id);
              }
            });
          })
           res.redirect("/")
      })
      
  },
  function(imageId,donecallback){
          app.post('/create/missions/',function(req,res){
            // get image 
            console.log('ImageID After  : ', getImageId());
              mongoClient.connect('mongodb://localhost:27017/ocu',function(err,db){
              console.log('mission data', req.body)
              var missionDataObj  = {};
              missionDataObj.missionName = req.body.name;
              missionDataObj.missionDescription = req.body.description;
              missionDataObj.imageId = imageId
              
              console.log('mission Data'+missionDataObj);
              db.collection('missions').save(missionDataObj,function(err,results){
                    if(err){
                           return donecallback(err);
                    }else{
                           return donecallback(null,{'message':'saved Imagge on the database'});
                    }
              });
              })
               res.send({'message':'save imageId'});
          })
         
        }
],function(error,success){
    if(error){
      console.log('got an erorr at ', error)
    }
})

app.post('/create/missions/',function(req,res){
    
    missionDetailsObj.missionName= req.body.name;
    missionDetailsObj.missionDescription = req.body.description;
    missionDetailsObj.imageId = imageId;
    mongoClient.connect('mongodb://localhost:27017/ocu',function(err,db){
      db.collection('missions').save(missionDetailsObj);
    })


})

// get selectedMissionInfo
app.get('/ocu/getMissionByName/:missionName',function(req,res){
  var missionName = req.params.missionName;
  console.log('Image Id after o : ',missionDetailsObj);
  console.log('selectedMission', missionName);
  // we need to findOn
  mongoClient.connect('mongodb://localhost:27017/ocu',function(err,db){
    db.collection('missions').find({'name':missionName}).toArray(function(err,Amission){
     
      console.log('selected mission',Amission);
      if(err){
        res.send(err)
      }else{
        res.send(Amission)
      }
      
    })
  })
})

app.get('/ocu/getMissionByName/:missionName',function(req,res){
  var missionID = req.params.missionName;
  console.log('Mission ID', missionID);
  
  // we need to findOn
  mongoClient.connect('mongodb://localhost:27017/ocu',function(err,db){
    db.collection('missions').find({'_id':missionID}).toArray(function(err,Amission){
     
      console.log('missions from mission db ',Amission);
      if(err){
        res.send(err)
      }else{
        res.send(Amission)
      }
      
    })
  })
})


function setMissionObject(imageId){
  imageObject = imageId;
 // return;
}

function getImageId(){
  return imageObject;
}

var server = app.listen(9000,function(){
  var port = server.address().port;
  var host = server.address().address;
  console.log('LIstening on port http:' + host +":" + port);
});
