app.config(function($routeProvider, $locationProvider, $httpProvider) {

    var viewDir = 'app/views/';

    $routeProvider

    .when('/', {
        templateUrl : viewDir+'home/home-view.html',
        controller  : 'HomeCtrl'
    })

    .when('/signup', {
        templateUrl : viewDir+'member/signup-view.html',
        controller  : 'MemberCtrl'
    })

    .when('/login', {
        templateUrl : viewDir+'member/login-view.html',
        controller  : 'MemberCtrl'
    })

    .when('/account', {
        templateUrl : viewDir+'member/account-view.html',
        controller  : 'MemberCtrl',
        type        : 'protected'
    })

    .when('/profile', {
        templateUrl : viewDir+'member/profile-view.html',
        controller  : 'ProfileCtrl',
        type        : 'protected'
    })

    .otherwise({
        redirectTo: '/'
    });

    $locationProvider.html5Mode(true);

});

app.run(function($http, $localStorage, $log, $location, details, $rootScope) {
    $('body').hide();
    $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
        var type = current.$$route.type;
        if(type !== undefined) {
            var type = current.$$route.type;
            if(type == 'protected') {
                var token = $localStorage.token;
                if(token) {
                    $http.post('/api/member/check-token', {data: token}).then(function(res) {
                        if(res.data.status == true) {
                            // verified
                            details.loggedIn = true;
                        } else {
                            details.loggedIn = false;
                            $location.path('/login');
                        }
                    })
                } else {
                    details.loggedIn = false;
                    $location.path('/login');
                }
            }
        }
    })
})
