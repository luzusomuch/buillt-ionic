angular.module('buiiltApp').controller('ClientCtrl', function($scope, team, $state, $rootScope, builderPackage) {
    $scope.currentProject = $rootScope.currentProject;
    $scope.builderPackage = builderPackage;
    $scope.currentTeam = team;
});