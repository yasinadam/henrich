
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

app.controller('AccountSideNaviCtrl', function($scope, $location) {
    $scope.currentView = $location.path();

})

app.controller('AccountProfileCtrl', function($scope, $http, member, user, func) {
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

app.controller('AccountSingleCtrl', function($scope, $location, $http, project) {
    if($location.path() == '/single') {
        $scope.gotProjectInfo = '';
        $scope.projectID = $location.search().id;
        project.getProject($scope.projectID, function(response) {
            console.log(response);
            $scope.gotProjectInfo = response.data.info;
            $scope.gotProjectImages = response.data.images.Contents;
            console.log($scope.gotProjectImages);
        })
    }
})

app.controller('AccountProjectsCtrl', function($scope, project) {
    $scope.projects = '';
    project.getAllUserProjects(function(resp) {
        $scope.projects = resp;
    })

    $scope.deleteProject = function(projectID, userID) {
        var projectInfo = {projectID: projectID, userID: userID};
        console.log(projectInfo);
        project.deleteProject(projectInfo, function(resp) {
            //$scope.projects = resp;
            console.log(resp);
            if(resp == true) {
                $('#'+projectID+'').remove();
            }
        })
    }

})

app.controller('AccountAddProjectCtrl', function($scope, $http, $location, auth, Upload, uploadedImages, user, project) {
    $scope.user = user;
    $scope.uploadedImages = uploadedImages;
    $scope.projectInfo = {};
    $scope.files = '';

    $scope.addProject = function() {
        console.log($scope.files);
        $scope.uploadInProgress = true;
        $scope.uploadProgress = 0;
        $scope.uploadedImages = {};

        auth.getToken(function(token){
            $scope.upload = Upload.upload({
                url: '/api/project/add-project',
                method: 'POST',
                data: {
                  token: token,
                  projectInfo: $scope.projectInfo
                },
                file: $scope.files
            }).progress(function(event) {
                //$scope.uploadProgress = Math.floor(event.loaded / event.total);
                //$scope.$apply();
            }).success(function(data, status, headers, config) {
                $location.path('/projects');
            }).error(function(err) {
                //$scope.uploadInProgress = false;
                //AlertService.error('Error uploading file: ' + err.message || err);
            })
        });
    }
})

app.controller('AccountEditProjectCtrl', function($scope, $http, $location, auth, Upload, uploadedImages, user, project) {
    $scope.files = '';
    if($location.path() == '/edit-project') {
        $scope.gotProjectInfo = '';
        $scope.projectID = $location.search().id;
        project.getProject($scope.projectID, function(response) {
            $scope.gotProjectInfo = response.data.info;
            $scope.gotProjectImages = response.data.images.Contents;
        })
    }
    $scope.updateProject = function() {
        project.updateProject($scope.gotProjectInfo, $scope.files, function(resp) {
            if(resp.success == true) {$location.path('/single').search('id', $scope.projectID);}
        })
    }
    $scope.deleteImage = function(imgName) {
        var imgPostArr = {
            imgName: imgName,
            projectID: $scope.projectID,
            userID: $scope.gotProjectInfo.userID
        };
        project.deleteImage(imgPostArr, function(resp) {
            $("[data-img='"+imgPostArr.imgName+"']").remove();
        })
    }
})
