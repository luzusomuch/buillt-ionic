angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('threadDetail', {
        url: '/thread/:threadId',
        templateUrl: 'js/modules/thread/view.html',
        controller: 'ThreadDetailCtrl',
        authenticate : true,
        resolve: {
            thread: function(messageService, $stateParams) {
                return messageService.get({id:$stateParams.threadId}).$promise;
            },
            currentUser: function(authService) {
                return authService.getCurrentUser().$promise;
            }
        }
    })   
});