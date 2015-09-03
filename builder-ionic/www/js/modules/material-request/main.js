angular.module('buiiltApp').config(function($stateProvider) {
  $stateProvider
  .state('materialRequestInProcess', {
    url: '/:id/material-request/:packageId/processing',
    templateUrl: 'js/modules/material-request/material-package-in-process/view.html',
    controller: 'MaterialPackageInProcessCtrl',
    hasCurrentProject : true,
    authenticate : true,
    resolve: {
      currentTeam : [
        'authService',
        function(authService) {
          return authService.getCurrentTeam().$promise;
        }
      ],
      materialRequest: function($stateParams, materialRequestService){
        return materialRequestService.findOne({'id':$stateParams.packageId}).$promise;
      }
    }
  });
});