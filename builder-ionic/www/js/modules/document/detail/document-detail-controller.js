angular.module("buiiltApp").controller("DocumentDetailCtrl", function($ionicLoading, document, $scope, $rootScope, $stateParams, socket, notificationService, $cordovaFileTransfer) {
    $scope.document = document;
    $scope.document.selectedPath = document.path;
    $scope.currentUser = $rootScope.currentUser;

    socket.emit("join", document._id);
    socket.on("document:update", function(data) {
        $scope.document = data;
        $scope.document.selectedPath = data.path;
        if ($stateParams.documentId.toString()===data._id.toString()) {
            notificationService.markItemsAsRead({id: $stateParams.documentId}).$promise;
        }
    });

    notificationService.markItemsAsRead({id: $stateParams.documentId}).$promise;
    $rootScope.$emit("Document.Read", $scope.document);

    $scope.download = function() {
        ionic.Platform.ready(function() {
            $ionicLoading.show();
            $cordovaFileTransfer.download($scope.document.selectedPath, cordova.file.documentsDirectory + $scope.document.name, {}, true)
            .then(function(result) {
                $ionicLoading.hide();
                $ionicLoading.show({ template: 'Download Successfully...', noBackdrop: true, duration: 2000 });
            }, function(err) {
                $ionicLoading.hide();
                $ionicLoading.show({ template: 'Error When Download...', noBackdrop: true, duration: 2000 });
            });
        }, false);
    };
});