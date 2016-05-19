angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('documentDetail', {
        url: '/:documentId/document',
        templateUrl: 'js/modules/document/view.html',
        controller: 'DocumentDetailCtrl',
        authenticate : true,
    });
});