angular.module('buiiltApp')
  .controller('SignoutCtrl', function($ionicLoading, deviceService,$scope, userService, $state, authService) {
    // authService.logout();
    $ionicLoading.show();
    userService.get({isMobile: true}).$promise.then(function(user) {
    	deviceService.removeDevice({id: user._id, deviceplatform: window.deviceplatform}).$promise.then(function(){
	        authService.logout(function() {
	        	$ionicLoading.hide();
	        	$state.go('signin');
	        });
	    });
    });
});