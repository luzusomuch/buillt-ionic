angular.module('buiiltApp')
.factory('materialPackageService', function($resource,API_URL) {
  return $resource(API_URL + 'materials/:id/:action', {
    id: '@_id'},{
        get : {
          method : 'GET',
          isArray : true
        },
        createMaterialPackage: {
            method: 'POST'
        },
        getProjectForSupplier: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'supplier'
            },
            isArray: true
        },
        getMaterialByProjectForBuilder: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'projectb'
            },
            isArray: true
        },
        getMaterialByProjectForSupplier: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'project-supplier'
            },
            isArray: true
        },
        getMaterialPackageTenderByProjectForBuilder: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'tender-builder'
            },
            isArray: true
        },
        getMaterialPackageInProcessByProjectForBuilder: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'processing-builder'
            },
            isArray: true
        },
        getMaterialPackageInTenderByProjectForSupplier: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'tender-supplier'
            },
            isArray: true
        },
        getMaterialPackageInProcessByProjectForSupplier: {
            method: 'GET',
            params: {
                id: 'id',
                action: 'processing-supplier'
            },
            isArray: true
        }
    });
});
