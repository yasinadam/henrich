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


app.service('member', function($localStorage, $location, $http, auth, details, alerts) {
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

    return member;
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
