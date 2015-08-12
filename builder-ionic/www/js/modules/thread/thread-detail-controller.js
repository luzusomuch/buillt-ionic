angular.module('buiiltApp')
.controller('ThreadDetailCtrl', function($scope,thread,messageService, $anchorScroll) {
    $scope.thread = thread;
    $anchorScroll();
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

    $scope.enterMessage = function ($event) {
        if ($event.keyCode === 13) {
            $event.preventDefault();
            $scope.sendMessage();
        }
    };
});