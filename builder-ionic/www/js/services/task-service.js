angular.module('buiiltApp').factory('taskService', function($rootScope, $q, $resource, API_URL) {
  return $resource(API_URL + 'api/tasks/:id/:type/:action',{
    id : '@_id',
    type : '@_type'},
  {
    get : {
      method : 'GET',
    },
    getAll: {
      method: 'GET',
      params: {
        action : 'list'
      },
      isArray: true
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
    },
    getAllByUser: {
      method: 'get',
      params: {
        action: 'list-by-user'
      },
      isArray: true
    }
  });
});