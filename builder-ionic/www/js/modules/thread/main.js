angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('threadDetail', {
        url: '/:id/thread/:threadId',
        templateUrl: 'js/modules/thread/view.html',
        controller: 'ThreadDetailCtrl',
        authenticate : true,
        resolve: {
            thread: function(messageService, $stateParams) {
                return messageService.get({id:$stateParams.threadId}).$promise;
            }
        }
    })   
});