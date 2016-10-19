var func = {};

func.emailFromToken = function(token, webtoken, callback) {
    if(token !== false) {
        var decodedEmail = webtoken.jwt.verify(token, webtoken.jwtSecret);
        if(decodedEmail) {
            callback(true);
        } else {
            callback(false);
        }
    } else {
        callback(false);
    }
}

func.IdFromToken = function(model, token, webtoken, callback) {
    if(token !== false) {
        var decodedEmail = webtoken.jwt.verify(token, webtoken.jwtSecret);
        if(decodedEmail) {
            model.findOne({email: decodedEmail}, function(err, doc) {
                if(err) {callback(err);}
                if(doc) {
                    callback(doc._id);
                } else {
                    callback(false);
                }
            })
        } else {
            callback(false);
        }
    } else {
        callback(false);
    }
}

func.checkDuplicate = function(model, field, value, callback) {
    var query = {};
    if(typeof(field) == 'object') {
        for(var i = 0; i < field.length; i++) {
            query[field[i]] = value[i];
        }
    } else {
        query[field] = value;
    }
    model.findOne(query, function(err, duplicate) {
        if(err) {callback(err);}
        if(duplicate) {
            callback({data: duplicate, status: false});
        } else {
            callback({data: duplicate, status: true});
        }
    })
}

func.addRecord = function(model, dataObj, callback) {
    var mod = new model();
    for (var prop in dataObj) {
        mod[prop] = dataObj[prop];
    }
    mod.save(function(err, user){
        if(err){
            callback(false);
        } else {
            callback(user);
        }
    })
}

func.getRecord = function(model, field, value, callback) {
    var query = {};
    query[field] = value;
    model.findOne(query, function(err, doc) {
        if(err) {callback(err);}
        if(doc) {
            callback(doc);
        } else {
            callback(false);
        }
    })
}

func.getAllRecords = function(model, field, value, callback) {
    var query = {};
    query[field] = value;
    model.find(query, function(err, docs) {
        if(err) {callback(err);}
        if(docs) {
            callback(docs);
        } else {
            callback(false);
        }
    })
}

func.getProjectImages = function(projectID, userID, utils, callback) {
    console.log(projectID);
    console.log(userID);
    var s3 = new utils.AWS.S3();
    //var dir = 'http://s3-eu-west-1.amazonaws.com/uploads/images/'+userID+'/'+projectID;
    var dir = 'henrich-app';

    var params = { Bucket: dir,  Prefix: 'uploads/images/'+userID+'/'+projectID+'/'};
    s3.listObjects(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     callback(data);         // successful response
    });
}

func.deleteRecord = function(model, field, value, callback) {
    var query = {};
    query[field] = value;
    console.log(query);
    model.findOneAndRemove(query, function(err, doc) {
        if(err) {callback(err);}
        if(doc) {
            callback(true);
        } else {
            callback(false);
        }
    })
}

func.updateRecord = function(model, selector, dataObj, callback) {
    query = {};
    query[selector.key] = selector.value;

    model.findOne(query, function(err, doc) {
        for (var prop in dataObj) {
            if(prop !== '_id') {
                doc[prop] = dataObj[prop];
            }
        }
        doc.save(function(err) {
            if(err) {
                console.log(err);
                callback(err);
            } else {
                callback(true);
            }
        })
    });
}

func.deleteProjectImageFolder = function(projectInfo, utils, callback) {
    var s3 = new utils.AWS.S3();
    var params = {
        Bucket: 'henrich-app',
        Prefix: 'uploads/images/'+projectInfo.userID+'/'+projectInfo.projectID+'/'
    };
    s3.listObjects(params, function(err, data) {
        if(err){
            //callback(err, err.stack);
            console.log(err, err.stack)
        } else {
            var tempDeleteArr = [];
            for(key in data.Contents) {
                tempDeleteArr.push({Key: data.Contents[key].Key});
            }
            var params2 = {
                Bucket: 'henrich-app',
                Delete: {Objects: tempDeleteArr}
            };
            s3.deleteObjects(params2, function(err, data) {
              if (err) callback(err, err.stack); // an error occurred
              else     callback(true);           // successful response
          });
        }
    });

}

func.deleteImage = function(imgPostArr, utils, callback) {
    var s3 = new utils.AWS.S3();
    var params = {
        Bucket: 'henrich-app',
        Key: imgPostArr.imgName.Key
    };
    s3.deleteObject(params, function(err, data) {
        if(err){
            callback(err, err.stack);
        } else {
            callback(true);
        }
    });
}

func.addImage = function(data, utils, callback) {
    //console.log(data);
    var s3 = new utils.AWS.S3();

    for(key in data.postWatermarkBlobs) {
        var obj = data.postWatermarkBlobs[key].obj.replace(/^data:image\/\w+;base64,/, "")
        var uploadDate = JSON.stringify(Math.round(new Date().getTime()/1000));
        var targetPath = 'uploads/images/' + data.userID + '/'+ data._id +'/' + uploadDate + '-' +  data.postWatermarkBlobs[key].name;
        //var targetPath = 'uploads/images/' + projectInfo.userID + '/' + projectInfo._id + '/' + uploadDate + '-' +  files[key][0].originalFilename;
        var buf = new Buffer(obj,'base64');
        var params = {
            Bucket: 'henrich-app',
            Key: targetPath,
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg',
            ACL: 'public-read'
        };

        s3.upload(params, function(err, data) {
            console.log(err, data);
        });
    }
    callback(true);
}

func.sendInfo = function(res, status, dataObj) {
    //console.log(dataObj);
    if(dataObj && dataObj.data) {
        var dataHold = dataObj.data;
    }
    if(status == true) {
        res.json({
            success: status,
            message: dataObj.message,
            data: dataHold
        })
    } else {
        res.json({
            success: status,
            message: dataObj.errMessage,
            data: dataHold
        })
    }
}

module.exports = func;
