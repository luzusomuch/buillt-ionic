angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('dashboard', {
        url: '/dashboard',
        templateUrl: 'js/modules/dashboard/dashboard.html',
        controller: 'DashboardCtrl',
        authenticate : true,
        resolve: {
            team: function(authService){
                return authService.getCurrentTeam().$promise;
            },
            currentUser: function(authService){
                return authService.getCurrentUser().$promise;
            },
            totalNotifications: function(notificationService) {
                return notificationService.getTotalForIos().$promise;
            }
        } 
    });
});