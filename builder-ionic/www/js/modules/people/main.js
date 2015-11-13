angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('peopleDetail', {
        url: '/:id/people',
        templateUrl: 'js/modules/people/view.html',
        controller: 'PeopleCtrl',
        authenticate : true,
        resolve: {
            team: function(authService){
                return authService.getCurrentTeam().$promise;
            },
            currentUser: function(authService){
                return authService.getCurrentUser().$promise;
            },
            builderPackage: function(builderPackageService, $stateParams) {
                return builderPackageService.findDefaultByProject({id: $stateParams.id}).$promise;
            }
        }
    });
});