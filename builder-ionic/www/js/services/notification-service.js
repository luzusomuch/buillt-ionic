angular.module('buiiltApp')
.factory('notificationService', function($rootScope, $q, $resource, API_URL) {
  return $resource(API_URL + 'api/notifications/:id/:action',{
    id : '@_id'},
  {
    markItemsAsRead: {
      method: "GET",
      params: {
        action: "mark-items-as-read"
      }
    },
    get : {
      method : 'GET',
      isArray : true
    },
    markAsRead : {
      method : 'PUT',
      params : {
        action : 'mark-as-read'
      }
    },
    markAllAsRead : {
      method : 'PUT',
      isArray : true,
      params : {
        action : 'mark-all-as-read'
      }
    },
    getTotalForIos : {
      method : 'GET',
      params : {
        action : 'get-total-ios'
      },
      isArray: true
    }
  });
});