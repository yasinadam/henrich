// Directives Path
var dir = 'app/views/';

app.directive('head', function() {
	return {
		templateUrl: dir+'head.html',
		controller: 'HomeCtrl',
	}
})

app.directive('navi', function() {
	return {
		templateUrl: dir+'navi.html',
		controller: 'NaviCtrl',
	}
})

app.directive('foot', function() {
	return {
		templateUrl: dir+'footer.html',
		controller: 'HomeCtrl',
	}
})

app.directive('accountSideNavi', function() {
	return {
		templateUrl: dir+'account/account-side-navi.html',
		controller: 'AccountSideNaviCtrl',
	}
})

app.directive('accountProfileView', function() {
	return {
		templateUrl: dir+'account/account-profile-view.html',
		controller: 'AccountProfileCtrl',
	}
})


// Utility Directives //

app.directive('imageonload', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('load', function() {
                    //call the function that was passed
                    scope.$apply(attrs.imageonload);
                });
            }
        };
    })

app.directive("passwordVerify", function() {
   return {
      require: "ngModel",
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ctrl) {
        scope.$watch(function() {
            var combined;

            if (scope.passwordVerify || ctrl.$viewValue) {
               combined = scope.passwordVerify + '_' + ctrl.$viewValue;
            }
            return combined;
        }, function(value) {
            if (value) {
                ctrl.$parsers.unshift(function(viewValue) {
                    var origin = scope.passwordVerify;
                    if (origin !== viewValue) {
                        ctrl.$setValidity("passwordVerify", false);
                        return undefined;
                    } else {
                        ctrl.$setValidity("passwordVerify", true);
                        return viewValue;
                    }
                });
            }
        });
     }
   };
});
