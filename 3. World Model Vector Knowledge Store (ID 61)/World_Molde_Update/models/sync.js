var syncUtil = require('./sync.js');
var async  = require('async')


var getVehicleClass  = null;
var vihicelPosition = null;

exports.getVehicleClass = function(req,res){
   console.log('gor vehicel class');
   var vehicleClass = req.body;
   if(vehicleClass!=null && vehicleClass){
     console.log('got vehicleData', vehicleClass);
   }
   setVihicleClass(vehicleClass) // get vehicleClass
}

function setVihicleClass (Vclass){
this.Vclass = getPositionData
}

function getVihicleClass(){
  console.log('vehicleClass:::');
  return getVehicleClass;
}

getVihicleClass();
