angular.module('buiiltApp').config(function($stateProvider) {
  $stateProvider
  .state('user', {
    url: '/user',
    templateUrl: '/js/modules/user/edit-user/form.html',
    controller: 'UserCtrl',
    authenticate: true
  })
  .state('user.teamInvitation', {
    url: '/team/invitation',
    templateUrl: '/js/modules/user/team-invitation/index.html',
    controller: 'TeamInvitationCtrl',
    resolve : {
      invitations : [
        'teamService',
        function(authService) {
          return authService.getCurrentInvitation();
        }
      ]
    }
  })
});