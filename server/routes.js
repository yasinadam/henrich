var func = require(__dirname + '/controllers/func.js');
var jwt = require('jsonwebtoken');
var jwtSecret 	= 'jwtSecretKey';
var webtoken = {};
webtoken.jwt = jwt;
webtoken.jwtSecret = jwtSecret;

module.exports = function(app, utils, models) {

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
		func.checkDuplicate(models.User, ['email', 'password'], [req.body.email, req.body.password], function(duplicate) {
			if(duplicate.status == false) {
				// there's an account match
				var token = webtoken.jwt.sign(req.body.email, webtoken.jwtSecret);
				func.sendInfo(res, duplicate.status,
					{data: {data: duplicate.data._id, token: token, errMessage: 'Account match!.'}});
			} else {
				// No duplicate in mongo so no account matches
				func.sendInfo(res, duplicate.status,
					{message: 'Email does not exist. Signup today!'});
			}
		})
	});

	app.post('/api/member/get-profile-data', function(req, res) {
		var decodedEmail = webtoken.jwt.verify(req.body.data, jwtSecret);
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
				func.sendInfo(res, true, {message: 'authenticated'});
			} else {
				func.sendInfo(res, false, {errMessage: 'Invalid'});
			}
		} else {
			func.sendInfo(res, false, {errMessage: 'Invalid'});
		}
	});

	app.post('/api/project/add-project', function(req, res) {
		var form = new utils.multiparty.Form();
		form.parse(req, function(err, fields, files) {
			var token = fields.token[0];
			func.IdFromToken(models.User, token, webtoken, function(userID) {
				// Add Project to mongo
				func.addRecord(models.Project, {userID: userID, name:fields['projectInfo[projectName]'][0] , desc: fields['projectInfo[projectDesc]'][0]}, function(projectInfo) {
					if(files) {
						func.addImage(files, projectInfo, utils, function(resp) {
							func.sendInfo(res, true, {message: 'Project Added', data: projectInfo._id});
						})
					}
				})
			})
		})
	});

	app.post('/api/project/get-project-data', function(req, res) {
		func.getRecord(models.Project, '_id', req.body.data, function(projectInfo) {
			if(projectInfo) {
				func.getProjectImages(req.body.data, projectInfo.userID, utils, function(images) {
					console.log(images);
					func.sendInfo(res, true, {
						message: 'Got Project Info',
						data: {info:projectInfo, images: images}
					});
				})
			}
		})
	})

	app.post('/api/project/get-all-projects', function(req, res) {
		func.IdFromToken(models.User, req.body.token, webtoken, function(userID) {
			func.getAllRecords(models.Project, 'userID', userID, function(projectsInfo) {
				if(projectsInfo) {
					func.sendInfo(res, true, {message: 'Got Projects Info', data: projectsInfo});
				}
			})
		})
	})

	app.post('/api/project/update-project', function(req, res) {
		var form = new utils.multiparty.Form();
		form.parse(req, function(err, fields, files) {
			var projectInfo = {
				_id: fields['projectInfo[_id]'],
				name: fields['projectInfo[name]'],
				desc: fields['projectInfo[desc]'],
				userID: fields['projectInfo[userID]']
			}
			func.updateRecord(models.Project, {'_id': fields['projectInfo[_id]']}, projectInfo, function(updateStatus) {
				if(updateStatus == true) {
					if(files) {
						func.addImage(files, projectInfo, utils, function(resp) {
							func.sendInfo(res, true, {message: 'Updated Added'});
						})
					}
					func.sendInfo(res, true, {message: 'Updated Added'});
				}
			})
		})
	})

	app.post('/api/project/save-project', function(req, res) {
		func.addRecord(models.Project, req.body, function(status) {
			if(status !== false) {
				func.addImage(status, utils, function(resp) {
					func.sendInfo(res, resp, {message: 'Image'});
				})
			}
		})
	})

	/*app.post('/api/project/add-image', function(req, res) {
		func.addRecord(req.body, function(status) {
			if(status !== false) {
				func.addImage(status, utils, function(resp) {
					func.sendInfo(res, resp, {message: 'Updated'});
				})
			}
		})
		/*func.addRecord(models.Project, req.body, function(status) {
			console.log(status);
		})
	})*/

	app.post('/api/project/delete-project', function(req, res) {
		func.deleteRecord(models.Project, '_id', req.body.projectID, function(deleteStatus) {
			console.log(deleteStatus);
			//if(deleteStatus == true) {
				func.deleteProjectImageFolder(req.body, utils, function(status) {
					func.sendInfo(res, status, {message: 'Deleted Project'});
				})
			//}
		})
	})

	app.post('/api/project/delete-image', function(req, res) {
		func.deleteImage(req.body, utils, function(deleteStatus) {
			console.log(deleteStatus);
			if(deleteStatus) {
				func.sendInfo(res, true, {message: 'Deleted Image'});
			}
		})
	})

	app.get('*', function(req, res) {
        res.render('pages/index');
    });

}; // End Routes
