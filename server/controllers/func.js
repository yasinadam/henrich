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
            callback(false);
        } else {
            callback(true);
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
            callback(err);
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

func.getProjectImages = function(projectID, userID, fs, callback) {
    var dir = __dirname+'../../../public/uploads/images/'+userID+'/'+projectID;
    fs.readdir(dir, function (err, files) {
        if (err) {
            throw err;
        }
        callback(files);
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
    console.log(query);

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
    utils.rimraf(__dirname+'../../../public/uploads/images/'+projectInfo.userID+'/'+projectInfo.projectID, function(err) {
        if(err) {console.log(err);}
        callback(true);
    })
}

func.deleteImage = function(imgPostArr, fs, callback) {
    var img = __dirname+'../../../public/uploads/images/'+imgPostArr.userID+'/'+imgPostArr.projectID+'/'+imgPostArr.imgName;
    fs.stat(img, function (err, stats) {
        console.log(stats);//here we got all information of file in stats variable
        if(err) {
            console.error(err);
        }
        fs.unlink(img,function(err){
            if(err) return console.log(err);
            callback(true);
        });
    });
}

func.addImage = function(files, projectInfo, utils, callback) {
    var userImgDir = __dirname+"../../../public/uploads/images/" + projectInfo.userID + '/'+ projectInfo._id;
    var imgArr = [];
    try {
        utils.fs.mkdirSync(userImgDir);
    } catch(e) {
        if ( e.code != 'EEXIST' ){console.log(e);};
    }
    var count = Object.keys(files).length;
    for(var key in files) {
        //console.log(files[key][0].path);
        var uploadDate = JSON.stringify(Math.round(new Date().getTime()/1000));
        var tempPath = files[key][0].path;
        var targetPath = userImgDir + '/' + uploadDate + '-' + files[key][0].originalFilename;
        imgArr.push({name: files[key][0].originalFilename, path: projectInfo.userID+'/'+ uploadDate + '-' + files[key][0].originalFilename});
        utils.fs.move(tempPath, targetPath, function(err) {
            if(err) {console.log(err);}
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
