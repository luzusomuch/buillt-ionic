angular.module('buiiltApp')
.controller('FileDetailCtrl', function($timeout, API_URL, $scope, file, currentUser, $cordovaFileTransfer) {
  $scope.file = file;
  $scope.currentUser = currentUser;
            
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
        cordova.exec(success, error, 'Canvas2ImagePlugin', 'saveImageDataToLibrary', [imageData]);
      } catch(e) {
        error(e.message);
      }
    };
    try {
      img.src = url;
    } catch(e) {
      error(e.message);
    }
  };
            
  $scope.downloadFile = function(value){
    document.addEventListener('deviceready', function () {
      var url = value.fileUrl;
      var targetPath = cordova.file.documentsDirectory + value.name;
      var trustHosts = true;
      var options = {};
      $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
      .then(function(result) {
        var success = function(msg){
          console.log(msg);
        };
        var error = function(err){
          console.log(err);
        };
        saveImageToPhone(targetPath, success, error);
      }, function(err) {
        console.log(err);
      }, function (progress) {
        $timeout(function () {
          $scope.downloadProgress = (progress.loaded / progress.total) * 100;
        });
      });
    }, false);
  };
});