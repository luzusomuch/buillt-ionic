angular.module('buiiltApp').config(function($stateProvider) {
  $stateProvider
  .state('dashboard', {
    url: '/dashboard',
    templateUrl: 'js/modules/dashboard/dashboard.html',
    controller: 'DashboardCtrl',
    authenticate : true
  });
});