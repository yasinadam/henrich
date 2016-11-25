
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
                //console.log(status);
            })
        })
    }
})

app.controller('AccountSideNaviCtrl', function($scope, $location) {
    $scope.currentView = $location.path();
})

app.controller('AccountProfileCtrl', function($scope, $http, member, user, func, $localStorage) {
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
            //console.log(response);
        })
    }
    $scope.getProfileData();
})

app.controller('AccountSingleCtrl', function($scope, $location, $http, project) {
    if($location.path() == '/single') {
        $scope.gotProjectInfo = '';
        $scope.projectID = $location.search().id;
        project.getProject($scope.projectID, function(response) {
            $scope.gotProjectInfo = response.data.info;
            $scope.gotProjectImages = response.data.images.Contents;
        })
    }
})

app.controller('AccountProjectsCtrl', function($scope, project, $location, $localStorage) {
    $scope.projects = '';
    project.getAllUserProjects(function(resp) {
        $scope.projects = resp;
    })

    $scope.goToAddProject = function() {
        delete $localStorage.henrich.projectInfo;
        delete $localStorage.henrich.colorValues;
        delete $localStorage.henrich.preImages;
        delete $localStorage.henrich.processedImgs;
        delete $localStorage.henrich.skipWatermark;
        delete $localStorage.henrich.watermarkSavedImg;
        delete $localStorage.henrich.watermarkSavedOpts;
        delete $localStorage.henrich.postWatermarkBlobs;
        $location.path('/add-project');
    }

    $scope.deleteProject = function(projectID, userID) {
        var projectInfo = {projectID: projectID, userID: userID};
        $('#'+projectID+'').remove();
        //console.log(projectInfo);
        project.deleteProject(projectInfo, function(resp) {
            //$scope.projects = resp;
            //console.log(resp);
            if(resp == true) {
                $('#'+projectID+'').remove();
            }
        })
    }
})

