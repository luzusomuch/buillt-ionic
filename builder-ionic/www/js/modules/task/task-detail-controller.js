angular.module('buiiltApp')
.controller('TaskDetailCtrl', function($ionicLoading, $scope,task,currentUser,taskService) {
    $scope.task = task;
    console.log(task);
    $scope.currentUser = currentUser;

    var contentHeight = $(".task-content").height() - $("div.tab-nav.tabs").height();
    $(".task-content-detail").css('height', contentHeight + 'px');

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