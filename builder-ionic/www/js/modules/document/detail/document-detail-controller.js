angular.module("buiiltApp").controller("DocumentDetailCtrl", function(document, $scope, $rootScope, $stateParams, socket) {
    $scope.document = document;
    $scope.document.selectedPath = document.path;
    $scope.currentUser = $rootScope.currentUser;

    socket.emit("join", document._id);
    socket.on("document:update", function(data) {
        $scope.document = data;
        $scope.document.selectedPath = data.path;
    });
});