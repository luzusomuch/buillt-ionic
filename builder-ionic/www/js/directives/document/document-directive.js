angular.module('buiiltApp')
  .directive('document', function(){
    return {
        restrict: 'A',
        templateUrl: 'js/directives/document/document.html',
        controller: function($scope, $rootScope, fileService, authService) {
            $scope.showDefault = true;
            fileService.getAllByUser().$promise.then(function(res) {
                $scope.showDefault = true;
                $scope.documents = res;
                console.log(res);
            });

            $scope.$on('getPackage', function(event, value){
                getDocument(value.package._id);
            });

            $scope.$on('getProject', function(event, value){
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