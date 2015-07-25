angular.module('buiiltApp').controller('ClientCtrl', function(API_URL,authService, $stateParams,$scope, fileService, team, $state, $rootScope, builderPackage) {
    $scope.currentProject = $rootScope.currentProject;
    $scope.builderPackage = builderPackage;
    $scope.currentTeam = team;

    authService.getCurrentUser().$promise.then(function(data){
        $scope.currentUser = data;
    });

    fileService.getFileByStateParam({'id': $scope.builderPackage._id}).$promise.then(function(data) {
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