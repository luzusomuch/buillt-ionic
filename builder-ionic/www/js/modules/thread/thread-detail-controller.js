angular.module('buiiltApp')
.controller('ThreadDetailCtrl', function($rootScope, socket, $timeout, $scope, thread, messageService, $anchorScroll, $ionicModal, currentUser, notificationService) {
    $scope.thread = thread;
    $scope.currentUser = currentUser;

    $scope.message = {};

    socket.emit("join", thread._id);

    socket.on("thread:update", function(data) {
        if (_.findIndex(data.members, function(member) {
            return member._id.toString()===$scope.currentUser._id.toString();
        })===-1) {
            data.members.push($scope.currentUser);
        }
        $scope.thread = data;
        notificationService.markItemsAsRead({id: thread._id}).$promise.then();
    });

    $timeout(function() {
        // remove thread count number for current thread
        $rootScope.$emit("UpdateDashboardThreadCount", $scope.thread);

        // update the last access to current thread
        messageService.lastAccess({id: thread._id}).$promise.then(function(res) {
            $scope.thread.updatedAt = new Date();
            $rootScope.$emit("UpdateDashboardThreadLastAccess", $scope.thread);
        });
        
        // mark all notifications related to this thread is read
        notificationService.markItemsAsRead({id: thread._id}).$promise;
    }, 500);


    $scope.sendMessage = function() {
        if ($scope.message.text && $scope.message.text.trim() != '') {
            messageService.sendMessage({id: $scope.thread._id, type: $scope.thread.type}, $scope.message).$promise
            .then(function (res) {
                $scope.message.text = '';
                $scope.thread = res;
                $("textarea#textarea1").css('height', 0+'px');
                //Track Reply Sent
                mixpanel.identify($scope.currentUser._id);
                mixpanel.track("Reply Sent From Mobile");
            });
        }
    };
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