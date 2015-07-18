angular.module('buiiltApp')
.factory('uploadService', function($rootScope, $q, $resource, API_URL) {

  return $resource(API_URL + 'uploads/:id/:action',{
    id : '@_id'},
    {
        upload: {
            method: 'POST',
            params: {
                id: 'id',
                action: 'file'
            }
        }
    }
);
});