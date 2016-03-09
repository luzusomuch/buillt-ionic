angular.module('buiiltApp')
  .factory('notificationService', function($rootScope, $q, $resource, API_URL) {
    // var currentUser = {};
    // if ($cookieStore.get('token')) {
    //   currentUser = userService.get();
    // }

    return $resource(API_URL + 'api/notifications/:id/:action',{
        id : '@_id'},
      {
        markItemsAsRead: {
          method: "GET",
          params: {
            action: "mark-items-as-read"
          }
        },
        getAll: {
          method: 'GET',
          params: {
            action : 'list'
          },
          isArray: true
        },
        get : {
          method : 'GET',
          isArray : true
        },
        read : {
          method : 'PUT',
          params : {
            action : 'dashboard-read'
          }
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
        markReadByPackage : {
          method : 'PUT',
          isArray : true,
          params : {
            action : 'mark-read-by-package'
          }
        },
        create: {
          method: 'POST'
        },
        getMyFile: {
          method: 'GET',
          params: {
            id: 'id',
            action: 'my-file'
          },
          isArray: true
        },
        getTotal : {
          method : 'GET',
          params : {
            action : 'get-total'
          }
        },
        getTotalForIos : {
          method : 'GET',
          params : {
            action : 'get-total-ios'
          },
          isArray: true
        },
        readDocumentDashboard : {
          method : 'PUT',
          params : {
            action : 'dashboard-read-document'
          }
        },
        getOne: {
          method: 'get',
          params: {
            action: 'get-one'
          }
        }
        //update: {
        //  method: 'PUT'
        //},
        //get: {
        //  method: 'GET'
        //  // isArray: true
        //},
        //getByProjectId: {
        //  method: 'GET',
        //  params: {
        //    id: 'id',
        //    action: 'project'
        //  },
        //  isArray: true
        //}
      }
      // createProject: function(project, callback) {
      //   var cb = callback || angular.noop;

      //   return $this.save(project,
      //   function(data) {
      //     return cb(project);
      //   },
      //   function(err) {
      //     return cb(err);
      //   }.bind(this)).$promise;
      // }
    );
  });