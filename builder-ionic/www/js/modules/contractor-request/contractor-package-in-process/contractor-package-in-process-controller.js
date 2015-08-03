angular.module('buiiltApp')
  .controller('ContractorPackageInProcessCtrl',
  function($ionicTabsDelegate,API_URL,$scope, $state, $stateParams, filterFilter, currentTeam, fileService, authService, userService, contractorRequest, contractorRequestService, quoteService,notificationService) {
    /**
     * quote data
     */
    $scope.currentTeam = currentTeam;
    $scope.contractorRequest = contractorRequest;
    $scope.contractorRequest.winnerTeam._id.member  = filterFilter($scope.contractorRequest.winnerTeam._id.member , {status : 'Active'});

    $scope.currentUser = {};
    if (window.localStorage.getItem('token')) {
      $scope.currentUser = userService.get();
    }

    $scope.selectTabWithIndex = function(value){
        $ionicTabsDelegate.select(value);
        if (value == 1 || value == 2) {
            $rootScope.isShowAddIcon = true;
        }
        else
            $rootScope.isShowAddIcon = false;
    };

    if (currentTeam.type == 'supplier' || currentTeam.type == 'homeOwner') {
      $state.go('team.manager');
    }
    else if (currentTeam.type == 'builder') {
      if (contractorRequest.owner._id != currentTeam._id) {
        $state.go('team.manager');
      }
    }
    else {
      if (contractorRequest.winnerTeam._id._id != currentTeam._id) {
        $state.go('team.manager');
      }
    }

    notificationService.markReadByPackage({_id : contractorRequest._id}).$promise
      .then(function(res) {
      });

    $scope.complete = function() {
      contractorRequestService.complete({_id : $scope.contractorRequest._id}).$promise
        .then(function(res) {
          $scope.contractorRequest = res;
          $('#modal_complete').closeModal();
        })
    };

    fileService.getFileByStateParam({'id': $scope.contractorRequest._id}).$promise.then(function(data) {
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