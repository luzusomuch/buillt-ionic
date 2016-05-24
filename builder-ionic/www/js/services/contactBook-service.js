angular.module('buiiltApp').factory('contactBookService', function($resource, API_URL) {
    return $resource(API_URL + 'api/contactBooks/:id/:type/:action', {id: '@_id'}, {
        me: {
            method: "GET",
            params: {
                action: "me"
            },
            isArray: true
        }
    });
});