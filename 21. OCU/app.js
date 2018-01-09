var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var OcuUtil = require('./routes/ocuUtility.js')
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

// configure file upload on the server
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads') // destination where the file will be uploaded
	},
	filename: function(req, file, callback) {
		console.log(file)
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
})



// view engine setup
var engine = require('consolidate');
app.set('views',__dirname);
app.engine('html', engine.mustache);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
app.post('/create/mission/',function(req,res){
  // connect to th mongodababase
  console.log('console', req.body);
	res.send({"message":"Mission uploaded successfully"})
})



// get selectedMissionInfo
app.get('/ocu/getMissionByName/:missionName',function(req,res){
  var missionName = req.params.missionName;
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

var server = app.listen(9000,function(){
  var port = server.address().port;
  var host = server.address().address;
  console.log('LIstening on port http:' + host +":" + port);
});
