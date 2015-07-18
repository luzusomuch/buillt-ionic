angular.module('buiiltApp')
.factory('packageService', function($rootScope, $q, $resource,API_URL) {

  return $resource(API_URL + 'packages/:id/:action',{
    id : '@_id'},
    {
        getPackageByProject: {
          method: 'GET',
          params: {
            id: 'id',
            action: 'project'
          }
        }
    }
);
});