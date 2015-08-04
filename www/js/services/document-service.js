angular.module('buiiltApp').factory('documentService', function($rootScope, $q, $resource, API_URL) {
    return $resource(API_URL + 'api/documents/:id/:action', {
        id: '@_id'},{
            getByProjectAndPackage: {
              method: 'GET',
              params: {
                id: 'id',
                action: 'package'
              },
              isArray: true
            },
            create: {
              method: 'POST',
              params: {
                id: 'id'
              }
            }
    });
});