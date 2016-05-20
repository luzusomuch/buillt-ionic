angular.module("buiiltApp").controller("DocumentSetCtrl", function($state, $q, $scope, $rootScope, $stateParams, socket, documentService, fileService) {
    var prom = [];
    if ($stateParams.setId.indexOf("set1")!==-1) {
        var projectId = $stateParams.setId.split("-")[1];
        prom.push(fileService.getProjectFiles({id: projectId, type: "document"}).$promise);
    } else {
        prom.push(documentService.get({id: $stateParams.setId}).$promise);
    }
    if (prom.length > 0) {
        $q.all(prom).then(function(res) {
            if ($stateParams.setId.indexOf("set1")!==-1) {
                $scope.documentSet = {name: "Set 1", documents: res[0], __v: _.filter(res[0], function(doc) {return doc.__v > 0}).length}
            } else {
                $scope.documentSet = res[0];
            }
        });
    } else {
        $state.go("dashboard");
    }
});