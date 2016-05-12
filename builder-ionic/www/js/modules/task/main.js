angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('taskDetail', {
        url: '/task/:taskId',
        templateUrl: 'js/modules/task/view.html',
        controller: 'TaskDetailCtrl',
        authenticate : true,
        resolve: {
            task: function(taskService, $stateParams) {
                return taskService.get({id:$stateParams.taskId}).$promise;
            },
            currentUser: function(authService) {
                return authService.getCurrentUser({isMobile: true}).$promise;
            }
        }
    })   
});