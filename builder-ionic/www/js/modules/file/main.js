angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('fileDetail', {
        url: '/:fileId/file',
        templateUrl: 'js/modules/file/view.html',
        controller: 'FileDetailCtrl',
        authenticate : true,
    })   
});