angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('document', {
        url: '/:id',
        template: 'js/modules/document/document.html',
        controller: 'DocumentCtrl'
    })
});