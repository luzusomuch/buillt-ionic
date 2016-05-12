angular.module('buiiltApp').factory('uploadService', function($resource, API_URL) {
    return $resource(API_URL + 'api/uploads/:id/:action',
    {
        id : '@_id'
    },
    {
        upload: {
            method: 'POST',
            params: {
                id: '@id',
            }
        },
        uploadReversion: {
            method: "POST",
            params: {
                id: '@id',
                action: 'upload-reversion'
            }
        }
    });
});