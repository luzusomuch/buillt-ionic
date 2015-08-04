angular.module('buiiltApp').config(function($stateProvider) {
  $stateProvider
  .state('tender', {
    url: '/tender',
    templateUrl: 'js/modules/tender/tender.html',
    controller: 'TenderCtrl'
  });
});