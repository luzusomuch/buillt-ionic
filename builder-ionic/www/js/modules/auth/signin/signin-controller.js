angular.module('buiiltApp')
.controller('SigninCtrl', function ($ionicLoading, $rootScope, $scope, deviceService, authService, $window,$stateParams, $state, $location, $ionicModal, userService, tokenService) {
  $scope.user = {
    rememberMe: true
  };
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
        $scope.modalSignin.hide();
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

  $scope.step=1;
  $scope.next = function() {
    if ($scope.step==1 && (!$scope.user.phoneNumber || $scope.user.phoneNumber.trim().length===0)) {
      $ionicLoading.show({ template: 'Please Enter Your Phone Number!', noBackdrop: true, duration: 2000 });
    } else if ($scope.step==2 && (!$scope.user.verifyCode || $scope.user.verifyCode.length===0)) {
      $ionicLoading.show({ template: 'Please Enter Verify Code!', noBackdrop: true, duration: 2000 });
    } else {
      if ($scope.step===1) {
        tokenService.create({}, $scope.user).$promise.then(function(res) {
          $ionicLoading.show({ template: 'Successfully! We will send token to that phone number!', noBackdrop: true, duration: 2000 });
          $scope.step+=1;
        }, function(err) {
          $ionicLoading.show({ template: err.data.msg, noBackdrop: true, duration: 2000 });
        });
      } else if ($scope.step===2) {
        tokenService.get({token: $scope.user.verifyCode}).$promise.then(function(res) {
          $ionicLoading.show({ template: "Verify Successfully!", noBackdrop: true, duration: 2000 });
          $scope.step+=1;
        }, function(err) {
          console.log(err);
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
        $ionicLoading.show({ template: 'Please Enter Your Token To Continue!', noBackdrop: true, duration: 2000 });
        $scope.modalSignin.show();
      }, function(err) {
        $ionicLoading.show({ template: 'Error!', noBackdrop: true, duration: 2000 });
      });
    } else {
      $ionicLoading.show({ template: 'Check Your Input!', noBackdrop: true, duration: 2000 });
    }
  };

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