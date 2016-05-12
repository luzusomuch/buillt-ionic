angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('documentDetail', {
        url: '/document/:documentId',
        templateUrl: 'js/modules/document/view.html',
        controller: 'DocumentDetailCtrl',
        authenticate : true,
        resolve: {
            document: function(fileService, $stateParams) {
                return fileService.get({id:$stateParams.documentId}).$promise;
            }
        }
    })   
});