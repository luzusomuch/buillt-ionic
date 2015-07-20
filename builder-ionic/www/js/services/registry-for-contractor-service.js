angular.module('buiiltApp')
.factory('registryForContractorService', function($rootScope, $q, $resource,API_URL) {
  // var currentUser = {};
  // if ($cookieStore.get('token')) {
  //   currentUser = userService.get();
  // }

  return $resource(API_URL + 'api/registryForContractors/:id/:action',{
    id : '@_id'},
    {
        
        createUserForContractorRequest: {
          method: 'POST'
        }
    }
);
});