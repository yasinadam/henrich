// load the things we need
var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
    name: String,
    desc: String,
    userID: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Project', projectSchema);
