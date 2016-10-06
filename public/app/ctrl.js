
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

app.controller('AccountProjectsCtrl', function($scope, project, $location) {
    $scope.projects = '';
    project.getAllUserProjects(function(resp) {
        $scope.projects = resp;
    })

    $scope.goToAddProject = function() {
        $location.path('/add-project');
    }

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

app.controller('AccountAddProjectCtrl', function($scope, $http, $location, $localStorage, auth, Upload, uploadedImages, user, project, $timeout) {
    $scope.user = user;
    $scope.uploadedImages = uploadedImages;
    $scope.projectInfo = {};
    $scope.files = '';
    $scope.localStorage = $localStorage;
    $scope.projectStep = {};
    $scope.canvasList = [];

    // delete saved project info
    $scope.localStorage.henrich.projectInfo = undefined;
    $scope.localStorage.henrich.colorValues = undefined;
    $scope.localStorage.henrich.watermarkSavedOpts = undefined;

    if($localStorage.henrich.projectInfo !== undefined) {
        $scope.projectInfo = $scope.localStorage.henrich.projectInfo;
    }

    $scope.$watch('files', function (files) {
    if (files != null) {
      // make files array for not multiple to be able to be used in ng-repeat in the ui
      if (!angular.isArray(files)) {
        $timeout(function () {
          $scope.files = files;
        });
        return;
      }

    }
  });


    $scope.nextColor = function(files) {
        $scope.localStorage.henrich.projectInfo = $scope.projectInfo;
        $scope.localStorage.henrich.preImages = [];
        for(key in files) {
            $scope.localStorage.henrich.preImages.push({
                name: files[key].name,
                url: files[key].$ngfBlobUrl,
                type: files[key].type
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

app.controller('AccountEditProjectColorCtrl', function($scope, $location, $localStorage, uploadedImages, $timeout, $route) {
    $scope.colorValues = [];
    $localStorage.henrich.processedImgs = [];
    $scope.localStorage = $localStorage;
    $scope.canmanArr = [];
    console.log($scope.localStorage.henrich.preImages);

    if($localStorage.henrich.projectInfo !== undefined) {
        $scope.projectInfo = $scope.localStorage.henrich.projectInfo;
    }

    $scope.setDefaultColor = function(cb) {
        for (key in $scope.localStorage.henrich.preImages) {
            $scope.colorValues.push({
                key: key,
                //maxContrast: 0,
                maxBrightness: 0,
                //maxSharpness: 0,
                maxVibrance: 0,
                maxSaturation: 0
            });
            if(parseInt(key)+1 == $scope.localStorage.henrich.preImages.length) {
                if(cb) {
                    cb();
                }
            }
        }
    }
    $scope.setDefaultColor();

    if($scope.localStorage.henrich) {
        if($scope.localStorage.henrich.colorValues) {
            $scope.colorValues = $scope.localStorage.henrich.colorValues;
        }
    }

    $scope.changeColorValues = function(newval, type) {
        $('#fab-can-'+newval.key+'').before('<div id="spin-'+newval.key+'" class="spin-div"><img src="/assets/img/35.gif"></div>');
        $scope.canmanArr[newval.key].fn.revert(updateContext = true);
        //$scope.canmanArr[newval.key].fn.contrast(newval.maxContrast);
        $scope.canmanArr[newval.key].fn.brightness(newval.maxBrightness);
        //$scope.canmanArr[newval.key].fn.sharpen(newval.maxSharpness);
        $scope.canmanArr[newval.key].fn.vibrance(newval.maxVibrance);
        $scope.canmanArr[newval.key].fn.saturation(newval.maxSaturation);
        $scope.canmanArr[newval.key].fn.render(function() {
            $('.spin-div').remove();
            $scope.localStorage.henrich.colorValues = $scope.colorValues;
        });
    }

    $scope.doRefresh = function() {
        var checkExist = setInterval(function() {
            //console.log($('canvas').length);
           if($('canvas').length == $scope.localStorage.henrich.preImages.length) {
              clearInterval(checkExist);
              for (key in $scope.localStorage.henrich.preImages) {
                  $scope.changeColorValues($scope.colorValues[key]);
              }
          }
      }, 100);
    }

    $(document).ready(function(){
        $timeout(function(){
            for(key in $scope.localStorage.henrich.preImages) {
                $scope.canmanArr.push({
                    key: key,
                    fn: Caman('#fab-can-'+key+'')
                })

                if(parseInt(key)+1 == $scope.localStorage.henrich.preImages.length) {
                    $scope.doRefresh();
                }
            }
        }, 1000);
    });



    /*$timeout(function(){   //Set timeout
        for (key in $scope.localStorage.henrich.preImages) {
            $scope.canmanArr.push({
                key: key,
                fn: Caman('#fab-can-'+key+'')
            })
            //$scope.changeColorValues($scope.colorValues[key]);
        }
    },500);*/

    $scope.applyToAll = function(key) {
        //var contrast = $scope.colorValues[key].maxContrast;
        var brightness = $scope.colorValues[key].maxBrightness;
        var vibrance = $scope.colorValues[key].maxVibrance;
        //var sharpness = $scope.colorValues[key].maxSharpness;
        var saturation = $scope.colorValues[key].maxSaturation;
        for (k in $scope.localStorage.henrich.preImages) {
            //$scope.colorValues[k].maxContrast = contrast;
            $scope.colorValues[k].maxBrightness = brightness;
            $scope.colorValues[k].maxVibrance = vibrance;
            //$scope.colorValues[k].maxSharpness = sharpness;
            $scope.colorValues[k].maxSaturation = saturation;
        }
    }

    $scope.bigImg = function(e) {
        //console.log(e);
        $('.before-img').remove();
        var tempEle = $(e.currentTarget);
        if($(tempEle).hasClass('big-img')) {
            $('.before-img').remove();
            $('.before-text').remove();
            $('.after-text').remove();
        } else {
            var key = $(e.currentTarget).attr('data-key');
            var beforeImgUrl = $localStorage.henrich.preImages[key].url;
            $(tempEle).prepend('<img class="before-img" src="'+beforeImgUrl+'">');
            $(tempEle).prepend('<span class="before-text">Before</span>');
            $('#fab-can-'+key+'').after('<span class="after-text">After</span>');
        }

        $(tempEle).toggleClass('big-img');

    }

    $scope.skipColorCorrection = function() {
        $scope.setDefaultColor(function() {
            $scope.localStorage.henrich.colorValues = undefined;
            var storedImgs = $localStorage.henrich.preImages;

            for(key in storedImgs) {
                $localStorage.henrich.processedImgs.push({url: storedImgs[key].url});
            }

            $timeout(function(){   //Set timeout
                //location.reload();
                $location.path('/watermark-images');
                //window.location.href = "/watermark-images";
            },500);
        });


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
        }
        $timeout(function(){   //Set timeout
            //location.reload();
            $location.path('/watermark-images');
            //window.location.href = "/watermark-images";
        },500);

    }

    /*$timeout(function(){   //Set timeout
        for (key in $scope.localStorage.henrich.preImages) {
            $scope.changeColorValues($scope.colorValues[key]);
        }
    },700);*/

    var timeoutPromise;
    $scope.$watch('colorValues', function(newVal, oldVal) {
        $timeout.cancel(timeoutPromise);
        timeoutPromise = $timeout(function(){   //Set timeout
            var i = newVal.length;
            while(i--) {
                /*if(newVal[i].maxContrast !== oldVal[i].maxContrast) {
                    $scope.changeColorValues(newVal[i]);
                }*/
                if(oldVal[i] !== undefined && newVal[i].maxBrightness !== oldVal[i].maxBrightness) {
                    $scope.changeColorValues(newVal[i]);
                }
                /*if(newVal[i].maxSharpness !== oldVal[i].maxSharpness) {
                    $scope.changeColorValues(newVal[i]);
                }*/
                if(oldVal[i] !== undefined && newVal[i].maxVibrance !== oldVal[i].maxVibrance) {
                    $scope.changeColorValues(newVal[i]);
                }
                if(oldVal[i] !== undefined && newVal[i].maxSaturation !== oldVal[i].maxSaturation) {
                    $scope.changeColorValues(newVal[i]);
                }
            }
        },100);
    }, true);

})

app.controller('AccountAddWatermark', function($scope, $localStorage, $timeout, Upload, $location, $route) {
    $scope.localStorage = $localStorage;
    $scope.processedImgs = $localStorage.henrich.processedImgs;
    $scope.watermarkImg = '';
    $scope.savedWatermarkImg = [];
    $scope.savedWatermarkImgTemp = [];
    $scope.file = '';

    $scope.wmOptsBlank = {
        path: '',
        text: '',
        textSize: 150,
        textWidth: 1000,
        margin: 2,
        opacity: 0.8,
        textBg: 'rgb(60, 56, 56)',
        textColor: 'rgb(255, 255, 255)',
        gravity: 'se'
    }

    $scope.wmOpts = {
        path: '',
        text: 'Watermark',
        textSize: 150,
        textWidth: 1000,
        margin: 2,
        opacity: 0.8,
        textBg: 'rgb(60, 56, 56)',
        textColor: 'rgb(255, 255, 255)',
        gravity: 'se',
        always: function () {
            console.log('imgURL');
        }
    };

    if($scope.localStorage.henrich.watermarkSavedOpts) {
        $scope.wmOpts = $scope.localStorage.henrich.watermarkSavedOpts;
    }

    $scope.refreshWm = function() {
        //setTimeout(function(){
            console.log('refreshed');
            $scope.localStorage.henrich.watermarkSavedOpts = $scope.wmOpts;
            console.log($scope.wmOpts);
            var tempEl = $('.watermark-preview').clone();
            $('.watermark-preview').remove();
            //var img = $('<img class="watermark-preview">');
            tempEl.attr('src', $scope.processedImgs[0].url);
            tempEl.appendTo('#watermark-preview-div');
            $(tempEl).load(function() {
                $('.watermark-preview').watermark($scope.wmOpts);
            });
      //}, 1000);
  }


    $('.watermark-preview').load(function() {
        //$timeout(function(){
            $('.watermark-preview').watermark($scope.wmOpts);
        //},2000)
    });

    $scope.previewFile = function() {
        $scope.wmOpts.text = '';
        var preview = document.getElementById('watermark-preview');
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

    $timeout(function(){
        $scope.cp1 = $('.color-picker div.color-picker-wrapper div.color-picker-panel.color-picker-panel-bottom.color-picker-panel-left.color-picker-show-hue.color-picker-show-alpha.ng-hide').toggle();
    },3000)
    $timeout(function(){
        $scope.cp2 = $('.color-picker-bg div.color-picker-wrapper div.color-picker-panel.color-picker-panel-bottom.color-picker-panel-left.color-picker-show-hue.color-picker-show-alpha.ng-hide').toggle();
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

  /*$('.watermark-preview').load(function() {
      $scope.refreshWm();
  });*/

  $scope.skipWatermark = function() {
      $scope.localStorage.henrich.skipWatermark = true;
      for(key in $scope.processedImgs) {
          var img = $('<img class="dynamic-wm">');
          img.attr('src', $scope.processedImgs[key].url);
          img.watermark($scope.wmOptsBlank);
          var temp = img.get();
          $scope.savedWatermarkImgTemp.push({
              key: key,
              src: temp
          });
      }
      $timeout(function() {
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
      }, 1000);
  }

    $scope.saveWatermark = function() {
        $scope.localStorage.henrich.skipWatermark = false;
        for(key in $scope.processedImgs) {
            var img = $('<img class="dynamic-wm">');
            img.attr('src', $scope.processedImgs[key].url);
            img.watermark($scope.wmOpts);
            var temp = img.get();
            $scope.savedWatermarkImgTemp.push({
                key: key,
                src: temp
            });
        }
        $timeout(function() {
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
        }, 1000);
    }
})

app.controller('AccountResizeDownloadCtrl', function($scope, $location, $localStorage, uploadedImages, $timeout) {
    $scope.localStorage = $localStorage;
    $scope.watermarkSavedImg = $scope.localStorage.henrich.watermarkSavedImg;
    $scope.projectInfo = $scope.localStorage.henrich.projectInfo;
    $scope.preImages = $scope.localStorage.henrich.preImages;
    $scope.filenameCheckbox = false;
    $scope.filenameArr = [];
    $scope.resizeType = 'none';
    $scope.resizedImages = [];

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

    $scope.test = function() {
        //console.log($scope.filenameCheckbox);
    }
})
