angular.module('buiiltApp')
.factory('contractorService', function($resource,API_URL) {
  return $resource(API_URL + 'api/contractors/:id/:action', {
    id: '@_id'},{
        createContractorPackage: {
            method: 'POST'
        },
        get : {
          method : 'GET',
          isArray : true
        },
        getProjectForContractor: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'winner'
            },
            isArray: true
        },
        getContractorByProjectForBuilder: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'projectb'
            },
            isArray: true
        },
        getContractorByProjectForContractor: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'project-contractor'
            },
            isArray: true
        },
        getContractorPackageTenderByProjectForBuilder: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'tenderbuilder'
            },
            isArray: true
        },
        getContractorPackageInProcessByProjectForBuilder: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'processingbuilder'
            },
            isArray: true
        },
        getContractorPackageTenderByProjectForContractor: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'tendercontractor'
            },
            isArray: true
        },
        getContractorPackageInProcessByProjectForContractor: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'processingcontractor'
            },
            isArray: true
        }
    });
});
