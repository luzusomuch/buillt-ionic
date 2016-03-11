angular.module('buiiltApp').factory('messageService', function($rootScope, $q, $resource,API_URL) {
  return $resource(API_URL + 'api/messages/:id/:type/:action',{
    id : '@_id',
    type : '@_type'},
  {
    create: {
      method: 'POST'
    },
    sendMessage : {
      method : 'POST',
      params : {
        action : 'message'
      }
    },
    update : {
      method : 'PUT'
    },
    getProjectThread: {
      method: "GET",
      params:{
        action: "project-thread"
      },
      isArray: true
    },
    get : {
      method : 'GET',
    },
    getOne : {
      method : 'GET',
      params : {
        action : 'one'
      }
    },
    lastAccess: {
      method: "GET",
      params: {
        action: "last-access"
      }
    },
  });
});