angular.module('buiiltApp')
.controller('SigninCtrl', function ($ionicLoading,$scope, deviceService, authService, $window,$stateParams, $state, $location, $ionicModal) {
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
        $scope.error = true;
        $scope.errorMsg = res.message;
        $ionicLoading.hide();
      });
    }
  };

  $scope.closeAlert = function (key) {
    delete $scope.errors[key];
  };

  //create new account modal
  $ionicModal.fromTemplateUrl('modalSignup.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalSignup = modal;
  });

  $scope.signup = function() {
    $scope.submitted = true;
    if (!$scope.user.email || !$scope.user.password || !$scope.user.firstName || !$scope.user.lastName) {
      $scope.errors.signup = "Please check your input";
    } else if ($scope.user.password !== $scope.user.repassword) {
      $scope.errors.signup = "Please check your password";
    } else {
      $scope.user.isMobile = true;
      authService.createUser($scope.user).then(function (data) {
        $scope.modalSignup.hide();
        $scope.user = {
          allowNewsletter: true
        };
        $scope.submitted = false;
      }, function (res) {
        $scope.submitted = false;
        $scope.errors.signup = res.data;
      });
    }
  };
});