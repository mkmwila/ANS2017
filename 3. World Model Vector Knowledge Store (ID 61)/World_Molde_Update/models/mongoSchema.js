var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 // connect to the database
var mapInterfaceSchema = new Schema({
  mapInterfaceUtil : String,
  speed : Number,
  location : [],
  map  :[] // the map will habe it's own- which is a grid
})


var mapInterfaceModel = mongoose.model('mapInterface',mapInterfaceSchema)
exports.mapInterfaceModel = mapInterfaceModel;
