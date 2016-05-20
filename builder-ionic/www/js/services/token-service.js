angular.module('buiiltApp').factory('tokenService', function($resource, API_URL) {
    return $resource(API_URL + 'api/verifyTokens/:id/:action',
    {
        id : '@_id'
    },
    {
        get: {
            method: 'GET'
        },
        create: {
            method: "POST"
        }
    });
});