app.controller('HomeCtrl', function($scope, $window, $location) {
    $("#semantic").load(function(){
      $('body').show();
    })
    $('body').slimScroll({height: '100%', wheelStep: 6});
})

app.controller('NaviCtrl', function($scope, details, member, hacks) {
    $scope.details = details;
    hacks.css();

    $scope.logout = function() {
        member.logout();
    }
})

app.controller('MemberCtrl', function($scope, $http, $location, auth, member, alerts, user) {
    $scope.user = user;
    $scope.signupData = {};
    $scope.confirmPassword = '';
    $scope.loginData = {};
    $scope.alerts = alerts;

    $scope.signupDataSubmit = function() {
        member.signup($scope.signupData);
    }

    $scope.loginDataSubmit = function() {
        member.login($scope.loginData, function() {

        });
    }

    $scope.authenticate = function() {
        auth.getToken(function(token) {
            auth.checkToken(token, function(status) {
                console.log(status);
            })
        })
    }

})


app.controller('ProfileCtrl', function($scope, $http, member, user, func) {
    $scope.user = user;
    $scope.editButton = false;

    $scope.editButtonState = function() {
        func.toggle($scope.editButton, function(response) {
            $scope.editButton = response;
        })
    }

    $scope.getProfileData = function() {
        member.getProfileData(function(data) {
            user.name = data.name;
            user.email = data.email;
            user.password = data.password;
        })
    }

    $scope.saveProfileData = function() {
        member.saveProfileData(function(response) {
            console.log(response);
        })
    }

    $scope.getProfileData();

})
