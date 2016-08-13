app.factory('details', function() {
    return {
        number: '555-5555',
        loggedIn: false
    }
})

app.factory('alerts', function() {
    return {
        signup: '',
        login: '',
    }
})

app.factory('user', function() {
    return {
        _id: '',
        name: '',
        email: '',
        password: ''
    }
})

app.factory('uploadedImages', function() {
    return {}
})


app.service('member', function($localStorage, $location, $http, auth, details, alerts, user) {
    var member = {};

    member.logout = function() {
        delete $localStorage.token;
        details.loggedIn = false;
        $location.path('/login');
    }

    member.signup = function(signupData, callback) {
        $('#signup-alert').hide();
        $('#signup-container').addClass('loading');
        $http.post('/api/member/signup', signupData).then(function(response) {
            if(response.data.success == false) {
                $('#signup-alert').show();
                alerts.signup = response.data.message;
            } else {
                auth.saveStorageField('token', response.data.data, function(resp) {
                    $location.path('/account');
                    details.loggedIn = true;
                })
            }
        })
        $('#signup-container').removeClass('loading');
    }

    member.login = function(loginData) {
        $('#login-container').addClass('loading');
        $http.post('/api/member/login', loginData).then(function(response) {
            if(response.data.success == false) {
                auth.saveStorageField('token', response.data.data, function(resp) {
                    $location.path('/account');
                    details.loggedIn = true;
                })
            } else {
                alerts.login = response.data.message;
                $('#login-alert').show();
            }
        })
        $('#login-container').removeClass('loading');
    }

    member.getProfileData = function(callback) {
        auth.getToken(function(token) {
            $http.post('/api/member/get-profile-data', {data: token}).then(function(response) {
                if(response.data.success == true) {
                    callback(response.data.data);
                } else {
                    // error
                }
            })
        })
    }

    member.saveProfileData = function(callback) {
        $http.post('/api/member/save-profile-data', {data: user}).then(function(response) {
            if(response.data.success == true) {
                callback(response.data.data);
            } else {
                // error
            }
        })
    }

    return member;
})

app.service('project', function($http, auth, Upload, $location) {
    var project = {};

    project.getProject = function(projectID, callback) {
        $http.post('/api/project/get-project-data', {data: projectID}).then(function(response) {
            if(response.data.success == true) {
                callback(response.data);
            } else {
                // error
            }
        })
    }

    project.getAllUserProjects = function(callback) {
        auth.getToken(function(token) {
            $http.post('/api/project/get-all-projects', {token: token}).then(function(response) {
                if(response.data.success == true) {
                    callback(response.data.data);
                } else {
                    // error
                }
            })
        })
    }

    project.updateProject = function(projectInfo, files, callback) {
        Upload.upload({
            url: '/api/project/update-project',
            method: 'POST',
            data: {
              projectInfo: projectInfo,
            },
            file: files
        }).progress(function(event) {
            //$scope.uploadProgress = Math.floor(event.loaded / event.total);
            //$scope.$apply();
        }).success(function(data, status, headers, config) {
            callback(data);
        }).error(function(err) {
            //$scope.uploadInProgress = false;
            //AlertService.error('Error uploading file: ' + err.message || err);
        })
        /*$http.post('/api/project/update-project', {projectInfo: projectInfo}).then(function(response) {
            if(response.data.success == true) {
                callback(response.data);
            } else {
                // error
            }
        })*/
    }

    project.deleteProject = function(projectInfo, callback) {
        $http.post('/api/project/delete-project', projectInfo).then(function(response) {
            if(response.data.success == true) {
                callback(true);
            } else {
                // error
            }
        })
    }

    project.deleteImage = function(imgPostArr, callback) {
        $http.post('/api/project/delete-image', imgPostArr).then(function(response) {
            if(response.data.success == true) {
                callback(response);
            } else {
                // error
            }
        })
    }

    return project;
})

app.service('auth', function($window, $location, $http, $localStorage) {
    var auth = {};

    auth.getToken = function(callback) {
        var token = $localStorage.token;
        if(token) {
            callback(token);
        } else {
            callback(false);
        }
    }

    auth.checkToken = function(token, callback) {
        $http.post('/api/member/check-token', {data: token}).then(function(res) {
            if(res.status == true) {
                console.log('is veri');
            }
            callback(res);
        })
        .catch(function(res) {
            console.error('error', res.status, res.data);
        })
        .finally(function() {
            //callback(res);
        });
    }

    auth.saveStorageField = function(field, value, callback) {
        if(field) {
            $localStorage[field] = value;
            if($localStorage[field]) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    }

    return auth;

});

app.service('hacks', function($location) {
    var hacks = {};

    hacks.css = function() {
        var bodyColor = '#fff';
        switch($location.path()) {
            case '/login': bodyColor = '#DADADA'; break;
            case '/signup': bodyColor = '#DADADA'; break;
        }
        $('body').css('background', bodyColor);
    }
    return hacks;
})

app.service('func', function() {
    var func = {};

    func.toggle = function(value, callback) {
        value = value === false ? true: false;
        callback(value);
    }

    return func;
})
