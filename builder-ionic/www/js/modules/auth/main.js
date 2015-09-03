angular.module('buiiltApp').config(function($stateProvider) {
  $stateProvider
    .state('signin', {
      url: '/signin?action&error',
      templateUrl: 'js/modules/auth/signin/signin.html',
      controller: 'SigninCtrl'
    })
    .state('signout', {
      url: '/signout',
      controller: 'SignoutCtrl',
        authenticate : true
    });
});