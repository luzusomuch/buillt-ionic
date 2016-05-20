angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('document', {
        url: '/',
        template: "<ion-nav-view></ion-nav-view>",
        abstract: true
    })
    .state("document.set", {
        url: ":setId/set",
        templateUrl: "js/modules/document/set/view.html",
        controller: "DocumentSetCtrl",
        authenticate: true
    })
    .state('document.detail', {
        url: ':documentId/document',
        templateUrl: 'js/modules/document/detail/view.html',
        controller: 'DocumentDetailCtrl',
        authenticate: true,
        resolve: {
            document: function(fileService, $stateParams) {
                return fileService.get({id: $stateParams.documentId}).$promise;
            }
        }
    });
});