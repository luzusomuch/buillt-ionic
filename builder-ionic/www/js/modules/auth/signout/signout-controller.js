angular.module('buiiltApp')
  .controller('SignoutCtrl', function($scope, $window, authService, $state, $location) {
  authService.logout();
  // $window.location.href = '/signin';
  $state.go('signin')
});