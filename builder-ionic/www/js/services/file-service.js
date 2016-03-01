angular.module('buiiltApp').factory('fileService', function($rootScope, $q, $resource,API_URL) {
  return $resource(API_URL + 'api/files/:id/:type/:action', {
id: '@_id'},{
    get: {
      method: 'GET',
    },
    getProjectFiles: {
      method: "GET",
      params: {
        action: "project-files"
      },
      isArray: true
    }
  });
});