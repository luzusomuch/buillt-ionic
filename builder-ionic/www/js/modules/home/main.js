angular.module('buiiltApp').config(function($stateProvider) {
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'js/modules/home/home.html',
      controller: 'HomeCtrl',
      authenticate : true

    });
});