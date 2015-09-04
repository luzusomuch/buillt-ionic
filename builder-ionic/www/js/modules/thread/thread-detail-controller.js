angular.module('buiiltApp')
.controller('ThreadDetailCtrl', function(authService,socket,$state,$timeout,$scope,thread,messageService, $anchorScroll, $location) {
    $scope.thread = thread;

    authService.getCurrentUser().$promise.then(function(user){
        _.each($scope.thread.messages, function(message){
            if (message.user._id == user._id) {
                message.owner = true;
            }
            else {
                message.owner = false;
            }
        });
    });

    $scope.message = {};

    socket.emit('join',$scope.thread._id);

    socket.on('message:new', function (thread) {
        $scope.thread = thread;
        // console.log($scope.scrollHeight = $('#messages')[0].scrollHeight);
    });

    // $("div#chatBox").scrollTop($("div#chatBox")[0].scrollHeight);
    // console.log($('div#chatBox').height());
    // $("div#chatBox").animate({ scrollTop: $("div#chatBox")[0].scrollHeight}, 500);

    $timeout(function(){
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