angular.module("buiiltApp").controller("DocumentDetailCtrl", function($ionicLoading, document, $scope, $rootScope, $stateParams, socket, notificationService, $cordovaFileTransfer, $cordovaInAppBrowser) {
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
            // var path = "";
            // if (window.deviceplatform === "ios") {
            //     path = cordova.file.documentsDirectory + $scope.document.name;
            // } else {
            //     path = cordova.file.dataDirectory + $scope.document.name;
            // }
            // alert(path);
            // $cordovaFileTransfer.download($scope.document.selectedPath, path, {}, true)
            // .then(function(result) {
            //     $ionicLoading.hide();
            //     $ionicLoading.show({ template: 'Download Successfully...', noBackdrop: true, duration: 2000 });
            // }, function(err) {
            //     $ionicLoading.hide();
            //     alert(err);
            //     $ionicLoading.show({ template: 'Error When Download...' + err.code, noBackdrop: true, duration: 2000 });
            // });
            // if (window.deviceplatform==="ios") {
            //     $cordovaInAppBrowser.open($scope.document.selectedPath, "_blank", 'location=no,toolbar=yes,closebuttoncaption=Close PDF,enableViewportScale=yes')
            //     .then(function(event) {
            //         $ionicLoading.hide();
            //     }).catch(function(event) {
            //         $ionicLoading.hide();
            //         alert(event);
            //         $ionicLoading.show({ template: 'Error When Open...', noBackdrop: true, duration: 2000 });
            //     });
            // } else if (window.deviceplatform==="android") {
            //     var fileUrl = cordova.file.externalApplicationStorageDirectory + $scope.document.name;
            //     $cordovaFileTransfer.download(encodeURI($scope.document.selectedPath), fileUrl, {}, true)
            //     .then(function(reuslt) {

            //     });
            // }
            $cordovaInAppBrowser.open($scope.document.selectedPath, "_blank", {location: "no", toolbar: "yes", clearcache: 'no'})
            .then(function(event) {
                $ionicLoading.hide();
            }).catch(function(event) {
                $ionicLoading.hide();
                alert(event);
                $ionicLoading.show({ template: 'Error When Open...', noBackdrop: true, duration: 2000 });
            });
            $cordovaInAppBrowser.close();
        }, false);
    };
});