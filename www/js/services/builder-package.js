angular.module('buiiltApp')
  .factory('builderPackageService', function($resource, API_URL) {
    return $resource(API_URL + 'api/packages/builders/:id/:action', {
        id: '@_id'},
      {
        findDefaultByProject : {
          method : 'GET',
          params: {
            id: 'id'
          }
        },
        getByProject: {
          method: 'get',
          params: {
            id: 'id',
            action: 'find-by-project'
          }
        }
      }
    );
});