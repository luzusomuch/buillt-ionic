angular.module('buiiltApp')
.controller('ThreadDetailCtrl', function(socket,$state,$timeout,$scope,thread,messageService, $anchorScroll, $location, $ionicModal, currentUser, notificationService) {
    $scope.thread = thread;
    $scope.currentUser = currentUser;

    $scope.message = {};

    socket.emit("join", thread._id);

    socket.on("thread:update", function(data) {
        console.log(data);
        if (_.findIndex(data.members, function(member) {
            return member._id.toString()===$scope.currentUser._id.toString();
        })===-1) {
            data.members.push($scope.currentUser);
        }
        $scope.thread = data;
        console.log($scope.thread);
        notificationService.markItemsAsRead({id: thread._id}).$promise.then();
    });

    $scope.sendMessage = function() {
        if ($scope.message.text && $scope.message.text.trim() != '') {
            messageService.sendMessage({id: $scope.thread._id, type: $scope.thread.type}, $scope.message).$promise
            .then(function (res) {
                $scope.message.text = '';
                $scope.thread = res;
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