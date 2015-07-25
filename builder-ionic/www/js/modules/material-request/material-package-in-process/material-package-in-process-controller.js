angular.module('buiiltApp')
.controller('MaterialPackageInProcessCtrl', function(fileService, API_URL,$scope, $state, $stateParams, filterFilter, currentTeam, materialRequest, fileService, authService, userService,materialRequestService,notificationService) {
  /**
   * quote data
   */
  $scope.materialRequest = materialRequest;
  $scope.currentTeam = currentTeam;
  $scope.materialRequest.winnerTeam._id.member  = filterFilter($scope.materialRequest.winnerTeam._id.member , {status : 'Active'});
  if (window.localStorage.getItem('token')) {
    $scope.currentUser = userService.get();
  }

  if (currentTeam.type == 'contractor' || currentTeam.type == 'homeOwner') {
    $state.go('team.manager');
  }
  else if (currentTeam.type == 'builder') {
    if (materialRequest.owner._id != currentTeam._id) {
      $state.go('team.manager');
    }
  }
  else {
    if (materialRequest.winnerTeam._id._id != currentTeam._id) {
      $state.go('team.manager');
    }
  }

  notificationService.markReadByPackage({_id : materialRequest._id}).$promise
    .then(function(res) {
    });

  $scope.complete = function() {
    materialRequestService.complete({_id : $scope.materialRequest._id}).$promise
      .then(function(res) {
        $scope.materialRequest = res;
        $('#modal_complete').closeModal();
      })
  };

  fileService.getFileByStateParam({'id': $scope.materialRequest._id}).$promise.then(function(data) {
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