angular.module('buiiltApp').config(function($stateProvider) {
  $stateProvider
  .state('client', {
    url: '/:id/client',
    templateUrl: 'js/modules/client/client.html',
    controller: 'ClientCtrl',
    hasCurrentProject : true,
    authenticate : true,
    resolve: {
      builderPackage: function(builderPackageService, $stateParams) {
        return builderPackageService.getByProject({id : $stateParams.id}).$promise;
      },
      team: function(authService){
        return authService.getCurrentTeam().$promise;
      },
    }
  });
});