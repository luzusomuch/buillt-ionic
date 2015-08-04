angular.module('buiiltApp').config(function($stateProvider) {
  $stateProvider
 //  .state('projects', {
 //    url: '/projects',
	// authenticate : true,
 //    template: '<ion-view></ion-view>',
 //    resolve: {
 //      homeOwnerTeam : [
 //        'teamService',
 //        function(teamService) {
 //          return teamService.getHomeOwnerTeam();
 //        }
 //      ]
 //    }
 //  })
 //  .state('projects.list', {
 //    url: '/',
 //    templateUrl: 'js/modules/project/list-projects/list-projects.html',
 //    controller: 'ProjectListCtrl',
 //    authenticate : true
 //  })
 //  .state('projects.create', {
 //    url: '/create',
 //    templateUrl: 'js/modules/project/create-project/create-project.html',
 //    controller: 'CreateProjectCtrl',
 //    authenticate : true
 //  })
  .state('project', {
    url: '/:id',
    templateUrl: 'js/modules/project/view-project/view.html',
    controller: 'ViewProjectCtrl',
    authenticate : true,
    resolve: {
      team: function(authService){
        return authService.getCurrentTeam().$promise;
      },
      builderPackage: function(builderPackageService, $stateParams) {
        return builderPackageService.findDefaultByProject({id : $stateParams.id});
      },
      contractorPackages: function(contractorService, $stateParams) {
        return contractorService.get({id : $stateParams.id});
      },
      materialPackages: function(materialPackageService, $stateParams) {
        return materialPackageService.get({id : $stateParams.id});
      },
      staffPackages: function(staffPackageService, $stateParams) {
        return staffPackageService.getAll({id: $stateParams.id});
      },
      documents: function(fileService, $stateParams) {
        return fileService.getFileByStateParam({'id': $stateParams.id});
      }
    },
    hasCurrentProject : true
  });
});