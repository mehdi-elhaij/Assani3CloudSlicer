var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var SlicerQueue = require('./SlicerQueue');


var slicerRouter = express.Router();

// test route
slicerRouter.route('/').get(function (req, res) {
    res.json({ message: 'A cool api :)' });  
});

slicerRouter.route('/upload').post(function(req, res){
    var form = new formidable.IncomingForm();

    form.multiples = true;         // allow user to upload files

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');

    // every time a file has been uploaded successfully,
    // give it a random name
    form.on('file', function(field, file) {
        var newRandomName = new Date().getTime();
        fs.rename(file.path, path.join(form.uploadDir, newRandomName + '.stl'));

        // start slicing job
        SlicerQueue.createJob({
            id: newRandomName,
            title: file.name // original file name
        }, function (job, err) {
            if(err){
                res.json({ message: 'File Uploaded Successfully.', error: err});
            }
            else{
                res.json({ message: 'File Uploaded Successfully.', id: job.id});
            }
        });

    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log(err);
        res.json({ message: 'An error has occured: ' + err, error: err});
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        //res.json({ message: 'File Uploaded Successfully.'});
    });

     form.parse(req);               // parse the incoming request
});

module.exports = slicerRouter;