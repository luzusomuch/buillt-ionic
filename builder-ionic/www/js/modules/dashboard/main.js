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
            currentUser: function(userService){
                return userService.get({isMobile: true}).$promise;
            },
            totalNotifications: function(notificationService) {
                return notificationService.getTotalForIos().$promise;
            }
        } 
    });
});