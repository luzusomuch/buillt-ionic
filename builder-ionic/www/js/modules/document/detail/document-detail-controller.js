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
            var path = "";
            if (window.deviceplatform === "ios") {
                path = cordova.file.documentsDirectory + $scope.document.name;
            } else {
                path = cordova.file.dataDirectory + $scope.document.name;
            }
            alert(path);
            $cordovaFileTransfer.download($scope.document.selectedPath, path, {}, true)
            .then(function(result) {
                $ionicLoading.hide();
                $ionicLoading.show({ template: 'Download Successfully...', noBackdrop: true, duration: 2000 });
            }, function(err) {
                $ionicLoading.hide();
                alert(err);
                $ionicLoading.show({ template: 'Error When Download...' + err.code, noBackdrop: true, duration: 2000 });
            });
        }, false);
    };
});