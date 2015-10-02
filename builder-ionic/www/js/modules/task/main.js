angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('taskDetail', {
        url: '/task/:taskId',
        templateUrl: 'js/modules/task/view.html',
        controller: 'TaskDetailCtrl',
        authenticate : true,
        hasCurrentProject : true,
        resolve: {
            task: function(taskService, $stateParams) {
                return taskService.getOne({id:$stateParams.taskId}).$promise;
            }
        }
    })   
});