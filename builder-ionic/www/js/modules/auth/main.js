angular.module('buiiltApp').config(function($stateProvider) {
  $stateProvider
    .state('signup', {
      url: '/signup?inviteToken',
      templateUrl: '/js/modules/auth/signup/signup.html',
      controller: 'SignupCtrl'
    })
    .state('signupWithInvite', {
      url: '/signup-invite?packageInviteToken',
      templateUrl: '/js/modules/auth/signup-with-invite/signup.html',
      controller: 'SignupWithInviteCtrl'
    })
    .state('signin', {
      url: '/signin?action&error',
      templateUrl: '/js/modules/auth/signin/signin.html',
      controller: 'SigninCtrl'
    })
    .state('forgotPassword', {
      url: '/forgot-password',
      templateUrl : '/js/modules/auth/forgot-password/forgot-password.html',
      controller: 'ForgotPasswordCtrl'
    })
    .state('resetPassword', {
      url: '/reset-password?token',
      templateUrl : '/js/modules/auth/reset-password/reset-password.html',
      controller: 'ResetPasswordCtrl',
      resolve : {
        token : [
          '$stateParams','authService',
          function($stateParams,authService) {
            return authService.getResetPasswordToken($stateParams.token);
          }
        ]
      }
    })
    .state('signout', {
      url: '/signout',
      controller: 'SignoutCtrl',
        authenticate : true
    });
});