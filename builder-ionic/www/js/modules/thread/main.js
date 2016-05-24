angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider.state("threadDetail", {
        url: "/:threadId/thread",
        templateUrl: "js/modules/thread/view.html",
        controller: "ThreadDetailCtrl",
        authenticate: true,
        resolve: {
            currentUser: function(authService) {
                return authService.getCurrentUser().$promise;
            },
            currentTeam: function(authService) {
                return authService.getCurrentTeam().$promise;
            }
        }
    });
});