var func = {};

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

func.sendInfo = function(res, status, dataObj) {
    //console.log(dataObj);
    if(dataObj.data) {
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
