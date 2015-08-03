angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('threadDetail', {
        url: '/:id/thread/:threadId',
        templateUrl: 'js/modules/thread/view.html',
        controller: 'ThreadDetailCtrl',
        authenticate : true,
        hasCurrentProject : true,
        resolve: {
            thread: function(messageService, $stateParams) {
                return messageService.getById({id:$stateParams.threadId}).$promise;
            }
        }
    })   
});