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
        templateUrl : viewDir+'account/account-view.html',
        controller  : 'MemberCtrl',
        type        : 'protected'
    })

    .when('/profile', {
        templateUrl : viewDir+'account/account-profile-view.html',
        controller  : 'AccountProfileCtrl',
        type        : 'protected'
    })

    .when('/projects', {
        templateUrl : viewDir+'account/account-projects-view.html',
        controller  : 'AccountProjectsCtrl',
        type        : 'protected'
    })

    .when('/single', {
        templateUrl : viewDir+'account/account-single-view.html',
        controller  : 'AccountSingleCtrl',
        type        : 'protected'
    })

    .when('/add-project', {
        templateUrl : viewDir+'account/account-add-project-view.html',
        controller  : 'AccountAddProjectCtrl',
        type        : 'protected'
    })

    .when('/edit-project', {
        templateUrl : viewDir+'account/account-edit-project-view.html',
        controller  : 'AccountEditProjectCtrl',
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
                        if(res.data.success == true) {
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
