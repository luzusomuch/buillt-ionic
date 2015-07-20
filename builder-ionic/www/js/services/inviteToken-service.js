angular.module('buiiltApp')
  .factory('inviteTokenService', function ($resource, API_URL) {
    return $resource(API_URL + 'api/invite-token/:id/:action', {
        id: '@_id'},
      {
        get : {
          method : 'GET'
        }
      }
    );
  });