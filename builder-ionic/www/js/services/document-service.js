angular.module('buiiltApp').factory('documentService', function($resource, API_URL) {
    return $resource(API_URL + 'api/documents/:id/:type/:action', {id: '@_id'}, {
        me: {
            method: "GET",
            params: {
                action: "me"
            },
            isArray: true
        }
    });
});