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
            
            
            
            $scope.downloadFile = function(value){
            alert('11111');
            document.addEventListener('deviceready', function () {
                                      alert('22222222222');
                                      var url = value.fileUrl;
                                      alert(url);
                                      alert('3333333');
                                      alert(value.name);
                                      alert(cordova);
                                      alert(cordova.file);
                                      alert(cordova.file.documentsDirectory);
                                      
                                      var targetPath = cordova.file.documentsDirectory + value.name;
                                      alert(targetPath);
                                      var trustHosts = true;
                                      var options = {};
                                      
                                      alert('444444444');
                                      alert($cordovaFileTransfer);
                                      $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                                      .then(function(result) {
                                            alert(result);
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