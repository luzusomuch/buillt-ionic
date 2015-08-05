angular.module('buiiltApp')
.controller('TaskDetailCtrl', function($scope,task,authService,taskService) {
    $scope.task = task;

    authService.getCurrentUser().$promise.then(function(res) {
        $scope.currentUser = res;
    });

    $scope.complete = function(task) {
        task.completed = !task.completed;
        if (task.completed) {
            task.completedBy = $scope.currentUser._id;
            task.completedAt = new Date();
        } else {
            task.completedBy = null;
            task.completedAt = null;
        }
        taskService.update({id : task._id, type : task.type},task).$promise
        .then(function(res) {
          //$('.card-title').trigger('click');
            // updateTasks();
        })
    };
});