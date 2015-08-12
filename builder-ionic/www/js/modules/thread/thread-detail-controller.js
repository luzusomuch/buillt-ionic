angular.module('buiiltApp')
.controller('ThreadDetailCtrl', function($state,$timeout,$scope,thread,messageService, $anchorScroll, $location) {
    $scope.thread = thread;
    $scope.message = {};

    // $("div#chatBox").scrollTop($("div#chatBox")[0].scrollHeight);
    // console.log($('div#chatBox').height());
    // $("div#chatBox").animate({ scrollTop: $("div#chatBox")[0].scrollHeight}, 500);

    $timeout(function(){
        $state.reload();
        $location.hash('bottom');
        $anchorScroll();
    });

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