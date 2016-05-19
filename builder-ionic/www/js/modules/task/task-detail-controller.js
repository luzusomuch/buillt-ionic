angular.module('buiiltApp')
.controller('TaskDetailCtrl', function($rootScope, $ionicLoading, $timeout, $scope, $stateParams, taskService, socket, notificationService, authService) {
    taskService.get({id: $stateParams.taskId}).$promise.then(function(task) {
        $scope.task = task;
        $scope.currentUser = authService.getCurrentUser();

        socket.emit("join", task._id);
        socket.on("task:update", function(data) {
            $scope.task = data;
            notificationService.markItemsAsRead({id: task._id}).$promise.then();
        });

        $timeout(function() {
            // remove task count number for current task
            $rootScope.$emit("UpdateDashboardTaskCount", $scope.task);
            
            // mark all notifications related to this task is read
            notificationService.markItemsAsRead({id: task._id}).$promise;
        }, 500);

        $scope.complete = function(task) {
            $ionicLoading.show();
            task.completed = !task.completed;
            if (task.completed) {
                task.completedBy = $scope.currentUser._id;
                $scope.task.editType = "complete-task";
                task.completedAt = new Date();
            } else {
                task.completedBy = null;
                $scope.task.editType = "uncomplete-task";
                task.completedAt = null;
            }
            taskService.update({id : task._id},task).$promise
            .then(function(res) {
                $ionicLoading.hide();
            }, function(err) {
                $ionicLoading.hide();
            })
        };
    });
});