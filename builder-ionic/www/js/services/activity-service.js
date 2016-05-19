angular.module('buiiltApp').factory('activityService', function($resource, API_URL) {
    return $resource(API_URL +'api/activities/:id/:type/:action', {id: '@_id'}, {
        me: {
            method: "GET",
            params: {
                action: "me"
            },
            isArray: true
        }
    });
});