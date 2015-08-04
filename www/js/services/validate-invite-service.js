angular.module('buiiltApp')
.factory('validateInviteService', function($resource,API_URL) {
  return $resource(API_URL + 'api/validateInvites/:id/:action', {
    id: '@_id'
  },
  {
    getByUser: {
      method: 'GET'
    }
  });
});