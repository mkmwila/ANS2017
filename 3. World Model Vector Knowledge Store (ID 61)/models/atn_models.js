

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/msg_interface');


var world_model_schema = new mongoose.Schema({

	timeStamp: Date,
	from: String,
	location: {},
	to:String,
	speed: Number,
	destination:{},
	map : {}
});

var world_model = mongoose.model('world_model', world_model_schema);

exports.world_model = world_model;
