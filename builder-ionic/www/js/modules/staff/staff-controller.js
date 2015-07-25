angular.module('buiiltApp')
  .controller('StaffViewCtrl',
  function(fileService,API_URL,$scope, $rootScope,filterFilter,staffPackage,staffPackageService,currentUser,notificationService) {
    $scope.staffPackage = staffPackage;
    $scope.currentUser = currentUser;
    notificationService.markReadByPackage({_id : staffPackage._id}).$promise
      .then(function(res) {
      });
    $scope.complete = function() {
      staffPackageService.complete({_id : $scope.staffPackage._id}).$promise
        .then(function(res) {
          $scope.staffPackage = res;
          $('#modal_complete').closeModal();
        })
    };
    fileService.getFileByStateParam({'id': $scope.staffPackage._id}).$promise.then(function(data) {
      $scope.files = data;
      _.each($scope.files, function(file){
          file.totalLike = file.usersInterestedIn.length;
          file.thumbnail = API_URL+'/media/files/'+file._id +'-' + file.title + '.jpg';
          if (_.find(file.usersInterestedIn,{_id: $scope.currentUser._id})) {
              file.isInterested = true;
          }
          else {
              file.isInterested = false;
          }
      })
  });

  $scope.likeDocument = function(value) {
      fileService.interested({'id': value._id, isInterested: value.isInterested}).$promise.then(function(data) {
         value.isInterested = !value.isInterested;
         if (value.isInterested) {
              value.totalLike = value.totalLike +1;
         }
         else {
              value.totalLike = value.totalLike -1;
         }
      });
  };

  $scope.toggleFile = function(file) {
      if ($scope.isFileShown(file)) {
          $scope.shownFile = null;
      } else {
          $scope.shownFile = file;
      }
  };
  $scope.isFileShown = function(file) {
      return $scope.shownFile === file;
  };
});
