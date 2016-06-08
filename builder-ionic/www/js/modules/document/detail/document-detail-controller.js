angular.module("buiiltApp").controller("DocumentDetailCtrl", function(fileService, $ionicLoading, document, $scope, $rootScope, $stateParams, socket, notificationService, $cordovaFileTransfer, $cordovaInAppBrowser, $cordovaFileOpener2) {
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
        // Get file metadata
        filepicker.stat(
            {url: $scope.document.selectedPath}, 
            function(data){
                console.log(data);
                ionic.Platform.ready(function() {
                    $ionicLoading.show();
                    fileService.getPublicS3Link({id: document._id}).$promise.then(function(res) {
                        $cordovaInAppBrowser.open(res.publicUrl, "_blank", {"location": "no", "toolbar": "yes", "enableViewportScale":"yes", "closebuttoncaption": "Close"})
                        .then(function(event) {
                            // alert("Success: " + event);
                            $ionicLoading.hide();
                        })
                        .catch(function(event) {
                            // alert("ERrro: " + event);
                            $ionicLoading.hide();
                        })
                    }, function(err) {
                        $ionicLoading.hide();
                        $ionicLoading.show({template: "Error...", noBackdrop: true, duration: 2000});
                    });
                    if (window.deviceplatform==="ios") {
                        // var fileUrl = cordova.file.documentsDirectory + data.name;
                        // console.log(fileUrl);
                        // $cordovaFileTransfer.download(encodeURI($scope.document.selectedPath), fileUrl, {}, true)
                        // .then(function(result) {
                        //     alert("Download Success");
                        //     alert(JSON.stringify(result));
                        //     $cordovaFileOpener2.open(fileUrl.toURL(), data.mimetype).then(function() {
                        //         $ionicLoading.hide();
                        //         alert("Open Success");
                        //     }, function(err) {
                        //         $ionicLoading.hide();
                        //         alert("Error while open: " + err.code + " message: "+ err.message);
                        //         alert(err);
                        //     });
                        // }, function(err) {
                        //     $ionicLoading.hide();
                        //     alert("Download Error :" + err.code);
                        //     alert(err.message);
                        // });
                    } else if (window.deviceplatform==="android") {
                        $cordovaFileOpener2.appIsInstalled('com.adobe.reader').then(function(res) {
                            if (res.status === 0) {
                              // Adobe Reader is not installed.
                                $ionicLoading.show({template: "Please Download Adobe Read to View", noBackdrop: true, duration: 2000});
                            } else {
                              // Adobe Reader is installed.
                                var fileUrl = cordova.file.externalDataDirectory +"/"+ $scope.document.name;
                                $cordovaFileTransfer.download(encodeURI($scope.document.selectedPath), fileUrl, {}, true)
                                .then(function(reuslt) {
                                    $cordovaFileOpener2.open(fileUrl, data.mimetype).then(function() {
                                        $ionicLoading.hide();
                                    }, function(err) {
                                        $ionicLoading.hide();
                                    });
                                }, function(err) {
                                    $ionicLoading.show({template: "Error When Download...", noBackdrop: true, duration: 2000});
                                });
                            }
                        });
                    }
                });
            }
        );
    };
});