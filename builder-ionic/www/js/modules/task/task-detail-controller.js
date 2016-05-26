angular.module('buiiltApp')
.controller('TaskDetailCtrl', function($ionicScrollDelegate, $q, $rootScope, $ionicModal, $ionicLoading, $timeout, $scope, $stateParams, taskService, socket, notificationService, authService, activityService, peopleService, contactBookService) {
    taskService.get({id: $stateParams.taskId}).$promise.then(function(task) {
        var originalTask = angular.copy(task);
        $scope.task = task;
        $scope.task.dateStart = new Date($scope.task.dateStart);
        $scope.task.dateEnd = new Date($scope.task.dateEnd);
        $scope.task.time = {start: $scope.task.dateStart, end: $scope.task.dateEnd};
        $scope.currentUser = authService.getCurrentUser();

        socket.emit("join", task._id);
        socket.on("task:update", function(data) {
            originalTask = angular.copy(data);
            $scope.task = data;
            $ionicScrollDelegate.scrollBottom();
            notificationService.markItemsAsRead({id: task._id}).$promise.then();
        });

        $timeout(function() {
            // remove task count number for current task
            if (task.__v > 0) 
                $rootScope.$emit("UpdateDashboardTaskCount", $scope.task);
            
            $ionicScrollDelegate.scrollBottom();
            // mark all notifications related to this task is read
            notificationService.markItemsAsRead({id: task._id}).$promise;
        }, 500);

        $scope.complete = function(task) {
            $ionicLoading.show();
            task.completed = !task.completed;
            if (task.completed) {
                task.completedBy = $scope.currentUser._id;
                $scope.task.editType = "complete-task";
                task.completedAt = new Date();
            } else {
                task.completedBy = null;
                $scope.task.editType = "uncomplete-task";
                task.completedAt = null;
            }
            taskService.update({id : task._id},task).$promise
            .then(function(res) {
                $ionicLoading.hide();
            }, function(err) {
                $ionicLoading.hide();
            })
        };

        $scope.chooseMember = function(index) {
            $scope.membersList[index].select = !$scope.membersList[index].select;
        };

        $ionicModal.fromTemplateUrl('modalEditTask.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $scope.modalEditTask = modal;
        });

        $scope.showModalEditTask = function() {
            $scope.membersList = [];
            var prom = [
                peopleService.getInvitePeople({id: task.project}).$promise,
                contactBookService.me().$promise
            ];
            $q.all(prom).then(function(res) {
                var people = res[0];
                contactBooks = res[1];
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
                _.each($scope.task.members, function(member) {
                    _.remove($scope.membersList, {_id: member._id});
                });
                _.each($scope.task.notMembers, function(email) {
                    _.remove($scope.membersList, {email: email});
                })
                // remove current user from the members list
                _.remove($scope.membersList, {_id: $scope.currentUser._id});
                // Change email to name from contact books
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

                $scope.modalEditTask.show();
            });
        };

        $ionicModal.fromTemplateUrl('modalAddComment.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $scope.modalAddComment = modal;
        });

        $scope.editTask = function(form) {
            var prom = [];
            $scope.task.newMembers = _.filter($scope.membersList, {select: true});
            if (originalTask.description!==$scope.task.description && $scope.task.description.trim().length > 0) {
                $scope.task.editType="edit-task";
                prom.push(taskService.update({id: $scope.task._id}, $scope.task).$promise);
            } else {
                $ionicLoading.show({ template: 'Check Your Description!', noBackdrop: true, duration: 2000 });
            }

            if ($scope.task.newMembers.length > 0) {
                $scope.task.editType="assign";
                prom.push(taskService.update({id: $scope.task._id}, $scope.task).$promise);
            }

            $scope.task.time = {start: $scope.task.dateStart, end: $scope.task.dateEnd};
            if (new Date(originalTask.dateStart).getTime() !== $scope.task.dateStart.getTime() || new Date(originalTask.dateEnd).getTime() !== $scope.task.dateEnd.getTime()) {
                $scope.task.editType="change-date-time";
                prom.push(taskService.update({id: $scope.task._id}, $scope.task).$promise);
            }
            
            if (prom.length > 0) {
                $q.all(prom).then(function(res) {
                    $scope.modalEditTask.hide();
                    $ionicLoading.show({ template: 'Task Updated!', noBackdrop: true, duration: 2000 });
                }, function(err) {
                    $ionicLoading.show({ template: 'Error!', noBackdrop: true, duration: 2000 });
                });
            }
        };

        $scope.enterComment = function(comment) {
            if (comment && comment.trim().length > 0) {
                $scope.task.editType="enter-comment";
                $scope.task.comment = comment;
                taskService.update({id: $scope.task._id}, $scope.task).$promise.then(function(res) {
                    $scope.modalAddComment.hide();
                    $ionicLoading.show({ template: 'Add New Comment Successfully!', noBackdrop: true, duration: 2000 });
                    var element = document.getElementById("commentArea");
                    element.style.height =  "auto";
                    $scope.comment = null;
                }, function() {
                    $ionicLoading.show({ template: 'Error!', noBackdrop: true, duration: 2000 });
                });
            } else {
                $ionicLoading.show({ template: 'Check Your Comment Again!', noBackdrop: true, duration: 2000 });
            }
        };

        $scope.expandText = function() {
            var element = document.getElementById("commentArea");
            element.style.height =  element.scrollHeight + "px";
        };
    });
});