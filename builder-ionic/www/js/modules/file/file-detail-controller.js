angular.module("buiiltApp").controller("FileDetailCtrl", function($ionicScrollDelegate, $q, $ionicModal, $scope, $rootScope, $timeout, $ionicPopover, $ionicLoading, $stateParams, $state, socket, notificationService, uploadService, fileService, authService, activityService, peopleService, taskService, messageService, contactBookService) {
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
            if (file.__v > 0) 
                $rootScope.$emit("UpdateDashboardFileCount", $scope.file);
            $ionicScrollDelegate.scrollBottom();
            // mark all notifications related to this file is read
            notificationService.markItemsAsRead({id: file._id}).$promise;
        }, 500);

        function fileInitial(file) {
            $ionicScrollDelegate.scrollBottom();
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

        $scope.step=1;
        $scope.next = function() {
            if ($scope.step==1 && (!$scope.task.description || $scope.task.description.trim().length==0)) {
                $ionicLoading.show({ template: 'Check Your Data!', noBackdrop: true, duration: 2000 })
            } else {
                $scope.step += 1;
            }
        };

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
            var prom = [
                peopleService.getInvitePeople({id: file.project}).$promise, 
                activityService.me({id: file.project}).$promise, 
                authService.getCurrentTeam().$promise,
                contactBookService.me().$promise
            ];
            $q.all(prom).then(function(res) {
                var people = res[0];
                $scope.events = res[1];
                var currentTeam = res[2];
                var contactBooks = res[3];
                // Get all file tags
                if (currentTeam) {
                    _.each(currentTeam.fileTags, function(tag) {
                        $scope.tags.push({name: tag, select: false});
                    });
                }
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
                // get user name from contact books for non-user
                _.each($scope.membersList, function(member) {
                    if (!member._id) {
                        var index = _.findIndex(contactBooks, function(contact) {
                            return member.email===contact.email;
                        });
                        if (index !== -1) {
                            member.name = contactBooks[index].name;
                        }
                    }
                });

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

        // Setting new related task
        $scope.task = {
            selectedEvent: $scope.file.event,
            dateStart: new Date(),
            dateEnd: new Date(moment().add(1, "hours")),
            time: {},
            belongToType: "file",
            belongTo: $scope.file._id,
            type: "task-project"
        };

        $ionicModal.fromTemplateUrl('modalCreateRelatedTask.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $scope.modalCreateRelatedTask = modal;
        });

        $scope.callDateInput = function(type){
            if (type==="dateStart") {
                $scope.isShowInputStartDate = true;
                $("input#startdate").trigger('click');
            } else if (type==="dateEnd") {
                $scope.isShowInputEndDate = true;
                $("input#dateEnd").trigger('click');
            }
        };

        $scope.createRelatedTask = function(form) {
            if (form.$valid) {
                if (!$scope.task.dateStart || !$scope.task.dateEnd) {
                    $ionicLoading.show({ template: 'Please Check Your Input!', noBackdrop: true, duration: 2000 });
                } else {
                    $scope.task.time.start = $scope.task.dateStart;
                    $scope.task.time.end = $scope.task.dateEnd;
                    $scope.task.members = $scope.file.members;
                    _.each($scope.file.notMembers, function(email) {
                        $scope.task.members.push({email: email});
                    });
                    taskService.create({id: file.project}, $scope.task).$promise.then(function(res) {
                        $scope.modalCreateRelatedTask.hide();
                        $ionicLoading.show({ template: 'Create Related Task Successfully!', noBackdrop: true, duration: 2000 });
                        $scope.task = {
                            selectedEvent: $scope.file.event,
                            dateStart: new Date(),
                            dateEnd: new Date(),
                            time: {},
                            belongToType: "file",
                            belongTo: $scope.file._id,
                            type: "task-project"
                        };
                        $state.go("taskDetail", {taskId: res._id});
                        $scope.step=1;
                    }, function(err) {
                        $ionicLoading.show({ template: "Error", noBackdrop: true, duration: 2000 });
                    });
                }
            } else {
                $ionicLoading.show({ template: 'Please Check Your Input!', noBackdrop: true, duration: 2000 });
            }
        };

        socket.on("relatedItem:new", function(data) {
            if (data.belongTo.toString()===file._id.toString()) {
                $scope.file.relatedItem.push({type: data.type, item: data.data});
                $scope.file.activities.push({
                    user: {_id: data.excuteUser._id, name: data.excuteUser.name, email: data.excuteUser.email},
                    type: "related-"+data.type,
                    element: {item: data.data._id, name: (data.data.name) ? data.data.name : data.data.description, related: true}
                });
            }
        });
        // End related task setting

        // Start related thread setting
        $ionicModal.fromTemplateUrl('modalCreateRelatedThread.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $scope.modalCreateRelatedThread = modal;
        });

        $scope.thread = {
            selectedEvent: $scope.file.event,
            belongToType: "file",
            belongTo: file._id,
            type: "project-message"
        };

        $scope.createRelatedThread = function(form) {
            if (form.$valid) {
                $scope.thread.members = $scope.file.members;
                _.each($scope.file.notMembers, function(email) {
                    $scope.thread.members.push({email: email});
                });
                messageService.create({id: file.project}, $scope.thread).$promise.then(function(res) {
                    $scope.modalCreateRelatedThread.hide();
                    $ionicLoading.show({ template: 'Create Related Thread Successfully!', noBackdrop: true, duration: 2000 });
                    $scope.thread = {
                        selectedEvent: $scope.file.event,
                        belongToType: "file",
                        belongTo: file._id,
                        type: "project-message"
                    };
                    $state.go("threadDetail", {threadId: res._id});
                }, function(err) {
                    $ionicLoading.show({ template: 'Error!', noBackdrop: true, duration: 2000 });
                });
            } else {
                $ionicLoading.show({ template: 'Please Check Your Input!', noBackdrop: true, duration: 2000 });
            }
        };
        // End related thread setting
    });
});