angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('fileDetail', {
        url: '/file/:fileId',
        templateUrl: 'js/modules/file/view.html',
        controller: 'FileDetailCtrl',
        authenticate : true,
        resolve: {
            file: function(fileService, $stateParams) {
                return fileService.get({id:$stateParams.fileId}).$promise;
            },
            currentUser: function(authService) {
                return authService.getCurrentUser().$promise;
            }
        }
    })   
});