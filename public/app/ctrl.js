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

app.controller('MemberCtrl', function($scope, $http, $location, auth, member, alerts) {
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
