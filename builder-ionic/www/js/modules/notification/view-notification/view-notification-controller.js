angular.module('buiiltApp').controller('ViewNotificationCtrl',
  function($state,$scope,authService) {
    authService.getCurrentUser().$promise.then(function(res){
        $scope.currentUser = res;
    });
  });