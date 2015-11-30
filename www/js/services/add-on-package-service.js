angular.module('buiiltApp').factory('addOnPackageService', function(API_URL,$rootScope, $q, $resource) {
    return $resource(API_URL + 'api/addOnPackages/:id/:action', {id: '@_id'},{
        sendDefect: {
            method: 'POST',
            params: {
                id: '@id',
                action: 'send-defect'
            }
        },
        sendVariation: {
            method: 'POST',
            params: {
                id: '@id',
                action: 'send-variation'
            }
        },
        sendAddendum: {
            method: 'POST',
            params: {
                id: '@id',
                action: 'send-addendum'
            }
        },
        sendInvoice: {
            method: 'POST',
            params: {
                id: '@id',
                action: 'send-invoice'
            }
        },
        removeAddendum: {
            method: 'PUT',
            params: {
                id: '@id',
                action: 'remove-addendum'
            }
        },
        editAddendum: {
            method: 'PUT',
            params: {
                id: '@id',
                action: 'edit-addendum'
            }
        }
    });
});