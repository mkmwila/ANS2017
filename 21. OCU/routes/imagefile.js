var express = require('express');
var router = express.Router();
var multer = require('multer');
var bodyParser = require("body-parser")
var fs = require("fs");
var mongoose = require('mongoose');
var app = express();

//creating the schema for the db
var imagePath = mongoose.Schema({
	name: {
		type: String
	},
	description:{
		type:String
	},

	path: {
	type: String,
	//required: true,
	trim: true
	},
	originalname: {
	type: String
	//required: true
	},
	data: {
	type: Buffer
}, 
});
 
// creating the Image collcetion and taking the created schema
var Image  = mongoose.model('Images', imagePath);
 
router.getImages = function(callback, limit) {
 
 Image.find(callback).limit(limit);
}
 
 
router.getImageById = function(id, callback) {
  
 Image.findById(id, callback);
 
}
 
router.addImage = function(image, callback) {
 Image.create(image, callback);
}
 
// determines where to store the file>>> store the files in uploads folder
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
 
router.get('/', function(req, res, next) {
 res.render('gui.html');
});
 
router.post('/', upload.any(), function(req, res, next) {
 
 var path = req.files[0].path;
 var imageName = req.files[0].originalname;
 
 var a = new Image;
 //a.img.data = fs.readFileSync(imgPath);//saves to db
 var imagepath = {};
 imagepath['path'] = path;
 imagepath['originalname'] = imageName;
 imagepath['data'] = fs.readFileSync(path);

 a.save(function (err, a) {
      if (err) throw err;

      console.error('saved img to mongo');

});
 
 //imagepath contains two objects, path and the imageName
 //we are passing two objects in the addImage method.. which is defined above..
 router.addImage(imagepath, function(err) {
 
 });
 
});
 
module.exports = router;
