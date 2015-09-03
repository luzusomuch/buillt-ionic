angular.module('buiiltApp').config(function($stateProvider) {
  $stateProvider
  .state('contractorRequestInProgress', {
    url: '/:id/contractor-requests/:packageId/processing',
    templateUrl: 'js/modules/contractor-request/contractor-package-in-process/view.html',
    controller: 'ContractorPackageInProcessCtrl',
    hasCurrentProject : true,
    authenticate : true,
    resolve: {
      currentTeam : [
        'authService',
        function(authService) {
          return authService.getCurrentTeam().$promise;
        }
      ],
      contractorRequest: function($stateParams, contractorRequestService){
        return contractorRequestService.findOne({'id':$stateParams.packageId}).$promise;
      }
    }
  });
});
