angular.module('buiiltApp')
  .controller('SignoutCtrl', function(deviceService,$scope, $window, authService, $state, $location) {
    // authService.logout();
    authService.getCurrentUser().$promise.then(function(user){
        deviceService.removeDevice({id: user._id}).$promise.then(function(){
            authService.logout();
        });
    });
});