angular.module('buiiltApp')
.controller('ThreadDetailCtrl', function($scope,thread,messageService) {
    $scope.thread = thread;
    $scope.message = {};
    $scope.sendMessage = function() {
        if ($scope.message.text != '') {
            messageService.sendMessage({id: $scope.thread._id, type: $scope.thread.type}, $scope.message).$promise
            .then(function (res) {
              $scope.message.text = '';
              $scope.thread = res;
            });
        }
    };
});