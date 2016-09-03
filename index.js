// Require Express
var express         = require('express'),
    app             = express(),
    bodyParser      = require('body-parser'),
    multiparty      = require('multiparty'),
    path            = require('path'),
    fs              = require ('fs.extra'),
    rimraf          = require('rimraf');
    //objectId        = require('mongodb').ObjectID;

var AWS = require('aws-sdk');
//aws credentials
AWS.config = new AWS.Config();
AWS.config.update({
    accessKeyId: 'AKIAJRVI3C5FVEZ6VNWQ',
    secretAccessKey: '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'
});
AWS.config.update({region:'eu-west-1'});


// DB
var mongoose        = require('mongoose');

// DB Collection
var User = require(__dirname + '/server/models/user');
var Project = require(__dirname + '/server/models/project');

// DB config
var configDB = require('./config/database.js');

// Connect DB
mongoose.connect(configDB.url);

var models = {};
models.User = User;
models.Project = Project;

var utils = {};
utils.multiparty = multiparty;
utils.path = path;
utils.fs = fs;
utils.rimraf = rimraf;
//utils.objectId = objectId;
utils.AWS = AWS;

// Set Port
app.set('port', (process.env.PORT || 5002));

// Set Web Visible Path
app.use(express.static(__dirname + '/public'));

// Need for Posting Data
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Get Server Side Main Index
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// routes
require(__dirname + '/server/routes')(app, utils, models);

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
