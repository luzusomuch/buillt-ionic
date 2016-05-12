angular.module('buiiltApp').factory('taskService', function($rootScope, $q, $resource, API_URL) {
  return $resource(API_URL + 'api/tasks/:id/:type/:action',{
    id : '@_id',
    type : '@_type'},
  {
    get : {
      method : 'GET',
    },
    getProjectTask: {
      method: "GET",
      params: {action: "project-tasks"},
      isArray: true
    },
    create: {
      method: 'POST'
    },
    update : {
      method : 'PUT'
    }
  });
});