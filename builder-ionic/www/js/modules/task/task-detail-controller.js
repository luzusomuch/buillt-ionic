angular.module('buiiltApp')
.controller('TaskDetailCtrl', function($ionicLoading, $scope,task,authService,taskService) {
    $scope.task = task;

    authService.getCurrentUser().$promise.then(function(res) {
        $scope.currentUser = res;
    });

    var contentHeight = $(".task-content").height() - $("div.tab-nav.tabs").height();
    $(".task-content-detail").css('height', contentHeight + 'px');

    $scope.complete = function(task) {
        $ionicLoading.show();
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
            $ionicLoading.hide();
        }, function(err) {
            $ionicLoading.hide();
        })
    };
});