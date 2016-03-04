angular.module('buiiltApp')
.controller('ThreadDetailCtrl', function(authService,socket,$state,$timeout,$scope,thread,messageService, $anchorScroll, $location) {
    $scope.thread = thread;

    authService.getCurrentUser().$promise.then(function(user){
        $scope.user = user;
        $scope.thread.orderedMessages = [];
        for (var i = $scope.thread.messages.length -1; i >= 0; i--) {
            $scope.thread.orderedMessages.push($scope.thread.messages[i]);
        };
        _.each($scope.thread.orderedMessages, function(message){
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
        $scope.thread.orderedMessages = [];
        for (var i = $scope.thread.messages.length-1; i >= 0; i--) {
            $scope.thread.orderedMessages.push($scope.thread.messages[i]);
        };
        _.each($scope.thread.messages, function(message){
            if (message.user._id == $scope.user._id) {
                message.owner = true;
            }
            else {
                message.owner = false;
            }
        });
    });

    $scope.sendMessage = function() {
        if ($scope.message.text != '') {
            messageService.sendMessage({id: $scope.thread._id, type: $scope.thread.type}, $scope.message).$promise
            .then(function (res) {
                $scope.message.text = '';
                $scope.thread = res;
                $scope.thread.orderedMessages = [];
                for (var i = $scope.thread.messages.length-1; i >= 0; i--) {
                    $scope.thread.orderedMessages.push($scope.thread.messages[i]);
                };
                _.each($scope.thread.orderedMessages, function(message){
                    if (message.user._id == $scope.user._id) {
                        message.owner = true;
                    }
                    else {
                        message.owner = false;
                    }
                });
                $("textarea#textarea1").css('height', 0+'px');
            });
        }
    };
	
    //send a message
    $ionicModal.fromTemplateUrl('sendMessageDialog.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.sendMessageDialog = modal;
    });
	
	

    // $scope.enterMessage = function ($event) {
    //     if ($event.keyCode === 13) {
    //         $event.preventDefault();
    //         $scope.sendMessage();
    //     }
    // };
})
.directive('textarea', function() {
  return {
    restrict: 'E',
    controller: function($scope, $element) {
      $element.css('overflow-y','hidden');
      $element.css('resize','none');
      resetHeight();
      adjustHeight();

      function resetHeight() {
        $element.css('height', 0 + 'px');
      }

      function adjustHeight() {
        var height = angular.element($element)[0]
          .scrollHeight + 1;
        $element.css('height', height + 'px');
        $element.css('max-height', height + 'px');
      }

      function keyPress(event) {
        // this handles backspace and delete
        if (_.contains([8, 46], event.keyCode)) {
          resetHeight();
        }
        adjustHeight();
      }

      $element.bind('keyup change blur', keyPress);

    }
  };
});