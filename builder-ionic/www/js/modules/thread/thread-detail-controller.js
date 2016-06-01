angular.module('buiiltApp')
.controller('ThreadDetailCtrl', function($ionicScrollDelegate, currentTeam, currentUser, $ionicLoading, $q, $rootScope, socket, $timeout, $scope, $state, $ionicModal, messageService, notificationService, authService, $stateParams, activityService, peopleService, taskService, uploadService, contactBookService) {
    messageService.get({id:$stateParams.threadId}).$promise.then(function(thread) {
        var originalThread = angular.copy(thread);
        $scope.thread = thread;
        $scope.thread.selectedEvent = thread.event;
        $scope.currentUser = currentUser;

        $scope.step=1;
        $scope.next = function(type) {
            console.log(type);
            if (type==="file") {
                if ($scope.step==1 && (!$scope.file.name || $scope.file.name.trim().length==0 || !$scope.file.selectedTag)) {
                    $ionicLoading.show({ template: 'Check your inputs...', noBackdrop: true, duration: 2000 });
                } else {
                    $scope.step +=1;
                }
            } else if (type==="task") {
                if ($scope.step==1 && (!$scope.task.description || $scope.task.description.trim().length ===0)) {
                    $ionicLoading.show({ template: 'Check your inputs...', noBackdrop: true, duration: 2000 });
                } else {
                    $scope.step+=1;
                }
            }
        };

        // Setting new related task
        $scope.task = {
            selectedEvent: $scope.thread.event,
            dateStart: new Date(),
            dateEnd: new Date(moment().add(1, "hours")),
            time: {},
            belongToType: "thread",
            belongTo: $scope.thread._id,
            type: "task-project"
        };

        $ionicModal.fromTemplateUrl('modalCreateRelatedTask.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $scope.modalCreateRelatedTask = modal;
        });

        $ionicScrollDelegate.scrollBottom();

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
                    $ionicLoading.show({ template: 'Check your inputs...', noBackdrop: true, duration: 2000 });
                } else {
                    $scope.task.time.start = $scope.task.dateStart;
                    $scope.task.time.end = $scope.task.dateEnd;
                    $scope.task.members = $scope.thread.members;
                    _.each($scope.thread.notMembers, function(email) {
                        $scope.task.members.push({email: email});
                    });
                    taskService.create({id: thread.project}, $scope.task).$promise.then(function(res) {
                        $scope.modalCreateRelatedTask.hide();
                        $ionicLoading.show({ template: 'Task Added!', noBackdrop: true, duration: 2000 });
                        $scope.task = {
                            selectedEvent: $scope.thread.event,
                            dateStart: new Date(),
                            dateEnd: new Date(),
                            time: {},
                            belongToType: "thread",
                            belongTo: $scope.thread._id,
                            type: "task-project"
                        };
                        $state.go("taskDetail", {taskId: res._id});
                    }, function(err) {
                        $ionicLoading.show({ template: "There was an error...", noBackdrop: true, duration: 2000 });
                    });
                }
            } else {
                $ionicLoading.show({ template: 'Check your inputs...', noBackdrop: true, duration: 2000 });
            }
        };

        socket.on("relatedItem:new", function(data) {
            if (data.belongTo.toString()===thread._id.toString()) {
                $scope.thread.relatedItem.push({type: data.type, item: data.data});
                $scope.thread.activities.push({
                    user: {_id: data.excuteUser._id, name: data.excuteUser.name, email: data.excuteUser.email},
                    type: "related-"+data.type,
                    element: {item: data.data._id, path: (data.data.path) ? data.data.path : null, name: (data.data.name) ? data.data.name : data.data.description, related: true}
                });
            }
        });
        // End related task setting

        // Create related file 
        $ionicModal.fromTemplateUrl('modalCreateRelatedFile.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $scope.modalCreateRelatedFile = modal;
        });

        $scope.tags = [];
        if (currentTeam) {
            _.each(currentTeam.fileTags, function(tag) {
                $scope.tags.push({name: tag, select: false});
            });
        }

        $scope.file = {
            belongTo: thread._id,
            belongToType: "thread",
            type: "file",
            selectedEvent: $scope.thread.event
        };

        $scope.getFileUpload = function() {
            $ionicLoading.show();
            var input = document.getElementById("read-input");
            filepicker.store(
                input,
                function(Blob) {
                    console.log(Blob);
                    $scope.file.file = Blob;
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

        $scope.createRelatedFile = function(form) {
            if (form.$valid) {
                $scope.file.members = $scope.thread.members;
                _.each($scope.thread.notMembers, function(email) {
                    $scope.file.members.push({email: email});
                });
                if (!$scope.file.file) {
                    return $ionicLoading.show({ template: 'Check your inputs...', noBackdrop: true, duration: 2000 });
                } else {
                    uploadService.upload({id: thread.project}, $scope.file).$promise.then(function(res) {
                        $scope.modalCreateRelatedFile.hide();
                        $ionicLoading.show({ template: 'File Added!', noBackdrop: true, duration: 2000 });
                        $scope.file = {
                            belongTo: thread._id,
                            belongToType: "thread",
                            type: "file",
                            selectedEvent: $scope.thread.event
                        };
                        $state.go("fileDetail", {fileId: res._id});
                        $scope.step = 1;
                    }, function(err){
                        $ionicLoading.show({ template: 'There was an error...', noBackdrop: true, duration: 2000 });
                    });
                }
            } else {
                $ionicLoading.show({ template: 'Check your inputs...', noBackdrop: true, duration: 2000 });
            }
        };
        // end create related file

        $scope.message = {};

        socket.emit("join", thread._id);

        socket.on("thread:update", function(data) {
            if (_.findIndex(data.members, function(member) {
                return member._id.toString()===$scope.currentUser._id.toString();
            })===-1) {
                data.members.push($scope.currentUser);
            }
            originalThread = angular.copy(data);
            $scope.thread = data;
            $scope.thread.selectedEvent = data.event;
            $scope.task.selectedEvent = data.event;
            $scope.file.selectedEvent = data.event;
            if ($stateParams.threadId.toString()===data._id.toString()) {
                $ionicScrollDelegate.scrollBottom();
                notificationService.markItemsAsRead({id: thread._id}).$promise.then();
            }
        });

        $timeout(function() {
            // remove thread count number for current thread
            $rootScope.$emit("UpdateDashboardThreadCount", $scope.thread);

            // update the last access to current thread
            messageService.lastAccess({id: thread._id}).$promise.then(function(res) {
                $scope.thread.updatedAt = new Date();
                $rootScope.$emit("UpdateDashboardThreadLastAccess", $scope.thread);
            });
            
            // mark all notifications related to this thread is read
            notificationService.markItemsAsRead({id: thread._id}).$promise;
        }, 500);

        $scope.sendMessage = function() {
            if ($scope.message.text && $scope.message.text.trim() != '') {
                messageService.sendMessage({id: $scope.thread._id, type: $scope.thread.type}, $scope.message).$promise
                .then(function (res) {
                    $scope.message.text = null;
                    $scope.thread = res;
                    //Track Reply Sent
                    mixpanel.identify($scope.currentUser._id);
                    mixpanel.track("Reply Sent From Mobile");

                    var element = document.getElementById("textarea1");
                    element.style.height =  "auto";
                });
            }
        };

        $scope.expandText = function() {
            var element = document.getElementById("textarea1");
            element.style.height =  element.scrollHeight + "px";
        };

        $scope.chooseMember = function(index) {
            $scope.membersList[index].select = !$scope.membersList[index].select;
        };

        $ionicModal.fromTemplateUrl('modalEditThread.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $scope.modalEditThread = modal;
        });

        $scope.showModalEditThread = function() {
            $scope.membersList = [];
            var prom = [
                peopleService.getInvitePeople({id: thread.project}).$promise, 
                activityService.me({id: thread.project}).$promise,
                contactBookService.me().$promise
            ];
            $q.all(prom).then(function(res) {
                var people = res[0];
                $scope.events = res[1];

                // Get available project member that can add to thread
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
                _.each($scope.thread.members, function(member) {
                    _.remove($scope.membersList, {_id: member._id});
                });
                _.each($scope.thread.notMembers, function(email) {
                    _.remove($scope.membersList, {email: email});
                })
                // remove current user from the members list
                _.remove($scope.membersList, {_id: $scope.currentUser._id});

                _.each($scope.membersList, function(member) {
                    if (!member._id) {
                        var index = _.findIndex(res[2], function(contact){
                            return member.email===contact.email;
                        });
                        if (index !== -1) {
                            member.name = res[2][index].name;
                        }
                    }
                });

                $scope.modalEditThread.show();
            });
        };

        // if ($rootScope.isCreateNewThread) {
        //     $scope.showModalEditThread();
        //     $rootScope.isCreateNewThread = false;
        // }

        $scope.editThread = function(form) {
            var prom = [];
            $scope.thread.newMembers = _.filter($scope.membersList, {select : true});
            if ($scope.thread.name.length!==originalThread.name.length && $scope.thread.name.trim().length > 0) {
                $scope.thread.elementType="edit-thread";
                prom.push(messageService.update({id: $scope.thread._id}, $scope.thread).$promise);
            }
            if ($scope.thread.newMembers.length > 0) {
                $scope.thread.elementType="assign";
                prom.push(messageService.update({id: $scope.thread._id}, $scope.thread).$promise);
            }
            if (!originalThread.event && $scope.thread.selectedEvent) {
                $scope.thread.elementType="add-event";
                prom.push(messageService.update({id: $scope.thread._id}, $scope.thread).$promise);
            } else if (originalThread.event!==$scope.thread.selectedEvent) {
                $scope.thread.elementType="change-event";
                prom.push(messageService.update({id: $scope.thread._id}, $scope.thread).$promise);
            }
            if (prom.length > 0) {
                $q.all(prom).then(function(res) {
                    $scope.modalEditThread.hide();
                    $ionicLoading.show({ template: 'Message Updated!', noBackdrop: true, duration: 2000 });
                }, function(err) {
                    $ionicLoading.show({ template: 'There was an error...', noBackdrop: true, duration: 2000 });
                });
            }
        };
    });
});