angular.module('buiiltApp')
.factory('deviceService', function($resource,API_URL) {
  return $resource(API_URL + 'api/devices/:id/:action', {
    id: '@_id'},{
        insertDevice: {
            method: 'post'
        },
        getDevice: {
            method: 'get',
            params: {
                id: 'id',
                action: 'device'
            }
        },
        removeDevice: {
            method: 'get',
            params: {
                id: 'id',
                action: 'remove-device'
            }
        }
    });
});
