angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('taskDetail', {
        url: '/:taskId/task',
        templateUrl: 'js/modules/task/view.html',
        controller: 'TaskDetailCtrl',
        authenticate : true,
    })   
});