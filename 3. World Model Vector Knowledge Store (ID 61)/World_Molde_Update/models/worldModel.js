/*
This script synchronises data and sends the results of the json to the path planner
 The data of previous locations of the car are stored on the database fot hostorical logs
*/
var async = require('async'); // used for waterfall and the rest
var mapObject =  {};

var Vclass = null;
var position  = null;
var io = require('socket.io-client');
var socket = io.connect('http://146.64.244.135:3000', { reconnect: true });  // replaced the ip address
var async = require('async');
var me = {
    id: 61,
    name: 'Vector Knowledge Store'
};

var planner = {
    id: 48,
    name: "Local Path Segment Driver"
};

var position = 0;

mapObject.map = [
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ]
mapObject.gridSize = 82.2;
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

})

exports.getVihicePosition = function(req,res){
  //
  var vehicleposition  = req.body;
  if(vehicleposition!=null&&vehicleposition){
    sendPosition(vehicleposition)
    res.send({'message':'recieved'});
  }
  else{
    res.send({'message':'error'})
  }
}

function sendPosition(position){
  var  nodeInfo = {};
  console.log('this is the position from REBA NJAMBAMJA', position);
  nodeInfo.messageID = '4A23h';
  nodeInfo.data = position; // ideally update with status
  nodeInfo.sequenceNo = 1;
  nodeInfo.recipient = planner;
  nodeInfo.sender = me;
  nodeInfo.timeStamp = Date.now();
  socket.emit(nodeInfo.messageID, nodeInfo, (ack) => {
      if (ack.recipient === 'undefined') {
          console.log('recipient node did not respond!');
      } else  {
          // 3.5 getting the acknowledgement and logging it to console
          console.log('\n\n ack :->  ', JSON.stringify(ack, null, 4));
      };

  })
}


exports.sendPoseLocation = function(callback){
 // gets position of poseLocaliser then pass the location to the localliser 
 // TODO get location from the poseLocaliser : DEON
  var poseLocation = {
    x:491.5,
    y:465.0,
    r:1.578
  }
  return callback(null,poseLocation);
}

function sendTraversability(vclass){
  // TODO need to send the class to the comunicator script

}

// uses async waterfall and async paralell to combine all the results
exports.synchroniseLocationAndTraversiblityData = function(req,res){
  // ideally this should req.body  //req.body; // expect to recieved the data in this manner
  console.log('this is map object before being processed', mapObject);
  async.waterfall([
    function(donecallback){
       // gets all the relevent data from other parties when the data is recieved we pass it to the next function to sync the data
       // more steps will be taken here
      (donecallback(mapObject))
      res.json(mapObject)
    }
  ],function(success){
      console.log('mapObject Sent!');
  })
}


socket.on('connect', () => { // begining of the connection estalished block of code
    // display a message on the console
    console.log('\n\n => Connection to the G-Bat Network has been established!!\n\n');

});

exports.getVehicleClass = function(req,res){
   var vehicleClass = req.body;
   if(vehicleClass!=null&&vehicleClass){
     console.log('got vehicleData', vehicleClass);
      setVihicleClass(vehicleClass)
   }
   getVihicleClass(function(err,Vclass){
     if(err){
       console.log('failed to get the vehicleClass');
       res.send({'message':err});
     }
   });
}
exports.getDynamicObstacleDetection = function(req,res){
  var obstacleDetection  = req.body;
  if(obstacleDetection!=null&&obstacleDetection){
    console.log('got obstacleDetection', obstacleDetection);
  }
  res.send({"message":"recieved obstacle"});
}

function setVihicleClass (Vclass){
  console.log('Vclass', Vclass);
  this.Vclass = Vclass
  return Vclass;
}
function getVihicleClass(callback){
  console.log('vehicleClass:::');
  return callback(Vclass)
}
getVihicleClass(function(err,Vclass){
  if(err){
    console.log('failed to get the vehicleClass');
  }
  console.log('this is the getVihicleClass', Vclass);
});
