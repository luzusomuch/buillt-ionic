angular.module('buiiltApp')
.controller('ThreadDetailCtrl', function($ionicLoading, $q, $rootScope, socket, $timeout, $scope, $state, $ionicModal, messageService, notificationService, authService, $stateParams, activityService, peopleService) {
    messageService.get({id:$stateParams.threadId}).$promise.then(function(thread) {
        var originalThread = angular.copy(thread);
        $scope.thread = thread;
        $scope.thread.selectedEvent = thread.event;
        $scope.currentUser = authService.getCurrentUser();

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
            notificationService.markItemsAsRead({id: thread._id}).$promise.then();
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
            var prom = [peopleService.getInvitePeople({id: thread.project}).$promise, activityService.me({id: thread.project}).$promise];
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

                $scope.modalEditThread.show();
            });
        };

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
                    modalEditThread.hide();
                    $ionicLoading.show({ template: 'Thread Updated!', noBackdrop: true, duration: 2000 });
                }, function(err) {
                    $ionicLoading.show({ template: 'Error!', noBackdrop: true, duration: 2000 });
                });
            }
        };
    });
});