app.controller('AccountAddProjectCtrl', function($scope, $http, $location, $localStorage, auth, Upload, uploadedImages, user, project) {
    $scope.user = user;
    $scope.uploadedImages = uploadedImages;
    $scope.projectInfo = {};
    $scope.files = '';
    $scope.localStorage = $localStorage;
    $scope.projectStep = {};
    $scope.canvasList = [];

    // delete saved project info

    if($localStorage.henrich.projectInfo !== undefined) {
        $scope.projectInfo = $scope.localStorage.henrich.projectInfo;
    }

    $scope.$watch('files', function (files) {
    if (files != null) {
      // make files array for not multiple to be able to be used in ng-repeat in the ui
      if (!angular.isArray(files)) {
        setTimeout(function () {
          $scope.files = files;
      },100);
        return;
      }

    }
  });


  $scope.previewCount = 0;

  $scope.doThis = function() {
      $scope.previewCount = $scope.previewCount + 1;
      if($scope.previewCount == $scope.files.length) {
          $('#imageProcessBtn').text('Start Image Processing');
          $('#imageProcessBtn').removeClass('disabled');
          $.modal.close();
      }
  }

  $scope.clearFiles = function() {}

  $scope.loadingPreview = function() {
      $('.modal').removeClass('hide');
      $('#add-img-modal').modal({
          escapeClose: false,
          clickClose: false,
          showClose: false
      });
  }

    $scope.nextColor = function(files) {
        $scope.localStorage.henrich.projectInfo = $scope.projectInfo;
        $scope.localStorage.henrich.preImages = [];
        for(key in files) {
            $scope.localStorage.henrich.preImages.push({
                name: files[key].name,
                url: files[key].$ngfBlobUrl,
                type: files[key].type,
                originalKey: key
            });
        }
        $location.path('/converging-lines');
    }

    $scope.addProject = function() {
        //console.log($scope.files);
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
            if(resp.success == true) {
                $location.path('/projects');
            }
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

app.controller('AccountFixPerspectiveCtrl', function($scope, $location, $localStorage) {
    $scope.localStorage = $localStorage;
    $scope.perspecArr = [];
    $scope.perspecValuesArr = {};
    $localStorage.henrich.convergCanvas = [];

    $scope.backToAddProject = function() {
        delete $localStorage.henrich.projectInfo;
        delete $localStorage.henrich.colorValues;
        delete $localStorage.henrich.preImages;
        delete $localStorage.henrich.processedImgs;
        delete $localStorage.henrich.skipWatermark;
        delete $localStorage.henrich.watermarkSavedImg;
        delete $localStorage.henrich.watermarkSavedOpts;
        delete $localStorage.henrich.postWatermarkBlobs;
        $location.path('/add-project');
    }

    $(document).ready(function(){
        var checkNub = function(flag, id, style, pos) {
            flag = flag + 1;
            var timeout1;
            timeout1 = setTimeout(function(){
                $('#'+id+'').css(style, ''+pos+'');
            }, 200)
            //window.clearTimeout(timeout1);
            return flag;
        }
        var timeout;
        timeout = setTimeout(function(){
            for(key in $scope.localStorage.henrich.preImages) {
                // try to create a WebGL canvas (will fail if WebGL isn't supported)
                try {
                    var canvas = fx.canvas();
                } catch (e) {
                    alert(e);
                    return;
                }

                var image = document.getElementById('fab-can-'+key+'');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                var texture = canvas.texture(image);
                canvas.setAttribute("id", "converg-"+key+"");
                canvas.imageSmoothingEnabled = false;

                canvas.draw(texture, image.naturalWidth, image.naturalHeight).update();
                // apply the ink filter
                //canvas.draw(texture).perspective([nub1y,nub1x,nub2y,nub2x,nub3y,nub3x,nub4y,nub4x], [nub1y,nub1x,nub2y,nub2x,nub3y,nub3x,nub4y,nub4x]);

                // replace the image with the canvas
                image.parentNode.insertBefore(canvas, image);
                image.parentNode.removeChild(image);
                //var imgHeight = $('#converg-'+key+'').attr('height');
                //var imgWidth = $('#converg-'+key+'').attr('width');
                var imgHeight = $('#converg-'+key+'').height();
                var imgWidth = $('#converg-'+key+'').width();
                $('#converg-'+key+'').after('<div id="nubs-'+key+'" style="height:'+imgHeight+'px;" class="nubs"></div>');
                // Add Nubs
                var nub1x = 0;
                var nub1y = 0;
                var nub2x = 0;
                var nub2y = imgWidth;
                var nub3x = imgHeight;
                var nub3y = 0;
                var nub4x = imgHeight;
                var nub4y = imgWidth;
                $('#nubs-'+key+'').after('<div id="nub1" class="nub-'+key+' nub" data-key="'+key+'" style="top:'+nub1x+'px; left:'+nub1y+'px;" class="nub"></div>');
                $('#nubs-'+key+'').after('<div id="nub2" class="nub-'+key+' nub" data-key="'+key+'" style="top:'+nub2x+'px; left:'+nub2y+'px;" class="nub"></div>');
                $('#nubs-'+key+'').after('<div id="nub3" class="nub-'+key+' nub" data-key="'+key+'" style="top:'+nub3x+'px; left:'+nub3y+'px;" class="nub"></div>');
                $('#nubs-'+key+'').after('<div id="nub4" class="nub-'+key+' nub" data-key="'+key+'" style="top:'+nub4x+'px; left:'+nub4y+'px;" class="nub"></div>');
                $('.nub-'+key+'').draggable();

                $scope.perspecArr.push({
                    key: key,
                    fn: canvas,
                    tex: texture,
                    img: image
                })

                $('.nub-'+key+'').on( "drag", function( event, ui ) {
                    var key = $(event.currentTarget).attr('data-key');
                    var newNub1x = parseInt($('#nub1.nub-'+key+'').css('top').replace('px', ""));
                    var newNub1y = parseInt($('#nub1.nub-'+key+'').css('left').replace('px', ""));
                    var newNub2x = parseInt($('#nub2.nub-'+key+'').css('top').replace('px', ""));
                    var newNub2y = parseInt($('#nub2.nub-'+key+'').css('left').replace('px', ""));
                    var newNub3x = parseInt($('#nub3.nub-'+key+'').css('top').replace('px', ""));
                    var newNub3y = parseInt($('#nub3.nub-'+key+'').css('left').replace('px', ""));
                    var newNub4x = parseInt($('#nub4.nub-'+key+'').css('top').replace('px', ""));
                    var newNub4y = parseInt($('#nub4.nub-'+key+'').css('left').replace('px', ""));
                    var before = [nub1y,nub1x,nub2y,nub2x,nub3y,nub3x,nub4y,nub4x];
                    var after = [newNub1y,newNub1x,newNub2y,newNub2x,newNub3y,newNub3x,newNub4y,newNub4x];

                    var ratioW = image.naturalWidth / imgWidth;
                    var ratioH = image.naturalHeight / imgHeight;

                    var before2 = [nub1y*ratioH,nub1x*ratioW,nub2y*ratioH,nub2x*ratioW,nub3y*ratioH,nub3x*ratioW,nub4y*ratioH,nub4x*ratioW];
                    var after2 = [newNub1y*ratioH,newNub1x*ratioW,newNub2y*ratioH,newNub2x*ratioW,newNub3y*ratioH,newNub3x*ratioW,newNub4y*ratioH,newNub4x*ratioW];

                    $scope.perspecValuesArr[key] = {
                        key: key,
                        before : before2,
                        after : after2
                    };
                    /*$scope.perspecValuesArr[key]['key'] = key;
                    $scope.perspecValuesArr[key]['before'] = before;
                    $scope.perspecValuesArr[key]['after'] = after;*/

                    var flag = 0;
                    if(newNub1y > nub1y) {
                        flag = flag + checkNub(flag, 'nub1.nub-'+key+'', 'left', '0px');
                    }
                    if(newNub1x > nub1x) {
                        flag = flag + checkNub(flag, 'nub1.nub-'+key+'', 'top', '0px');
                    }
                    if(newNub2y < nub2y) {
                        flag = flag + checkNub(flag, 'nub2.nub-'+key+'', 'left', ''+imgWidth+'px');
                    }
                    if(newNub2x > nub2x) {
                        flag = flag + checkNub(flag, 'nub2.nub-'+key+'', 'top', '0px');
                    }
                    if(newNub3y > nub3y) {
                        flag = flag + checkNub(flag, 'nub3.nub-'+key+'', 'left', '0px');
                    }
                    if(newNub3x < nub3x) {
                        flag = flag + checkNub(flag, 'nub3.nub-'+key+'', 'top', ''+imgHeight+'px');
                    }
                    if(newNub4y < nub4y) {
                        flag = flag + checkNub(flag, 'nub4.nub-'+key+'', 'left', ''+imgWidth+'px');
                    }
                    if(newNub4x < nub4x) {
                        flag = flag + checkNub(flag, 'nub4.nub-'+key+'', 'top', ''+imgHeight+'px');
                    }


                    if(flag < 1) {
                        var canvas1 = $scope.perspecArr[key].fn;
                        var texture1 = $scope.perspecArr[key].tex;
                        canvas1.draw(texture1).perspective(before, after).update();
                    }
                });
            }
            window.clearTimeout(timeout);
            //$scope.setImageMargin();
        }, 500);
    });

    $scope.resetPerspec = function(key) {
        var canvas = $scope.perspecArr[key].fn;
        var texture = $scope.perspecArr[key].tex;
        var imgHeight = $('#converg-'+key+'').attr('height');
        var imgWidth = $('#converg-'+key+'').attr('width');
        // Add Nubs
        var nub1x = 0;
        var nub1y = 0;
        var nub2x = 0;
        var nub2y = imgWidth;
        var nub3x = imgHeight;
        var nub3y = 0;
        var nub4x = imgHeight;
        var nub4y = imgWidth;
        var before = [nub1y,nub1x,nub2y,nub2x,nub3y,nub3x,nub4y,nub4x];
        var after = [nub1y,nub1x,nub2y,nub2x,nub3y,nub3x,nub4y,nub4x];

        $scope.perspecValuesArr[key] = {
            key: key,
            before : before,
            after : after
        };

        canvas.draw(texture).perspective(before, after).update();

        var timeout;
        timeout = setTimeout(function(){
            $('#nub1.nub-'+key+'').css('left', '0px');
            $('#nub1.nub-'+key+'').css('top', '0px');
            $('#nub2.nub-'+key+'').css('left', ''+imgWidth+'px');
            $('#nub2.nub-'+key+'').css('top', '0px');
            $('#nub3.nub-'+key+'').css('left', '0px');
            $('#nub3.nub-'+key+'').css('top', ''+imgHeight+'px');
            $('#nub4.nub-'+key+'').css('left', ''+imgWidth+'px');
            $('#nub4.nub-'+key+'').css('top', ''+imgHeight+'px');
        }, 200)
    }

    $scope.savePerspecCorrection = function() {
        $localStorage.henrich.convergCanvas = [];
        var tempUrl = [];
        var count = 0;
        for(key in $scope.perspecArr) {
            var originKey = $('#converg-'+key+'').parent().attr('data-key');

            // Get Original Img and Filter
            var canvas = fx.canvas();
            var image = $scope.perspecArr[originKey].img;
            var texture = canvas.texture(image);

            var canvasWidth = image.naturalWidth;
            var canvasHeight = image.naturalHeight;

            if(image.naturalWidth > 3000 || image.naturalHeight > 3000) {
                var ratio = Math.min(2000 / image.naturalWidth, 2000 / image.naturalHeight);
                canvasWidth = canvasWidth * ratio;
                canvasHeight = canvasHeight * ratio;
            }

            // Filter canvas
            if($scope.perspecValuesArr[originKey] == undefined) {
                var imgHeight = canvasWidth;
                var imgWidth = canvasHeight;
                // Add Nubs
                var nub1x = 0;
                var nub1y = 0;
                var nub2x = 0;
                var nub2y = imgWidth;
                var nub3x = imgHeight;
                var nub3y = 0;
                var nub4x = imgHeight;
                var nub4y = imgWidth;
                var before = [nub1y,nub1x,nub2y,nub2x,nub3y,nub3x,nub4y,nub4x];
                var after = [nub1y,nub1x,nub2y,nub2x,nub3y,nub3x,nub4y,nub4x];
            } else {
                var before = $scope.perspecValuesArr[originKey].before;
                var after = $scope.perspecValuesArr[originKey].after;
            }
            canvas.draw(texture, canvasWidth, canvasHeight).perspective(before, after).update();


            canvas.toBlob(function(blob) {
                var url = URL.createObjectURL(blob);
                console.log(url);
                $localStorage.henrich.convergCanvas.push({
                    //key: count,
                    //canvas: canvas,
                    image: url
                    //texture: texture
                })
                if(parseInt(key)+1 == $scope.perspecArr.length) {
                    var timeout;
                    timeout = setTimeout(function(){
                        $location.path('/color-correction');
                        $scope.$apply();
                    },1000)
                }
            });

            /*$localStorage.henrich.convergCanvas.push({
                key: count,
                //canvas: canvas,
                image: url
                //texture: texture
            })*/

            //$location.path('/color-correction');

            /*canvas.toBlob(function(blob) {
                url = URL.createObjectURL(blob);
                $localStorage.henrich.processedImgs.push({url: url, originalKey: originKey});
                if(parseInt(key)+1 == storedImgs.length) {
                    cb($localStorage.henrich.processedImgs);
                    //window.clearTimeout(timeout);
                }
            });*/
        }
    }

    $scope.skipPerspecCorrection = function() {
        $localStorage.henrich.convergCanvas = [];
        for(key in $scope.localStorage.henrich.preImages) {
            $localStorage.henrich.convergCanvas.push({
                //key: count,
                //canvas: canvas,
                image: $scope.localStorage.henrich.preImages[key].url
                //texture: texture
            })
            if(parseInt(key)+1 == $scope.localStorage.henrich.preImages.length) {
                $location.path('/color-correction');
                //$scope.$apply();
            }
        }
    }

})

app.controller('AccountEditProjectColorCtrl', function($scope, $location, $localStorage, uploadedImages, $route) {
    $scope.colorValues = [];
    $scope.afterImgUrl = [];
    $localStorage.henrich.processedImgs = [];
    $scope.localStorage = $localStorage;
    delete $scope.canmanArr;
    //delete Caman;
    $scope.canmanArr = [];
    $scope.maxHeight = 0;
    //console.log($scope.localStorage.henrich.preImages);

    $scope.backToFixPerspective = function() {
        //delete $localStorage.henrich.projectInfo;
        delete $localStorage.henrich.colorValues;
        //delete $localStorage.henrich.preImages;
        delete $localStorage.henrich.processedImgs;
        delete $localStorage.henrich.skipWatermark;
        delete $localStorage.henrich.watermarkSavedImg;
        delete $localStorage.henrich.watermarkSavedOpts;
        delete $localStorage.henrich.postWatermarkBlobs;
        $location.path('/converging-lines');
    }

    if($localStorage.henrich.projectInfo !== undefined) {
        $scope.projectInfo = $scope.localStorage.henrich.projectInfo;
    }

    if($scope.localStorage.henrich) {
        if($scope.localStorage.henrich.colorValues) {
            $scope.colorValues = $scope.localStorage.henrich.colorValues;
        }
    }

    /*Caman.Filter.register("sharpen", function(F){
        if(F==null){F=100}F/=100;
        return this.processKernel("Sharpen",[0,-F,0,-F,4*F+1,-F,0,-F,0])
    });*/

    $scope.setDefaultColor = function(cb) {
        for (key in $scope.localStorage.henrich.preImages) {
            $scope.colorValues.push({
                key: key,
                maxBrightness: 0,
                maxSharpness: 0,
                maxVibrance: 0,
            });
            if(parseInt(key)+1 == $scope.localStorage.henrich.preImages.length) {
                if(cb) {
                    cb();
                }
            }
        }
    }
    $scope.setDefaultColor();

    $('.slide').on('click', function() {
        $scope.changeColor('brightness', 0);
    })


    $scope.doRefresh = function() {
        var checkExist = setInterval(function() {
            //console.log($('canvas').length);
           if($('canvas').length == $scope.localStorage.henrich.preImages.length) {
              clearInterval(checkExist);
              for (key in $scope.localStorage.henrich.preImages) {
                  $scope.changeColorValues($scope.colorValues[key], ['brightness','vibrance','sharpness']);
              }
          }
      }, 100);
    }

    $scope.resetSlider = function(key, type) {
        if(type == 'brightness') {$scope.colorValues[key].maxBrightness = 0;}
        if(type == 'vibrance') {$scope.colorValues[key].maxVibrance = 0;}
        if(type == 'sharpness') {$scope.colorValues[key].maxSharpness = 0;}
        //$scope.changeColorValues($scope.colorValues[key], type);
    }

    $(document).ready(function(){
        var timeout;
        timeout = setTimeout(function(){
            for(key in $scope.localStorage.henrich.preImages) {

                /*var originKey = $('#fab-can-'+key+'').parent().attr('data-key');*/

                // Get Original Img and Filter
                var canvas = fx.canvas();
                var image = new Image();
                image.src = $localStorage.henrich.convergCanvas[key].image;
                var texture = canvas.texture(image);

                canvas.id = 'fab-can-'+key+'';

                var canvasWidth = image.naturalWidth;
                var canvasHeight = image.naturalHeight;
                if(image.naturalWidth > 1000) {
                    var ratio = Math.min(600 / image.naturalWidth, 800 / image.naturalHeight);
                    canvasWidth = image.naturalWidth * ratio;
                    canvasHeight = image.naturalHeight * ratio;
                }

                //console.log(canvas);

                canvas.draw(texture, canvasWidth, canvasHeight).update();

                console.log(canvas);

                $('#fab-can-'+key+'').remove();
                $('#image-div-'+key+'').append(canvas);
                /*if(image.parentNode !== null) {
                    image.parentNode.insertBefore(canvas, image);
                    image.parentNode.removeChild(image);
                }*/

                $scope.canmanArr.push({
                    key: key,
                    fn: canvas,
                    tex: texture,
                    img: image
                })
                if(parseInt(key)+1 == $scope.localStorage.henrich.preImages.length) {
                    $scope.updateSavedColors();
                }


                //console.log($localStorage.henrich.convergCanvas);
                /*var image = new Image();
                image.onload = function() {
                    var canvas = fx.canvas();
                    var texture = canvas.texture(image);
                    canvas.id = 'fab-can-'+key+'';
                    var canvasWidth = image.naturalWidth;
                    var canvasHeight = image.naturalHeight;
                    if(image.naturalWidth > 1000) {
                        var ratio = Math.min(600 / image.naturalWidth, 800 / image.naturalHeight);
                        canvasWidth = image.naturalWidth * ratio;
                        canvasHeight = image.naturalHeight * ratio;
                    }


                    canvas.draw(texture, canvasWidth, canvasHeight).update();
                    console.log(canvas);
                    $('#fab-can-'+key+'').remove();
                    $('#image-div-'+key+'').append(canvas);
                    /*if(image.parentNode !== null) {
                        image.parentNode.insertBefore(canvas, image);
                        image.parentNode.removeChild(image);
                    }

                    $scope.canmanArr.push({
                        key: key,
                        fn: canvas,
                        tex: texture,
                        img: image
                    })
                    if(parseInt(key)+1 == $scope.localStorage.henrich.preImages.length) {
                        $scope.updateSavedColors();
                    }
                }
                image.src = $localStorage.henrich.convergCanvas[key].image;*/
            }
            //window.clearTimeout(timeout);
            $scope.setImageMargin();
        }, 1000);
    });

    $scope.updateSavedColors = function() {
        for(key in $scope.canmanArr) {
            var canvasWidth = $scope.canmanArr[key].img.naturalWidth;
            var canvasHeight = $scope.canmanArr[key].img.naturalHeight;
            if(canvasWidth > 1000) {
                var ratio = Math.min(600 / canvasWidth, 800 / canvasHeight);
                canvasWidth = canvasWidth * ratio;
                canvasHeight = canvasHeight * ratio;
            }
            $scope.canmanArr[key].fn.draw($scope.canmanArr[key].tex, canvasWidth, canvasHeight);
            $scope.canmanArr[key].fn.brightnessContrast($scope.colorValues[key].maxBrightness/100, 0);
            $scope.canmanArr[key].fn.hueSaturation(0, $scope.colorValues[key].maxVibrance/100);
            $scope.canmanArr[key].fn.unsharpMask(1, $scope.colorValues[key].maxSharpness/100);
            $scope.canmanArr[key].fn.update();
            $scope.afterImgUrl[key] = $scope.canmanArr[key].fn.toDataURL();
            $('#img-after').attr('src', $scope.afterImgUrl[key]);
            $('#spin-'+key+'').css('display', 'none');
        }

    }

    $scope.setFabric = function() {
        var timeout;
        timeout = setTimeout(function(){
            for(key in $scope.canmanArr) {
                fabric.Image.fromURL($scope.localStorage.henrich.preImages[key].url, function(oImg) {
                    $scope.canmanArr[key].img = oImg;
                    oImg.scaleToWidth($('#fab-can-'+key+'').width());
                    $scope.canmanArr[key].fn.add(oImg);
                });
            }
            window.clearTimeout(timeout);
        }, 1000);
    }


    $scope.applyToAll = function(key) {
        var brightness = $scope.colorValues[key].maxBrightness;
        var vibrance = $scope.colorValues[key].maxVibrance;
        var sharpness = $scope.colorValues[key].maxSharpness;
        for (k in $scope.localStorage.henrich.preImages) {
            if(parseInt(k) !== parseInt(key)) {
                $scope.colorValues[k].maxBrightness = brightness;
                $scope.colorValues[k].maxVibrance = vibrance;
                $scope.colorValues[k].maxSharpness = sharpness;
            }
        }
    }

    $scope.setImageMargin = function() {
        $scope.imgHeights = [];
        var tempElems = $('body').find("canvas");
        var maxHeight = 0;
        var maxHeightKey;
        for(var i = 0; i < tempElems.length; i++) {
            if(tempElems[i].height > maxHeight) {
                maxHeight = tempElems[i].height;
                maxHeightKey = i;
            }
            $scope.imgHeights.push({key: i, height: tempElems[i].height});
        }
        for(var i = 0; i < tempElems.length; i++) {
            if(i !== maxHeightKey) {
                var heightDiff = ((maxHeight - tempElems[i].height) / 2) - 2;
                $('#image-div-'+i+'').css('margin-bottom', heightDiff);
            }
        }
    }


    $scope.bigImg = function(e) {
        var key = $(e.currentTarget).attr('data-key');
        if($localStorage.henrich.preImages[key] !== undefined) {
            $scope.beforeImgUrl = $localStorage.henrich.preImages[key].url;
            $('#img-after').attr('src', $scope.afterImgUrl[key]);
            $('#preview-img-modal').removeClass('hide');
            $('#preview-img-modal').modal();
        }
    }


    $scope.skipColorCorrection = function() {
        delete $localStorage.henrich.colorValues;
        $scope.setDefaultColor(function() {
            var storedImgs = $localStorage.henrich.preImages;
            $localStorage.henrich.processedImgs = [];
            for(key in storedImgs) {
                $localStorage.henrich.processedImgs.push({url: storedImgs[key].url});
                if(parseInt(key)+1 == storedImgs.length) {
                    $location.path('/watermark-images');
                }
            }
        });


    }

    $scope.saveProcessedImgs = function(storedImgs, cb) {
        $localStorage.henrich.processedImgs = [];
        for(key in storedImgs) {
            var originKey = $('#fab-can-'+key+'').parent().attr('data-key');

            // Get Original Img and Filter
            var canvas = fx.canvas();
            var image = $scope.canmanArr[originKey].img;
            var texture = canvas.texture(image);

            var canvasWidth = image.naturalWidth;
            var canvasHeight = image.naturalHeight;

            if(image.naturalWidth > 3000 || image.naturalHeight > 3000) {
                var ratio = Math.min(2000 / image.naturalWidth, 2000 / image.naturalHeight);
                canvasWidth = canvasWidth * ratio;
                canvasHeight = canvasHeight * ratio;
            }

            canvas.draw(texture, canvasWidth, canvasHeight).update();

            // Filter canvas
            canvas.brightnessContrast($scope.colorValues[originKey].maxBrightness/100, 0);
            canvas.hueSaturation(0, $scope.colorValues[originKey].maxVibrance/100);
            canvas.unsharpMask(1, $scope.colorValues[originKey].maxSharpness/100);
            canvas.update();

            canvas.toBlob(function(blob) {
                url = URL.createObjectURL(blob);
                $localStorage.henrich.processedImgs.push({url: url, originalKey: originKey});
                if(parseInt(key)+1 == storedImgs.length) {
                    cb($localStorage.henrich.processedImgs);
                    //window.clearTimeout(timeout);
                }
            });

            /*var dataURI = canvas.toDataURL();

            var byteString = atob(dataURI.split(',')[1]);
            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            // write the ArrayBuffer to a blob, and you're done
            var bb = new Blob([ab]);
            var url = URL.createObjectURL(bb);
            $localStorage.henrich.processedImgs.push({url: url, originalKey: originKey});
            if(parseInt(originKey)+1 == storedImgs.length) {
                cb($localStorage.henrich.processedImgs);
            }*/




            /* else {
                $localStorage.henrich.processedImgs.push({url: storedImgs[key].url, originalKey: originKey});
            }*/
            //if(cb) {

            //}
        }
    }

    $(document).on($.modal.BLOCK, function(event, modal) {
        if(modal.elm.selector == '#save-img-modal') {
            var timeout;
            timeout = setTimeout(function(){
                var storedImgs = $localStorage.henrich.preImages;
                $scope.saveProcessedImgs(storedImgs, function(resp) {
                    $.modal.close();
                    $location.path('/watermark-images');
                    $scope.$apply();
                })
                window.clearTimeout(timeout);
            }, 1000);

        }

    });

    $scope.saveColorCorrection = function() {
        $('#save-img-modal').removeClass('hide');
        $('#save-img-modal').modal({
            escapeClose: false,
            clickClose: false,
            showClose: false
        });
    }


    $scope.changeColor = function(colorObj) {
        var canvasWidth = $scope.canmanArr[colorObj.key].img.naturalWidth;
        var canvasHeight = $scope.canmanArr[colorObj.key].img.naturalHeight;
        if(canvasWidth > 1000) {
            var ratio = Math.min(600 / canvasWidth, 800 / canvasHeight);
            canvasWidth = canvasWidth * ratio;
            canvasHeight = canvasHeight * ratio;
        }
        $scope.canmanArr[colorObj.key].fn.draw($scope.canmanArr[colorObj.key].tex, canvasWidth, canvasHeight);
        $scope.canmanArr[colorObj.key].fn.brightnessContrast(colorObj.maxBrightness/100, 0);
        $scope.canmanArr[colorObj.key].fn.hueSaturation(0, colorObj.maxVibrance/100);
        $scope.canmanArr[colorObj.key].fn.unsharpMask(1, colorObj.maxSharpness/100);
        $scope.canmanArr[colorObj.key].fn.update();
        $scope.afterImgUrl[colorObj.key] = $scope.canmanArr[colorObj.key].fn.toDataURL();
        $('#img-after').attr('src', $scope.afterImgUrl[colorObj.key]);
        $('#spin-'+colorObj.key+'').css('display', 'none');
        $scope.localStorage.henrich.colorValues = $scope.colorValues;
    }

    var timeoutWatch;
    $scope.$watch('colorValues', function(newVal, oldVal) {
        window.clearTimeout(timeoutWatch);
        timeoutWatch = setTimeout(function(){
            for(i in newVal) {
                if(oldVal[i] !== undefined && newVal[i].maxBrightness !== oldVal[i].maxBrightness) {
                    $('#spin-'+newVal[i].key+'').css('display', 'block');
                    $scope.changeColor(newVal[i]);
                }
                if(oldVal[i] !== undefined && newVal[i].maxVibrance !== oldVal[i].maxVibrance) {
                    //$('#spin-'+newVal[i].key+'').css('display', 'block');
                    $scope.changeColor(newVal[i]);
                }
                if(oldVal[i] !== undefined && newVal[i].maxSharpness !== oldVal[i].maxSharpness) {
                    //$('#spin-'+newVal[i].key+'').css('display', 'block');
                    $scope.changeColor(newVal[i]);
                }
            }
        },100);
    }, true)




})

app.controller('AccountAddWatermark', function($scope, $localStorage, Upload, $location, $route, $timeout) {
    $scope.localStorage = $localStorage;
    $scope.processedImgs = $localStorage.henrich.processedImgs;
    $scope.watermarkImg = '';
    $scope.savedWatermarkImg = [];
    $scope.savedWatermarkImgTemp = [];
    $scope.file = '';

    $scope.wmOptsBlank = {
        path: '',
        text: 'w',
        textSize: 150,
        textWidth: 2000,
        margin: 2,
        opacity: 0.000001,
        textBg: 'rgb(60, 56, 56)',
        textColor: 'rgb(255, 255, 255)',
        gravity: 'se'
    }

    $scope.wmOpts = {
        path: '',
        text: 'personal watermark text',
        textSize: 150,
        textWidth: 2000,
        margin: 2,
        opacity: 0.8,
        textBg: 'rgb(60, 56, 56)',
        textColor: 'rgb(255, 255, 255)',
        gravity: 'se',
        always: function () {
            //console.log('imgURL');
        }
    };

    if($scope.localStorage.henrich.watermarkSavedOpts) {
        $scope.wmOpts = $scope.localStorage.henrich.watermarkSavedOpts;
    }

    $scope.refreshWm = function() {
        var timeout;
        timeout = setTimeout(function(){
            //console.log('refreshed');
            $localStorage.henrich.watermarkSavedOpts = $scope.wmOpts;
            //console.log($scope.wmOpts);
            var tempEl = $('.watermark-preview').clone();
            $('.watermark-preview').remove();
            //var img = $('<img class="watermark-preview">');
            tempEl.attr('src', $scope.processedImgs[0].url);
            tempEl.appendTo('#watermark-preview-div');
            $(tempEl).load(function() {
                $('.watermark-preview').watermark($scope.wmOpts);
            });
            window.clearTimeout(timeout);
      }, 1000);
  }


    //$('.watermark-preview').load(function() {
        var timeout1;
        timeout1 = setTimeout(function(){
            //console.log('wm');
            $.modal.close();
            $scope.refreshWm();
            window.clearTimeout(timeout1);
            window.scrollTo(0, 0);
        },2000)

    //});

    $scope.previewFile = function() {
        $scope.wmOpts.text = '';
        var preview = document.getElementById('watermark-preview');
        var file    = document.getElementById('watermarkInput').files[0];
        var reader  = new FileReader();

        reader.addEventListener("load", function () {
            //console.log(reader);
            preview.src = reader.result;
            $scope.wmOpts.path = preview.src;
            $scope.refreshWm();
        }, false);

        if(file) {
            reader.readAsDataURL(file);
        }
    }





    /*$scope.emptyPreviewImg = function() {
        $('#watermarkInput').html($('#watermarkInput').html());
        $scope.wmOpts.path = '';
        $scope.file = '';
        $scope.refreshWm();
    }*/

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

    var timeout2;
    timeout2 = setTimeout(function(){
        $scope.cp1 = $('.color-picker div.color-picker-wrapper div.color-picker-panel.color-picker-panel-bottom.color-picker-panel-left.color-picker-show-hue.color-picker-show-alpha.ng-hide').toggle();
        window.clearTimeout(timeout2);

    },3000)

    var timeout3
    timeout3 = setTimeout(function(){
        $scope.cp2 = $('.color-picker-bg div.color-picker-wrapper div.color-picker-panel.color-picker-panel-bottom.color-picker-panel-left.color-picker-show-hue.color-picker-show-alpha.ng-hide').toggle();
        window.clearTimeout(timeout3);
    },3000)

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






    /*$scope.refreshWm = function() {
        setTimeout(function(){
            $scope.$apply();
            console.log('refreshed');
            $scope.localStorage.henrich.watermarkSavedOpts = $scope.wmOpts;
            var tempEl = $('.watermark-preview').clone();
            $('.watermark-preview').remove();
            //var img = $('<img class="watermark-preview">');
            tempEl.attr('src', $scope.processedImgs[0].url);
            tempEl.appendTo('#watermark-preview-div');
            $(tempEl).load(function() {
                $('.watermark-preview').watermark($scope.wmOpts);
            });
      }, 2000);
  }*/

  $('.watermark-preview').load(function() {
      $scope.refreshWm();
  });

  $scope.skipWatermark = function() {
      delete $localStorage.henrich.watermarkSavedOpts;

      $localStorage.henrich.watermarkSavedOpts = $scope.wmOpts;
      $scope.localStorage.henrich.skipWatermark = false;
      for(key in $scope.localStorage.henrich.processedImgs) {
          var img = $('<img class="dynamic-wm">');
          img.attr('src', $scope.localStorage.henrich.processedImgs[key].url);
          img.watermark($scope.wmOptsBlank);
          var temp = img.get();
          $scope.savedWatermarkImgTemp.push({
              key: key,
              src: temp
          });
          if(parseInt(key)+1 == $scope.localStorage.henrich.processedImgs.length) {
              var timeout;
              timeout = $timeout(function() {
                  for(key in $scope.savedWatermarkImgTemp) {
                      $scope.savedWatermarkImg.push({
                          key: key,
                          src: $($scope.savedWatermarkImgTemp[key].src).attr('src')
                      });
                      if(parseInt(key)+1 == $scope.savedWatermarkImgTemp.length) {
                          $scope.localStorage.henrich.watermarkSavedImg = $scope.savedWatermarkImg;
                          $location.path('/resize-download');
                      }
                  }
                  $timeout.cancel(timeout);
              },1000);
          }

      /*$scope.localStorage.henrich.skipWatermark = true;
      for(key in $scope.processedImgs) {
          var img = $('<img class="dynamic-wm">');
          img.attr('src', $scope.processedImgs[key].url);
          img.watermark($scope.wmOptsBlank);
          var temp = img.get();
          $scope.savedWatermarkImgTemp.push({
              key: key,
              src: temp
          });
          if(parseInt(key)+1 == $scope.processedImgs.length) {
              for(key in $scope.savedWatermarkImgTemp) {
                  $scope.savedWatermarkImg.push({
                      key: key,
                      src: $($scope.savedWatermarkImgTemp[key].src).attr('src')
                  });
                  if(parseInt(key)+1 == $scope.savedWatermarkImgTemp.length) {
                      $scope.localStorage.henrich.watermarkSavedImg = $scope.savedWatermarkImg;
                      $location.path('/resize-download');
                  }
              }

          }*/
      }
     /* $timeout(function() {
          $scope.$apply(function() {

          });
      }, 1000);*/
  }

    $scope.saveWatermark = function() {
        $localStorage.henrich.watermarkSavedOpts = $scope.wmOpts;
        $scope.localStorage.henrich.skipWatermark = false;
        for(key in $scope.localStorage.henrich.processedImgs) {
            var img = $('<img class="dynamic-wm">');
            img.attr('src', $scope.localStorage.henrich.processedImgs[key].url);
            img.watermark($scope.wmOpts);
            var temp = img.get();
            $scope.savedWatermarkImgTemp.push({
                key: key,
                src: temp
            });
            if(parseInt(key)+1 == $scope.localStorage.henrich.processedImgs.length) {
                var timeout;
                timeout = $timeout(function() {
                    for(key in $scope.savedWatermarkImgTemp) {
                        $scope.savedWatermarkImg.push({
                            key: key,
                            src: $($scope.savedWatermarkImgTemp[key].src).attr('src')
                        });
                        if(parseInt(key)+1 == $scope.savedWatermarkImgTemp.length) {
                            $scope.localStorage.henrich.watermarkSavedImg = $scope.savedWatermarkImg;
                            $location.path('/resize-download');
                        }
                    }
                    $timeout.cancel(timeout);
                },1000);
            }
        }
            /*if(parseInt(key)+1 == $scope.localStorage.henrich.processedImgs.length) {
                for(key in $scope.savedWatermarkImgTemp) {
                    $scope.savedWatermarkImg.push({
                        key: key,
                        src: $($scope.savedWatermarkImgTemp[key].src).attr('src')
                    });
                    if(parseInt(key)+1 == $scope.savedWatermarkImgTemp.length) {
                        $scope.localStorage.henrich.watermarkSavedImg = $scope.savedWatermarkImg;
                        $location.path('/resize-download');
                    }
                }

            }*/

        /*$timeout(function() {
            $scope.$apply(function() {
                for(key in $scope.savedWatermarkImgTemp) {
                    $scope.savedWatermarkImg.push({
                        key: key,
                        src: $($scope.savedWatermarkImgTemp[key].src).attr('src')
                    });
                }
                $scope.localStorage.henrich.watermarkSavedImg = $scope.savedWatermarkImg;
                $location.path('/resize-download');
            });
        }, 1000);*/
    }
})

app.controller('AccountResizeDownloadCtrl', function($scope, $location, $localStorage, uploadedImages, $http, project, func, $timeout) {
    $scope.localStorage = $localStorage;
    $scope.watermarkSavedImg = $scope.localStorage.henrich.watermarkSavedImg;
    $scope.projectInfo = $scope.localStorage.henrich.projectInfo;
    $scope.preImages = $scope.localStorage.henrich.preImages;
    $scope.filenameCheckbox = false;
    $scope.filenameArr = [];
    $scope.resizeType = 'none';
    $scope.resizedImages = [];
    $scope.postWatermarkBlobs = [];


    /*if($scope.localStorage.henrich.skipWatermark == true) {
        $scope.watermarkSavedImg = $localStorage.henrich.preImages;
    }*/

    $scope.originalFilenameSwitch = function() {
        for(key in $scope.watermarkSavedImg) {
            $scope.filenameArr[key] = $scope.preImages[key].name;
        }
    }
    $scope.newFilenameSwitch = function() {
        for(key in $scope.watermarkSavedImg) {
            if($scope.preImages[key] !== undefined) {
                var tempType = $scope.preImages[key].type;
                if(tempType.indexOf('jpeg') !== -1) {
                    var ext = 'jpg';
                }
                if(tempType.indexOf('png') !== -1) {
                    var ext = 'png';
                }
                $scope.filenameArr[key] = $scope.projectInfo.projectName+'-'+(parseInt(key)+parseInt(1))+'.'+ext;
            }

        }
    }

    $scope.newFilenameSwitch();

    $('#filename-switch').checkbox({
        onChecked: function() {
            $scope.filenameCheckbox = true;
            $scope.originalFilenameSwitch();
            $('a.header').click();
        },
        onUnchecked: function() {
            $scope.filenameCheckbox = false;
            $scope.newFilenameSwitch();
            $('a.header').click();
        }
    });

    $('.size-checkbox-noresize').checkbox({
        onChecked: function() {
            $scope.resizeType = 'none';
        },
    });
    $('.size-checkbox-small').checkbox({
        onChecked: function() {
            $scope.resizeType = 'small';
        },
    });
    $('.size-checkbox-medium').checkbox({
        onChecked: function() {
            $scope.resizeType = 'medium';
        },
    });

    $scope.setImageMargin = function(tempElems) {
        $scope.imgHeights = [];
        var maxHeight = 0;
        var maxHeightKey;
        tempElems[0].clientHeight;
        for(var i = 0; i < tempElems.length; i++) {
            if(tempElems[i].clientHeight > maxHeight) {
                maxHeight = tempElems[i].clientHeight;
                maxHeightKey = i;
            }
            $scope.imgHeights.push({key: i, height: tempElems[i].clientHeight});
        }
        for(var i = 0; i < tempElems.length; i++) {
            if(i !== maxHeightKey) {
                var heightDiff = (maxHeight - tempElems[i].height) - 2;
                $('#resize-div-'+i+'').css('margin-bottom', heightDiff);
            }
        }
    }

    var wmLoadTimer = setInterval(function(){
        var tempElems = $('body').find("div.image img");
        var flag = 0;
        for(var i = 0; i < tempElems.length; i++) {
            console.log(tempElems[i].clientHeight);
            if(tempElems[i].clientHeight > 0) {
                flag = flag+1;
            }
        }
        if(flag == tempElems.length) {
            $scope.setImageMargin(tempElems);
            clearInterval(wmLoadTimer);
        }
    }, 500);



    $scope.resizeImg = function(imgData, key, desiredWidth, ratioInput, callback) {
        var imgTemp = document.getElementById("resize-"+key);

        // calculate how much to scale the resulting image
        //var originalWidth=imgTemp.width;
        //var originalHeight=imgTemp.height;
        //var desiredWidth=desiredWidth;
        //var scalingFactor = desiredWidth/originalWidth;

        // scale the original size proportionally
        //var newWidth=originalWidth*scalingFactor;
        //var newHeight=originalHeight*scalingFactor;

        // We create an image to receive the Data URI
        var img = new Image();

        // When the event "onload" is triggered we can resize the image.
        img.onload = function() {

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            var bigside = Math.max(img.width, img.height);
            var ratio =  ratioInput;
            canvas.width = img.width * ratio;
            canvas.height = img.height* ratio;
            ctx.scale(ratio, ratio); // scale by 1/4
            ctx.drawImage(img, 0, 0);

            // We create a canvas and get its context.
            //var canvas = document.createElement('canvas');
            /*var canvas = document.getElementById("can-man");
            var ctx = canvas.getContext('2d');

            // resize the canvas to fit the desired image
            // Note: canvas is a reference to your html canvas element
            canvas.width = 100%;
            canvas.height = 100%;

            // Draw the image to the canvas
            // This version of drawImage allows you to scale the original image
            // while you are drawing it to the canvas.
            ctx.drawImage(
                img,
                0,0,originalWidth,originalHeight,
                0,0,newWidth,newHeight);*/

            var dataURI = canvas.toDataURL();

            callback(key, dataURI);
            /////////////////////////////////////////
            // Use and treat your Data URI here !! //
            /////////////////////////////////////////
        };

        // We put the Data URI in the image's src attribute
        img.src = imgData;
        //console.log(img);
    }

    $scope.addToZip = function(zip, key, tempSrcArr) {
        zip.file($scope.filenameArr[key], tempSrcArr[key].src.split(",")[1], {base64: true});
        //console.log((parseInt(key) + parseInt(1))+' - '+$scope.filenameArr.length);
        if( (parseInt(key) + parseInt(1)) == $scope.filenameArr.length) {
            zip.generateAsync({type:"blob"}).then(function(blob) {
                saveAs(blob, $scope.projectInfo.projectName+'-images'+'.zip');
            });
        }
    }

    $scope.downloadZip = function() {
        var zip = new JSZip();
        if($scope.resizeType == 'none') {
            for(key in $scope.watermarkSavedImg) {
                var tempSrcArr = $scope.watermarkSavedImg[key].src.split(",");
                zip.file($scope.filenameArr[key], tempSrcArr[1], {base64: true});
            }
            zip.generateAsync({type:"blob"}).then(function(blob) {
                saveAs(blob, $scope.projectInfo.projectName+'-images'+'.zip');
            });
        }
        if($scope.resizeType == 'small') {
            for(key in $scope.watermarkSavedImg) {
                var tempSrcArr = $scope.watermarkSavedImg[key].src;
                $scope.resizeImg(tempSrcArr, key, 900, 0.50, function(key, dataURI) {
                    $scope.resizedImages.push({
                        key: key,
                        src: dataURI
                    })
                    $scope.addToZip(zip, key, $scope.resizedImages);
                });
            }
        }
        if($scope.resizeType == 'medium') {
            for(key in $scope.watermarkSavedImg) {
                var tempSrcArr = $scope.watermarkSavedImg[key].src;
                $scope.resizeImg(tempSrcArr, key, 900, 0.25, function(key, dataURI) {
                    $scope.resizedImages.push({
                        key: key,
                        src: dataURI
                    })
                    $scope.addToZip(zip, key, $scope.resizedImages);
                });
            }
        }

    }

    $scope.saveProject = function() {
        $localStorage.henrich.postWatermarkBlobs = [];
        var count = 1;
        for(key in $scope.watermarkSavedImg) {
            $localStorage.henrich.postWatermarkBlobs.push({
                name: $localStorage.henrich.preImages[key].name,
                obj:$scope.watermarkSavedImg[key].src
            });
            if(parseInt(key)+1 == $scope.watermarkSavedImg.length) {
                //console.log($localStorage.henrich.postWatermarkBlobs);
                project.saveProject(function(resp) {
                    $location.path('/projects');
                })
            }
            //console.log($scope.watermarkSavedImg[key]);
            //var blobKey = 0;
            /*func.b64toBlob($scope.watermarkSavedImg[key].src, function(blob) {
                console.log(blob);
                //var blobUrl = URL.createObjectURL(blob);
                $localStorage.henrich.postWatermarkBlobs.push({
                    name: $localStorage.henrich.preImages[blobKey].name,
                    obj:blob
                });
                blobKey = blobKey+1;
                if(count == $scope.watermarkSavedImg.length) {
                    console.log($localStorage.henrich.postWatermarkBlobs);
                    project.saveProject(function() {

                    })
                }
                count = count + 1;
            })*/
        }
    }


})
