angular.module('buiiltApp')
  .controller('SigninCtrl', function ($scope, deviceService, authService, $window,$stateParams, $state, $location) {
    $scope.user = {};
    $scope.errors = {};
    $scope.submitted = false;
    if ($stateParams.action) {
      if (!$stateParams.error) {
        $scope.success = true;
        $scope.successMsg = "Your email has been changed successfully";
      }
    }


    $scope.signin = function (form) {
      $scope.submitted = true;
      if (form.$valid) {
        authService.login($scope.user).then(function () {
          $state.go('dashboard');
          deviceService.insertDevice({deviceToken: window.deviceToken, deviceplatform: window.deviceplatform}).$promise.then();
        }, function (res) {
          // alert('errr' + res.message);
          $scope.error = true;
          $scope.errorMsg = res.message;
        });
      }
    };

    $scope.closeAlert = function (key) {
      delete $scope.errors[key];
    };
  });