angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('threadDetail', {
        url: '/:threadId/thread',
        templateUrl: 'js/modules/thread/view.html',
        controller: 'ThreadDetailCtrl',
        authenticate : true,
        // resolve: {
            // thread: function(messageService, $stateParams) {
            //     console.log($$stateParams);
            //     return messageService.get({id:$stateParams.threadId}).$promise;
            // },
            // currentUser: function(authService) {
            //     return authService.getCurrentUser().$promise;
            // }
        // }
    })   
});