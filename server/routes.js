var func = require(__dirname + '/controllers/func.js');
var jwt = require('jsonwebtoken');
var jwtSecret 	= 'jwtSecretKey';

module.exports = function(app, models) {

	app.post('/api/member/signup', function(req, res) {
		func.checkDuplicate(models.User, 'email', req.body.email, function(duplicateStatus) {
			if(duplicateStatus == false) {
				// there's a duplicate
				func.sendInfo(res, duplicateStatus,
					{errMessage: 'This Emails already signed up. Login or reset password.'});
			} else {
				// No duplicate in mongo so add record
				func.addRecord(models.User, req.body, function(recordStatus) {
					var token = jwt.sign(req.body.email, jwtSecret);
					func.sendInfo(res, recordStatus,
						{data: token, errMessage: 'Account match!.'});
				})
			}
		})
	});

	app.post('/api/member/login', function(req, res) {
		func.checkDuplicate(models.User, ['email', 'password'], [req.body.email, req.body.password], function(duplicateStatus) {
			if(duplicateStatus == false) {
				// there's an account match
				var token = jwt.sign(req.body.email, jwtSecret);
				func.sendInfo(res, duplicateStatus,
					{data: token, errMessage: 'Account match!.'});
			} else {
				// No duplicate in mongo so no account matches
				func.sendInfo(res, duplicateStatus,
					{message: 'Email does not exist. Signup today!'});
			}
		})
	});

	app.post('/api/member/get-profile-data', function(req, res) {
		var decodedEmail = jwt.verify(req.body.data, jwtSecret);
		func.getRecord(models.User, 'email', decodedEmail, function(status) {
			if(status !== false) {
				func.sendInfo(res, true, {data: status});
			} else {
				func.sendInfo(res, status, {errMessage: 'Could not find any records.'});
			}
		})
	});

	app.post('/api/member/save-profile-data', function(req, res) {
		var user = req.body.data
		func.updateRecord(models.User, {key: 'email', value: user.email}, user, function(status) {
			if(status !== false) {
				func.sendInfo(res, true, {data: status});
			} else {
				func.sendInfo(res, status, {errMessage: 'Could not find any records.'});
			}
		})
	});

	app.post('/api/member/check-token', function(req, res) {
		var token = req.body.data;
		if(token !== false) {
			var decodedEmail = jwt.verify(token, jwtSecret);
			if(decodedEmail) {
				res.json({status: true});
			} else {
				res.json({status: false});
			}
		} else {
			res.json({status: false});
		}
	});

	app.get('*', function(req, res) {
        res.render('pages/index');
    });

}; // End Routes
