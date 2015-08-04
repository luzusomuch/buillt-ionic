angular.module('buiiltApp')
.controller('FileDetailCtrl', function(API_URL,$scope,file,authService,fileService) {
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
});