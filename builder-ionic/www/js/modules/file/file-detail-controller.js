angular.module("buiiltApp").controller("FileDetailCtrl", function($q, $ionicModal, $scope, $rootScope, $timeout, $ionicPopover, $ionicLoading, $stateParams, socket, notificationService, uploadService, fileService, authService, activityService, peopleService) {
    fileService.get({id: $stateParams.fileId}).$promise.then(function(file) {
        socket.emit("join", file._id);
        socket.on("file:update", function(data) {
            originalFile = data;
            $scope.file = data;
            $scope.file.selectedEvent = data.event;
            $scope.file.selectedTag = (data.tags.length > 0) ? data.tags[0] : null;
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

        var originalFile = file;
        $scope.file = file;
        $scope.file.selectedEvent = file.event;
        $scope.file.selectedTag = (file.tags.length > 0) ? file.tags[0] : null;
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

        $ionicModal.fromTemplateUrl('modalEditFile.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $scope.modalEditFile = modal;
        });

        $scope.showModalEditFile = function() {
            $scope.membersList = [];
            $scope.tags = [];
            var prom = [peopleService.getInvitePeople({id: file.project}).$promise, activityService.me({id: file.project}).$promise, authService.getCurrentTeam().$promise];
            $q.all(prom).then(function(res) {
                var people = res[0];
                $scope.events = res[1];
                var currentTeam = res[2];
                // Get all file tags
                _.each(currentTeam.fileTags, function(tag) {
                    $scope.tags.push({name: tag, select: false});
                });
                // Get available project member that can add to file
                _.each($rootScope.roles, function(role) {
                    _.each(people[role], function(tender){
                        if (tender.hasSelect) {
                            var isLeader = (_.findIndex(tender.tenderers, function(tenderer) {
                                if (tenderer._id) {
                                    return tenderer._id._id.toString() === $scope.currentUser._id.toString();
                                }
                            }) !== -1) ? true : false;
                            if (!isLeader) {
                                _.each(tender.tenderers, function(tenderer) {
                                    var memberIndex = _.findIndex(tenderer.teamMember, function(member) {
                                        return member._id.toString() === $scope.currentUser._id.toString();
                                    });
                                    if (memberIndex !== -1) {
                                        _.each(tenderer.teamMember, function(member) {
                                            member.select = false;
                                            $scope.membersList.push(member);
                                        });
                                    }
                                });
                                if (tender.tenderers[0]._id) {
                                    tender.tenderers[0]._id.select = false;
                                    $scope.membersList.push(tender.tenderers[0]._id);
                                } else {
                                    $scope.membersList.push({email: tender.tenderers[0].email, select: false});
                                }
                            } else {
                                _.each(tender.tenderers, function(tenderer) {
                                    if (tenderer._id._id.toString() === $scope.currentUser._id.toString()) {
                                        _.each(tenderer.teamMember, function(member) {
                                            member.select = false;
                                            $scope.membersList.push(member);
                                        });
                                    }
                                });
                            }
                        }
                    });
                });
                // filter out members who has invited
                _.each($scope.file.members, function(member) {
                    _.remove($scope.membersList, {_id: member._id});
                });
                _.each($scope.file.notMembers, function(email) {
                    _.remove($scope.membersList, {email: email});
                })
                // remove current user from the members list
                _.remove($scope.membersList, {_id: $scope.currentUser._id});

                $scope.modalEditFile.show();
            });
        };

        $scope.editFile = function() {
            var prom = [];
            $scope.file.newMembers = _.filter($scope.membersList , {select: true});
            if ($scope.file.name.length!==originalFile.name.length && $scope.file.name.trim().length > 0) {
                $scope.file.editType="edit";
                prom.push(fileService.update({id: $scope.file._id}, $scope.file).$promise);
            }
            if ($scope.file.newMembers.length > 0) {
                $scope.file.editType="assign";
                prom.push(fileService.update({id: $scope.file._id}, $scope.file).$promise);
            }
            if (!originalFile.event && $scope.file.selectedEvent) {
                $scope.file.editType="add-event";
                prom.push(fileService.update({id: $scope.file._id}, $scope.file).$promise);
            } else if (originalFile.event!==$scope.file.selectedEvent) {
                $scope.file.editType="change-event";
                prom.push(fileService.update({id: $scope.file._id}, $scope.file).$promise);
            }
            if ($scope.file.selectedTag && $scope.file.selectedTag !== originalFile.tags[0]) {
                $scope.file.editType="edit";
                prom.push(fileService.update({id: $scope.file._id}, $scope.file).$promise);
            }
            if (prom.length > 0) {
                $q.all(prom).then(function(res) {
                    $scope.modalEditFile.hide();
                    $ionicLoading.show({ template: 'File Updated!', noBackdrop: true, duration: 2000 });
                }, function(err) {
                    $ionicLoading.show({ template: 'Error!', noBackdrop: true, duration: 2000 });
                });
            }
        };
    });
});