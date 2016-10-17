// Require Express
var express         = require('express'),
    app             = express(),
    bodyParser      = require('body-parser'),
    multiparty      = require('multiparty'),
    path            = require('path'),
    fs              = require ('fs.extra'),
    rimraf          = require('rimraf'),
    AWS = require('aws-sdk');

if(process.env.NODE_ENV !== 'dev') {
    AWS.config = new AWS.Config();
    AWS.config.update({region:'eu-west-1'});
} else {
    //aws credentials
    AWS.config.loadFromPath('~/.aws/credentials.json');
}

console.log(process.env.NODE_ENV);

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
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Get Server Side Main Index
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// routes
require(__dirname + '/server/routes')(app, utils, models);

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
