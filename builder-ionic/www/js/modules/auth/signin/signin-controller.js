angular.module('buiiltApp')
.controller('SigninCtrl', function ($ionicLoading,$scope, deviceService, authService, $window,$stateParams, $state, $location) {
  $scope.user = {};
  $scope.errors = {};
  $scope.submitted = false;

  $scope.signin = function (form) {
    $scope.submitted = true;
    if (form.$valid) {  
      $ionicLoading.show();
      authService.login($scope.user).then(function () {
        $ionicLoading.hide();
        $state.go('dashboard');
        // deviceService.insertDevice({deviceToken: window.deviceToken, deviceplatform: window.deviceplatform}).$promise.then();
      }, function (res) {
        // alert('errr' + res.message);
        $scope.error = true;
        $scope.errorMsg = res.message;
        $ionicLoading.hide();
      });
    }
  };

  $scope.closeAlert = function (key) {
    delete $scope.errors[key];
  };
});