angular.module('buiiltApp')
  .factory('taskService', function($rootScope, $q, $resource, API_URL) {
    // var currentUser = {};
    // if ($cookieStore.get('token')) {
    //   currentUser = userService.get();
    // }

    return $resource(API_URL + 'tasks/:id/:type/:action',{
        id : '@_id',
        type : '@_type'},
      {
        getAll: {
          method: 'GET',
          params: {
            action : 'list'
          },
          isArray: true
        },
        get : {
          method : 'GET',
          isArray : true,
          params: {
          }
        },
        myTask : {
          method : 'GET',
          isArray : true,
          params : {
            type : 'dashboard',
            action : 'me'
          }
        },
        create: {
          method: 'POST'
        },
        update : {
          method : 'PUT'
        },
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