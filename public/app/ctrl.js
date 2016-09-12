
app.controller('HomeCtrl', function($scope, $window, $location, $localStorage) {


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

app.controller('AccountAddWatermark', function($scope, $localStorage, $timeout, Upload) {
    $scope.localStorage = $localStorage;
    $scope.processedImgs = $localStorage.henrich.processedImgs;
    $scope.watermarkImg = '';
    $scope.file = '';

    console.log($scope.processedImgs);

    if($scope.localStorage.henrich.watermarkSavedOpts) {
        $scope.wmOpts = $scope.localStorage.henrich.watermarkSavedOpts;
    } else {
        $scope.wmOpts = {
            path: '',
            text: 'Watermark',
            textSize: 150,
            textWidth: 1000,
            margin: 2,
            opacity: 0.8,
            textBg: 'rgb(60, 56, 56)',
            textColor: 'rgb(255, 255, 255)',
            gravity: 'se'
        };
    }


    $scope.previewFile = function() {
        $scope.wmOpts.text = '';
        var preview = document.getElementById('watermarkPreview');
        var file    = document.getElementById('watermarkInput').files[0];
        var reader  = new FileReader();

        reader.addEventListener("load", function () {
            console.log(reader);
            preview.src = reader.result;
            $scope.wmOpts.path = preview.src;
            $scope.refreshWm();
        }, false);

        if(file) {
            reader.readAsDataURL(file);
        }

    }

    $scope.emptyPreviewImg = function() {
        $('#watermarkInput').html($('#watermarkInput').html());
        $scope.wmOpts.path = '';
        $scope.file = '';
        $scope.refreshWm();
    }

    $scope.eventApi = {
        onChange: function(api, color, $event) {$scope.refreshWm();},
        onClose: function(api, color, $event) {$scope.refreshWm();},
        onClear: function(api, color, $event) {$scope.refreshWm();},
        onReset: function(api, color, $event) {$scope.refreshWm();}
    };
    $scope.eventBgApi = {
        onChange: function(api, color, $event) {$scope.refreshWm();},
        onClose: function(api, color, $event) {$scope.refreshWm();},
        onClear: function(api, color, $event) {$scope.refreshWm();},
        onReset: function(api, color, $event) {$scope.refreshWm();}
    };

    $scope.colorPickClick = function() {
        $($scope.cp1).toggle();
    }

    $scope.colorPickBgClick = function() {
        $($scope.cp2).toggle();
    }

    $timeout(function(){
        $scope.cp1 = $('.color-picker div.color-picker-wrapper div.color-picker-panel.color-picker-panel-bottom.color-picker-panel-left.color-picker-show-hue.color-picker-show-alpha.ng-hide').toggle();
    },500)
    $timeout(function(){
        $scope.cp2 = $('.color-picker-bg div.color-picker-wrapper div.color-picker-panel.color-picker-panel-bottom.color-picker-panel-left.color-picker-show-hue.color-picker-show-alpha.ng-hide').toggle();
    },500)

    $scope.pickerOpts = {
        format: 'rgb',
        swatchOnly: true
    }

    $scope.pickerBgOpts = {
        format: 'rgb',
        swatchOnly: true
    }

    $scope.gravityChange = function(point) {
        $scope.wmOpts.gravity = point;
        $scope.refreshWm();
    }

    $('.watermark-preview').watermark($scope.wmOpts);

    $('.watermark-preview').load(function() {
        $scope.refreshWm();
    });


    $scope.refreshWm = function() {
        setTimeout(function(){
            $scope.localStorage.henrich.watermarkSavedOpts = $scope.wmOpts;
            var tempEl = $('.watermark-preview').clone()
            $('.watermark-preview').remove();
            //var img = $('<img class="watermark-preview">');
            tempEl.attr('src', $scope.processedImgs[0].url);
            tempEl.appendTo('#watermark-preview-div');
            $(tempEl).load(function() {
                $('.watermark-preview').watermark($scope.wmOpts);
            });
      }, 500);

    }
})

app.controller('AccountEditProjectColorCtrl', function($scope, $location, $localStorage, uploadedImages, $timeout) {
    $scope.colorValues = [];
    $localStorage.henrich.processedImgs = [];
    $scope.localStorage = $localStorage;
    console.log($scope.localStorage.henrich.preImages);

    if($localStorage.henrich.projectInfo !== undefined) {
        $scope.projectInfo = $scope.localStorage.henrich.projectInfo;
    }

    for (key in $scope.localStorage.henrich.preImages) {
        $scope.colorValues.push({key: key, maxContrast: 0, maxBrightness: 0, maxSharpness: 0});
    }

    $scope.changeColorValues = function(newval, type) {
        Caman('#fab-can-'+newval.key+'', function() {
            this.revert(updateContext = true);
            this.contrast(newval.maxContrast);
            this.brightness(newval.maxBrightness);
            this.vibrance(newval.maxSharpness);
            this.render();
        })
    }

    $scope.saveColorCorrection = function() {
        var storedImgs = $localStorage.henrich.preImages;

        for(key in storedImgs) {
            if($('#fab-can-'+key+'')[0]['tagName'] == 'CANVAS') {
                var canvas = document.getElementById('fab-can-'+key+'');
                canvas.toBlob(function(blob) {
                    url = URL.createObjectURL(blob);
                    $localStorage.henrich.processedImgs.push({url: url});
                });
            } else {
                $localStorage.henrich.processedImgs.push({url: storedImgs[key].url});
            }
            $location.path('/watermark-images');
        }

    }

    var timeoutPromise;
    $scope.$watch('colorValues', function(newVal, oldVal) {
        $timeout.cancel(timeoutPromise);
        timeoutPromise = $timeout(function(){   //Set timeout
            var i = newVal.length;
            while(i--) {
                if(newVal[i].maxContrast !== oldVal[i].maxContrast) {
                    $scope.changeColorValues(newVal[i]);
                }
                if(newVal[i].maxBrightness !== oldVal[i].maxBrightness) {
                    $scope.changeColorValues(newVal[i]);
                }
                if(newVal[i].maxSharpness !== oldVal[i].maxSharpness) {
                    $scope.changeColorValues(newVal[i]);
                }
            }
        },100);
    }, true);

})

app.controller('AccountAddProjectCtrl', function($scope, $http, $location, $localStorage, auth, Upload, uploadedImages, user, project, $timeout) {
    $scope.user = user;
    $scope.uploadedImages = uploadedImages;
    $scope.projectInfo = {};
    $scope.files = '';
    $scope.localStorage = $localStorage;
    $scope.projectStep = {};
    $scope.canvasList = [];

    if($localStorage.henrich.projectInfo !== undefined) {
        $scope.projectInfo = $scope.localStorage.henrich.projectInfo;
    }

    $scope.nextColor = function(files) {
        $scope.localStorage.henrich.projectInfo = $scope.projectInfo;
        $scope.localStorage.henrich.preImages = [];
        for(key in files) {
            $scope.localStorage.henrich.preImages.push({
                name: files[key].name,
                url: files[key].$ngfBlobUrl
            });
        }
        $location.path('/color-correction');
    }

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
            if(resp.success == true) {$location.path('/projects');}
        })
    }
    $scope.deleteImage = function(imgName) {
        var imgPostArr = {
            imgName: imgName,
            projectID: $scope.projectID,
            userID: $scope.gotProjectInfo.userID
        };
        project.deleteImage(imgPostArr, function(resp) {
            $("[data-img='"+imgPostArr.imgName.Key+"']").remove();
        })
    }
})
