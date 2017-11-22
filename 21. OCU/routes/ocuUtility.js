// This script does all serverside works that is required by the OCU

var mongoClient = require('mongodb').MongoClient,
    assert = require('assert');

 // connect to th mongodababase
 mongoClient.connect('mongodb://localhost:27017/ocu',function(err,db){
   assert.equal(null,err); // check if connected
   console.log('connected to the mongodb.')
   exports.getAllMissions = function(callback){
     db.collection('missions').find({}).toArray(function(err,missions){
       if(err){
         callback(err);
       }else{
          callback(err,missions)
       }
     });
   }


 });

 exports.createMission = function(req,res){
   // get mission datat
   var missionData = req.body;
   console.log('missionData', missionData);
    // save the missionDatat on the database
    db.collection('missions').save(missionData).exec(function(err,results){
      console.log('mission Created..');
    });
 }
