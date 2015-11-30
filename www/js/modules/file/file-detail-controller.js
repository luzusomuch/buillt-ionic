angular.module('buiiltApp')
.controller('FileDetailCtrl', function($timeout,API_URL,$scope,file,authService,fileService,$cordovaFileTransfer) {
            $scope.isInterested = false;
            $scope.file = file;
            $scope.totalLike = file.usersInterestedIn.length;
            $scope.thumbnail = API_URL+'/media/files/'+file._id +'-' + file.title + '.jpg';
            
            authService.getCurrentUser().$promise.then(function(data){
                                                       if (_.find(file.usersInterestedIn,{_id: data._id})) {
                                                       $scope.isInterested = true;
                                                       }
                                                       else {
                                                       $scope.isInterested = false;
                                                       }
                                                       });
            
            $scope.likeDocument = function(value) {
            fileService.interested({'id': value._id, isInterested: $scope.isInterested}).$promise.then(function(data) {
                                                                                                       $scope.isInterested = !$scope.isInterested;
                                                                                                       if ($scope.isInterested) {
                                                                                                       $scope.totalLike = $scope.totalLike +1;
                                                                                                       }
                                                                                                       else {
                                                                                                       $scope.totalLike = $scope.totalLike -1;
                                                                                                       }
                                                                                                       });
            };
            
            function saveImageToPhone(url, success, error) {
            var canvas, context, imageDataUrl, imageData;
            var img = new Image();
            img.onload = function() {
            canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);
            try {
            imageDataUrl = canvas.toDataURL('image/jpeg', 1.0);
            imageData = imageDataUrl.replace(/data:image\/jpeg;base64,/, '');
            cordova.exec(
                         success,
                         error,
                         'Canvas2ImagePlugin',
                         'saveImageDataToLibrary',
                         [imageData]
                         );
            }
            catch(e) {
            error(e.message);
            }
            };
            try {
            img.src = url;
            }
            catch(e) {
            error(e.message);
            }
            }
            
            
            
            $scope.downloadFile = function(value){
            document.addEventListener('deviceready', function () {
                                      
                                      var url = value.fileUrl;
                                      
                                      var targetPath = cordova.file.documentsDirectory + value.name;
                                      var trustHosts = true;
                                      var options = {};
                                      $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                                      .then(function(result) {
                                            alert('Success!!');
                                            var success = function(msg){
                                            alert(msg);
                                            };
                                            
                                            var error = function(err){
                                            alert(err);
                                            };
                                            saveImageToPhone(targetPath, success, error);
                                            // Success!
                                            }, function(err) {
                                            alert('error ' + err);
                                            // Error
                                            }, function (progress) {
                                            $timeout(function () {
                                                     $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                                                     })
                                            });
                                      }, false);
            };
            });