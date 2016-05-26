angular.module("buiiltApp").controller("DocumentDetailCtrl", function(document, $scope, $rootScope, $stateParams, socket, notificationService) {
    $scope.document = document;
    $scope.document.selectedPath = document.path;
    $scope.currentUser = $rootScope.currentUser;

    socket.emit("join", document._id);
    socket.on("document:update", function(data) {
        $scope.document = data;
        $scope.document.selectedPath = data.path;
        notificationService.markItemsAsRead({id: $stateParams.documentId}).$promise;
    });

    if ($scope.document.__v > 0) {
        notificationService.markItemsAsRead({id: $stateParams.documentId}).$promise;
        $rootScope.$emit("Document.Read", $scope.document);
    }
});