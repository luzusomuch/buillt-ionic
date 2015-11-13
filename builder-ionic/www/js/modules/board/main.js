angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('boardDetail', {
        url: '/board/:boardId',
        templateUrl: 'js/modules/board/view.html',
        controller: 'BoardCtrl',
        authenticate : true,
        resolve: {
            currentUser: function(authService){
                return authService.getCurrentUser().$promise;
            }
        }
    });
});