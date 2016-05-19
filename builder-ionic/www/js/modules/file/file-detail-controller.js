angular.module("buiiltApp").controller("FileDetailCtrl", function($scope, $rootScope, $timeout, $ionicPopover, $ionicLoading, $stateParams, socket, notificationService, uploadService, fileService, authService) {
    fileService.get({id: $stateParams.fileId}).$promise.then(function(file) {
        socket.emit("join", file._id);
        socket.on("file:update", function(data) {
            $scope.file = data;
            notificationService.markItemsAsRead({id: file._id}).$promise.then();
            fileInitial($scope.file);
        });

        $timeout(function() {
            // remove file count number for current file
            $rootScope.$emit("UpdateDashboardFileCount", $scope.file);
            
            // mark all notifications related to this file is read
            notificationService.markItemsAsRead({id: file._id}).$promise;
        }, 500);

        function fileInitial(file) {
            _.each(file.activities, function(activity) {
                // grant the link from file history to the activity to get the thumbnail
                if (activity.activityAndHisToryId) {
                    var index = _.findIndex(file.fileHistory, function(history) {
                        return history.activityAndHisToryId==activity.activityAndHisToryId;
                    });
                    if (index !== -1) {
                        activity.element.link = file.fileHistory[index].link;
                        activity.element.fileType = (activity.element.link.substr(activity.element.link.length-3, activity.element.link.length).toLowerCase()==="pdf") ? "pdf" : "image";
                    }
                }
            });
        };

        $scope.file = file;
        fileInitial($scope.file);
        $scope.currentUser = authService.getCurrentUser();

        $ionicPopover.fromTemplateUrl('modalCreateDocument.html', {
            scope: $scope
          }).then(function(popover) {
            $scope.modalCreateDocument = popover;
        });

        $scope.openUploadReversion = function() {
            $scope.modalCreateDocument.show();
        };

        $scope.closeModal = function() {
            $scope.modalCreateDocument.hide();
        };

        $scope.reversion = {};
        $scope.getFileUpload = function() {
            $ionicLoading.show();
            var input = document.getElementById("read-input");
            filepicker.store(
                input,
                function(Blob) {
                    console.log(Blob);
                    $scope.reversion.file = Blob;
                },
                function(fperror) {
                    console.log(FPError.toString());// - print errors to console
                },
                function(progress) {
                    console.log(progress);
                    if (progress===100) {
                        $ionicLoading.hide();
                    }
                }
            )
        };

        $scope.uploadReversion = function() {
            $ionicLoading.show();
            uploadService.uploadReversion({id: file._id}, $scope.reversion).$promise.then(function(res) {
                $ionicLoading.hide();
                $ionicLoading.show({ template: 'Uploaded File Reversion Successfully!', noBackdrop: true, duration: 2000 })
                $scope.closeModal();
            }, function(err) {
                console.log(err);
                $ionicLoading.hide();
            });
        };
    })
    
});