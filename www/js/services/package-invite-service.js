angular.module('buiiltApp')
.factory('packageInviteService', function($resource,API_URL) {
  return $resource(API_URL + 'api/packageInvites/:id/:action', {
    id: '@_id'
  },
  {
    getByPackageInviteToken: {
      method: 'GET',
      params: {
        id: 'id',
        action: 'package-invite-token'
      }
    }
  });
});