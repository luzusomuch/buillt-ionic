angular.module('buiiltApp')
  .directive('document', function(){
    return {
        restrict: 'A',
        templateUrl: 'js/directives/document/document.html',
        controller: function($scope, $rootScope, fileService, authService) {
            var getDocument = function(id) {
                fileService.getFileByStateParamIos({id: id}).$promise.then(function(res){
                    $scope.documents = res;
                    $scope.showDefault = false;
                });
            };

            $scope.$on('getPackage', function(event, value){
                $rootScope.hasSelectCurrentPackage = true;
                $rootScope.currentSelectPackage = {_id: value.package._id, type: value.package.type};
                getDocument(value._id);
            });

            $scope.$on('getProject', function(event, value){
                $rootScope.hasSelectCurrentPackage = false;
                $rootScope.currentProjectId = value;
                getDocument(value);
            });

            $scope.$on('inComingNewDocument', function(event, value){
                $scope.documents.push(value);
            });

            if (($rootScope.selectProject._id || $rootScope.currentProjectId) && !$rootScope.hasSelectCurrentPackage) {
                var projectId = ($rootScope.selectProject._id) ? $rootScope.selectProject._id : $rootScope.currentProjectId;
                getDocument(projectId);
            } else if (($rootScope.selectPackage || $rootScope.currentSelectPackage) && $rootScope.hasSelectCurrentPackage) {
                var packageId = ($rootScope.selectPackage) ? $rootScope.selectPackage._id : $rootScope.currentSelectPackage._id;
                getDocument(packageId);
            } else {
                fileService.getAllByUser().$promise.then(function(res) {
                    $scope.showDefault = true;
                    $scope.documents = res;
                });
            }
        }
    }
});