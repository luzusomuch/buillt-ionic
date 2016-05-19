angular.module('buiiltApp')
.controller('ThreadDetailCtrl', function($rootScope, socket, $timeout, $scope, messageService, notificationService, authService, $stateParams) {
    messageService.get({id:$stateParams.threadId}).$promise.then(function(thread) {
        $scope.thread = thread;
        $scope.currentUser = authService.getCurrentUser();

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
                    $scope.message.text = null;
                    $scope.thread = res;
                    //Track Reply Sent
                    mixpanel.identify($scope.currentUser._id);
                    mixpanel.track("Reply Sent From Mobile");

                    var element = document.getElementById("textarea1");
                    element.style.height =  "auto";
                });
            }
        };

        $scope.expandText = function() {
            var element = document.getElementById("textarea1");
            element.style.height =  element.scrollHeight + "px";
        };
    });
});