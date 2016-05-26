angular.module('buiiltApp')
.controller('SigninCtrl', function ($ionicLoading, $rootScope, $scope, deviceService, authService, $window,$stateParams, $state, $location, $ionicModal, userService, tokenService) {
  $scope.usePhoneNumber = false;
  $scope.user = {};
  $scope.errors = {};
  $scope.submitted = false;

  if (window.localStorage.getItem('token')) {
    authService.getCurrentUser().$promise.then(function(currentUser){
      // $rootScope.currentUser = currentUser;  
      $state.go('dashboard');
    });
  }

  $scope.login = function() {
    $ionicLoading.show();
    authService.login($scope.user).then(function () {
      $scope.modalSignin.hide();
      $ionicLoading.hide();
      // deviceService.insertDevice({deviceToken: window.deviceToken, deviceplatform: window.deviceplatform}).$promise.then();
      $state.go('dashboard');
    }, function (res) {
      $scope.error = true;
      $scope.errorMsg = res.message;
      $ionicLoading.hide();
    });
  };

  $scope.signInWithEmail = function(form) {
    if (form.$valid) {
      $scope.user.url = "auth/local";
      $scope.login();
    } else {
      $ionicLoading.show({ template: 'Check your inputs...', noBackdrop: true, duration: 2000 });
    }
  };

  $scope.signInWithPhoneNumber = function (form) {
    $scope.submitted = true;
    if (form.$valid) {  
      $scope.user.url = "auth/mobile";
      $scope.login();
    } else {
      $ionicLoading.show({ template: 'Check your inputs...', noBackdrop: true, duration: 2000 });
    }
  };

  $scope.closeAlert = function (key) {
    delete $scope.errors[key];
  };

  $scope.step=1;
  $scope.next = function() {
    if ($scope.step==1 && (!$scope.user.phoneNumber || $scope.user.phoneNumber.trim().length===0)) {
      $ionicLoading.show({ template: 'Phone number missing...', noBackdrop: true, duration: 2000 });
    } else if ($scope.step==2 && (!$scope.user.verifyCode || $scope.user.verifyCode.length===0)) {
      $ionicLoading.show({ template: 'PIN missing...', noBackdrop: true, duration: 2000 });
    } else {
      if ($scope.step===1) {
        tokenService.create({}, $scope.user).$promise.then(function(res) {
          $ionicLoading.show({ template: 'We sent you a verification PIN...', noBackdrop: true, duration: 2000 });
          $scope.step+=1;
        }, function(err) {
          $ionicLoading.show({ template: err.data.msg, noBackdrop: true, duration: 2000 });
        });
      } else if ($scope.step===2) {
        tokenService.get({token: $scope.user.verifyCode}).$promise.then(function(res) {
          $ionicLoading.show({ template: "Verified!", noBackdrop: true, duration: 2000 });
          $scope.step+=1;
        }, function(err) {
          $ionicLoading.show({ template: err.data.msg, noBackdrop: true, duration: 2000 });
        });
      }
    }
  };

  //create new account modal
  $ionicModal.fromTemplateUrl('modalSignup.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalSignup = modal;
  });

  //show sign in modal
  $ionicModal.fromTemplateUrl('modalSignin.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalSignin = modal;
  });

  $scope.getToken = function(form) {
    if (form.$valid) {
      userService.getToken({phoneNumber: $scope.user.phoneNumber}).$promise.then(function(res) {
        $ionicLoading.show({ template: 'Your PIN is missing...', noBackdrop: true, duration: 2000 });
        $scope.modalSignin.show();
      }, function(err) {
        $ionicLoading.show({ template: 'There was an error...', noBackdrop: true, duration: 2000 });
      });
    } else {
      $ionicLoading.show({ template: 'Check your inputs...', noBackdrop: true, duration: 2000 });
    }
  };

  $scope.signup = function() {
    $scope.submitted = true;
    if (!$scope.user.firstName || !$scope.user.lastName) {
      $scope.errors.signup = "Check your inputs...";
    } else {
      $ionicLoading.show();
      $scope.user.isMobile = true;
      authService.createUser($scope.user).then(function (data) {
        $scope.modalSignup.hide();
        $ionicLoading.show({ template: 'Account Created!', noBackdrop: true, duration: 2000 });
        // deviceService.insertDevice({deviceToken: window.deviceToken, deviceplatform: window.deviceplatform}).$promise.then();
        $scope.user = {};
        $scope.submitted = false;
      }, function (res) {
        $scope.submitted = false;
        $scope.errors.signup = res.data;
      });
    }
  };
});