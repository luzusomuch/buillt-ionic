angular.module('buiiltApp')
.controller('SigninCtrl', function ($ionicLoading, $rootScope, $scope, deviceService, authService, $window,$stateParams, $state, $location, $ionicModal, userService) {
  $scope.user = {};
  $scope.errors = {};
  $scope.submitted = false;

  if (window.localStorage.getItem('token')) {
    authService.getCurrentUser().$promise.then(function(currentUser){
      // $rootScope.currentUser = currentUser;  
      $state.go('dashboard');
    });
  }

  $scope.signin = function (form) {
    $scope.submitted = true;
    if (form.$valid) {  
      $ionicLoading.show();
      authService.login($scope.user).then(function () {
        $ionicLoading.hide();
        // deviceService.insertDevice({deviceToken: window.deviceToken, deviceplatform: window.deviceplatform}).$promise.then();
        $state.go('dashboard');
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
    if (!$scope.user.firstName || !$scope.user.lastName) {
      $scope.errors.signup = "Please check your input";
    } else {
      $ionicLoading.show();
      $scope.user.isMobile = true;
      authService.createUser($scope.user).then(function (data) {
        $scope.modalSignup.hide();
        $ionicLoading.show({ template: 'Create New User Successfully!', noBackdrop: true, duration: 2000 });
        // deviceService.insertDevice({deviceToken: window.deviceToken, deviceplatform: window.deviceplatform}).$promise.then();
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