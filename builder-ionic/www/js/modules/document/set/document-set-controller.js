angular.module("buiiltApp").controller("DocumentSetCtrl", function($ionicLoading, $state, $q, $scope, $rootScope, $stateParams, socket, documentService, fileService, notificationService, $cordovaFileOpener2, $cordovaFileTransfer, $cordovaInAppBrowser) {
    var prom = [];
    if ($stateParams.setId.indexOf("set1")!==-1) {
        var projectId = $stateParams.setId.split("-")[1];
        prom.push(fileService.getProjectFiles({id: projectId, type: "document"}).$promise);
    } else {
        prom.push(documentService.get({id: $stateParams.setId}).$promise);
    }

    if (prom.length > 0) {
        $q.all(prom).then(function(res) {
            if ($stateParams.setId.indexOf("set1")!==-1) {
                $scope.documentSet = {name: "Set 1", documents: res[0], __v: _.filter(res[0], function(doc) {return doc.__v > 0}).length}
            } else {
                $scope.documentSet = res[0];
            }
        });
    } else {
        $state.go("dashboard");
    }

    $scope.$on("$destroy", function() {
        functionClearDocumentCount
    });

    var functionClearDocumentCount = $rootScope.$on("Document.Read", function(event, data) {
        var index = _.findIndex($scope.documentSet.documents, function(doc) {
            return doc._id.toString()===data._id.toString();
        });
        if (index !== -1) {
            $scope.documentSet.documents[index].__v = 0;
        }
    });

    $scope.openDetail = function(documentId) {
        notificationService.markItemsAsRead({id: documentId}).$promise;
        fileService.get({id: documentId}).$promise.then(function(document) {
            $rootScope.$emit("Document.Read", document);
            if (!document.path) {
                $ionicLoading.show({template: "This Document Has No Version Yet"});
            } else {
                filepicker.stat(
                    {url: document.path}, 
                    function(data){
                        console.log(data);
                        ionic.Platform.ready(function() {
                            $ionicLoading.show();
                            if (window.deviceplatform==="ios") {
                                fileService.getPublicS3Link({id: document._id}).$promise.then(function(res) {
                                    $cordovaInAppBrowser.open(res.publicUrl, "_blank", {"location": "no", "toolbar": "yes", "enableViewportScale":"yes", "closebuttoncaption": "Close"})
                                    .then(function(event) {
                                        $ionicLoading.hide();
                                    })
                                    .catch(function(event) {
                                        $ionicLoading.hide();
                                    })
                                }, function(err) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({template: "Error...", noBackdrop: true, duration: 2000});
                                });
                            } else if (window.deviceplatform==="android") {
                                $cordovaFileOpener2.appIsInstalled('com.adobe.reader').then(function(res) {
                                    if (res.status === 0) {
                                        $ionicLoading.show({template: "Please Download Adobe Read to View", noBackdrop: true, duration: 2000});
                                    } else {
                                      // Adobe Reader is installed.
                                        var fileUrl = cordova.file.externalDataDirectory +"/"+ document.name;
                                        $cordovaFileTransfer.download(encodeURI(document.path), fileUrl, {}, true)
                                        .then(function(reuslt) {
                                            $cordovaFileOpener2.open(fileUrl, data.mimetype).then(function() {
                                                $ionicLoading.hide();
                                            }, function(err) {
                                                $ionicLoading.hide();
                                            });
                                        }, function(err) {
                                            $ionicLoading.hide();
                                            $ionicLoading.show({template: "Error When Download...", noBackdrop: true, duration: 2000});
                                        });
                                    }
                                }, function(err) {
                                    $ionicLoading.hide();
                                    $ionicLoading.show({template: "Error When Checking PDF Read", noBackdrop: true, duration: 2000});
                                });
                            } else {
                                $ionicLoading.hide();
                            }
                        });
                    }
                );
            }
        }, function(err) {
            $ionicLoading.show({template: "Error", noBackdrop: true, duration: 2000});
        });
    };
});