angular.module('buiiltApp')
  .factory('builderPackageService', function($resource, API_URL) {
    return $resource(API_URL + 'packages/builders/:id/:action', {
        id: '@_id'},
      {
        findDefaultByProject : {
          method : 'GET'
        }
      }
    );
});