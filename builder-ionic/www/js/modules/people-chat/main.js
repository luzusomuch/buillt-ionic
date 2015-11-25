angular.module('buiiltApp').config(function($stateProvider) {
    $stateProvider
    .state('peopleChat', {
        url: '/:id/people-chat/:peopleChatId',
        templateUrl: 'js/modules/people-chat/view.html',
        controller: 'PeopleChatCtrl',
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
            },
            peopleChat: function(peopleChatService, $stateParams) {
                return peopleChatService.get({id: $stateParams.peopleChatId}).$promise;
            }
        }
    });
});