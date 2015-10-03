angular.module('buiiltApp')
  .directive('document', function(){
    return {
        restrict: 'A',
        templateUrl: 'js/directives/document/document.html',
        controller: function($scope, $rootScope, fileService, authService) {
            $scope.showDefault = true;
            if ($rootScope.selectProject._id || $rootScope.currentProjectId) {
                var projectId = ($rootScope.selectProject._id) ? $rootScope.selectProject._id : $rootScope.currentProjectId;
                getDocument(projectId);
            } else if ($rootScope.selectPackage) {
                getDocument($rootScope.selectPackage._id);
            } else {
                fileService.getAllByUser().$promise.then(function(res) {
                    $scope.showDefault = true;
                    $scope.documents = res;
                });
            }

            $scope.$on('getPackage', function(event, value){
                getDocument(value.package._id);
            });

            $scope.$on('getProject', function(event, value){
                $rootScope.currentProjectId = value;
                getDocument(value);
            });

            $scope.$on('inComingNewDocument', function(event, value){
                $scope.documents.push(value);
            });

            var getDocument = function(id) {
                fileService.getFileByStateParamIos({id: id}).$promise.then(function(res){
                    $scope.documents = res;
                    $scope.showDefault = false;
                    console.log(res);
                });
            };
        }
    }
});