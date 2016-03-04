angular.module('buiiltApp')
    .controller('DashboardCtrl', function($ionicLoading, team, currentUser, peopleService, notificationService, projectService,fileService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, $ionicPopover, taskService, messageService, totalNotifications, socket) {
    $scope.error = {};
    $scope.currentTeam = team;
    $scope.currentUser = currentUser;
    $scope.projects = [];
    _.each($scope.currentUser.projects, function(project) {
        if (project.status!=="archive") {
            $scope.projects.push(project);
        }
    });

    $rootScope.$on('notification:read',function(event,notification) {
        _.remove($scope.totalNotifications,{_id : notification._id});
        $scope.totalNotifications--;
    });

    notificationService.get().$promise
    .then(function(res) {
        if (res.length > 0) {
            $scope.totalNotifications = res;
        }
    });

    //start recieve socket from server
    socket.emit("join", $scope.currentUser._id);

    socket.on("thread:new", function(data) {
        $scope.threads.push(data);
        $scope.threads = _.uniq($scope.threads, "_id");
    });

    socket.on("file:new", function(data) {
        $scope.files.push(data);
    });

    socket.on("document:new", function(data) {
        $scope.documents.push(data);
    });

    socket.on("task:new", function(data) {
        $scope.tasks.push(data);
        $scope.tasks = _.uniq($scope.tasks, "_id");
    });
    //end recieve socket from server

    $scope.currentTab = 'thread';
    $scope.selectTabWithIndex = function(value){
        $ionicTabsDelegate.select(value);
        if (value == 0) {
            $scope.currentTab = 'thread';
        } else if (value == 1) {
            $scope.currentTab = 'task';
        } else if (value == 2) {
            $scope.currentTab = 'file';
        } else {
            $scope.currentTab = 'document';
        }
    };

    function findAllByProject(project) {
        $ionicLoading.show();
        fileService.getProjectFiles({id: project._id, type: "file"}).$promise.then(function(res) {
            $scope.files = res;
        });
        fileService.getProjectFiles({id: project._id, type: "document"}).$promise.then(function(res) {
            $scope.documents = res;
        });
        taskService.getProjectTask({id : project._id}).$promise.then(function(tasks) {
            $scope.tasks = tasks;
            var dueToday = new Date();
            var dueTomorrow = new Date();
            dueTomorrow.setDate(dueTomorrow.getDate() +1); 
            _.each($scope.tasks, function(task) {
                var endDate = new Date(task.dateEnd);
                task.dueDateToday = (endDate.setHours(0,0,0,0) == dueToday.setHours(0,0,0,0)) ? true : false;
                if (dueTomorrow.setHours(0,0,0,0) == endDate.setHours(0,0,0,0)) {
                    task.dueDateTomorrow = true;
                }
                else {
                    task.dueDateTomorrow = false;
                }
            });
        });
        messageService.getProjectThread({id : project._id}).$promise.then(function(threads) {
            $scope.threads = threads;
        });
        $ionicLoading.hide();
    };

    $scope.headingName = "Project";

    $scope.selectProject = function(project) {
		$scope.projectPopover.hide();
        $scope.headingName = " ";
        $rootScope.selectedProject = project;
        findAllByProject(project);
        $scope.modalProject.hide();
        $rootScope.$broadcast('getProject', project._id);
		$scope.projectPopover.remove();
    };

    if ($rootScope.selectedProject) {
        $scope.headingName = " ";
        $scope.selectedProject = $rootScope.selectedProject;
        findAllByProject($rootScope.selectedProject);
        $rootScope.$broadcast('getProject', $rootScope.selectedProject._id);
    }

    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };
	
	$ionicPopover.fromTemplateUrl('projectPopover.html', {
	    scope: $scope
	  }).then(function(popover) {
	    $scope.projectPopover = popover;
	});

    $scope.chooseProject = function($event){
		$scope.projectPopover.show($event);
    };

    $scope.openCreateThreadOrTaskModal = function() {
        if ($rootScope.selectedProject) {
            peopleService.getInvitePeople({id: $rootScope.selectedProject._id}).$promise.then(function(people) {
                $scope.projectMembers = [];
                _.each($rootScope.roles, function(role) {
                    _.each(people[role], function(tender){
                        if (tender.hasSelect) {
                            var isLeader = (_.findIndex(tender.tenderers, function(tenderer) {
                                if (tenderer._id) {
                                    return tenderer._id._id.toString() === $rootScope.currentUser._id.toString();
                                }
                            }) !== -1) ? true : false;
                            if (!isLeader) {
                                _.each(tender.tenderers, function(tenderer) {
                                    var memberIndex = _.findIndex(tenderer.teamMember, function(member) {
                                        return member._id.toString() === $rootScope.currentUser._id.toString();
                                    });
                                    if (memberIndex !== -1) {
                                        _.each(tenderer.teamMember, function(member) {
                                            member.select = false;
                                            $scope.projectMembers.push(member);
                                        });
                                    }
                                });
                                if (tender.tenderers[0]._id) {
                                    tender.tenderers[0]._id.select = false;
                                    $scope.projectMembers.push(tender.tenderers[0]._id);
                                } else {
                                    $scope.projectMembers.push({email: tender.tenderers[0].email, select: false});
                                }
                            } else {
                                $scope.projectMembers.push(tender.tenderers[0]._id);
                                _.each(tender.tenderers, function(tenderer) {
                                    if (tenderer._id._id.toString() === $rootScope.currentUser._id.toString()) {
                                        _.each(tenderer.teamMember, function(member) {
                                            member.select = false;
                                            $scope.projectMembers.push(member);
                                        });
                                    }
                                });
                            }
                        }
                    });
                });
                if ($scope.currentTab==="thread") {
                    $scope.modalCreateThread.show();
                } else if ($scope.currentTab==="task") {
                    $scope.modalCreateTask.show();
                }
            });
        }
        if ($scope.currentTab==="thread") {
            $scope.modalCreateThread.show();
        } else if ($scope.currentTab==="task") {
            $scope.modalCreateTask.show();
        }
    };

    //create new task
    $ionicModal.fromTemplateUrl('modalCreateTask.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalCreateTask = modal;
    });

    $scope.isShowInputDate = false;
    $scope.callDateInput = function(){
        $scope.isShowInputDate = true;
        $("input#dueDate").trigger('click');
    };

    $scope.$on('taskAvaiableAssignees', function(event, value){
        $scope.available = value;
    });

    $scope.task = {
        members : []
    };

    $scope.assign = function(member, index, type) {
        member.isSelect = !member.isSelect;
        var memberIndex = _.findIndex($scope[type].members, function(item) {
            if (member._id && item._id) {
                return item._id.toString()===member._id.toString();
            } else {
                return item.email===member.email;
            }
        });
        if (memberIndex===-1) {
            $scope[type].members.push(member);
        } else {
            $scope[type].members.splice(memberIndex, 1);
        }
    };

    $scope.submitted = false;
    $scope.createNewTask = function(form) {
        $scope.submitted = true;
        if (form.$valid) {
            if ($scope.task.members.length===0) {
                $scope.error.task="Please Select At Least 1 Member";
                return;
            } else if (!$scope.task.dateEnd) {
                $scope.error.task="Please Select Due Date";
                return;
            }
            $scope.task.type = "task-project";
            taskService.create({id : $rootScope.selectedProject._id},$scope.task)
            .$promise.then(function(res) {
                $scope.modalCreateTask.hide();
                $scope.task = {members:[]};
                $scope.error = {};
                $scope.submitted = false;
                $scope.tasks.push(res);
            }, function(err) {
                $scope.error.task = "Somethings went wrong";
            });
        } else {
            $scope.error.task = "Please provide a description, due date and at least one assignee..";
        }
    };

    //create new thread
    $ionicModal.fromTemplateUrl('modalCreateThread.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalCreateThread = modal;
    });

    $scope.thread = {
        members : []
    };

    $scope.createNewThread = function(form) {
        $scope.submitted = true;
        if (form.$valid && $scope.submitted) {
            if ($scope.thread.members.length === 0) {
                $scope.error.thread = "Please Select At Least 1 Members";
                return;
            } else {
                $scope.thread.type = "project-message";
                messageService.create({id: $rootScope.selectedProject._id}, $scope.thread)
                .$promise.then(function (res) {
                    $scope.modalCreateThread.hide();
                    $scope.submitted = false;
                    $scope.thread = {members: []};
                    $scope.error = {};
                    $scope.threads.push(res);
                }, function(err) {
                    $scope.error.thread = "Error When Create";
                });
            }
        } else {
            $scope.error.thread = "Please provide a name and at least one recipient..";
        }
    };

    //show config
    $ionicModal.fromTemplateUrl('modalConfig.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalConfig = modal;
    });

    $scope.openNotificationModal = function() {
        $scope.modalNotification.show();
    };

    $ionicModal.fromTemplateUrl('modalNotification.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $rootScope.modalNotification = $scope.modalNotification = modal;
    });

    //function hide modal
    $scope.closeModal = function(value) {
        switch(value) {
            case 'Project':
            $scope.modalProject.hide();
            break;

            case 'CreateTask':
            $scope.modalCreateTask.hide();
            break;

            case 'CreateThread':
            $scope.modalCreateThread.hide();
            break;

            case 'Config':
            $scope.modalConfig.hide();
            break;

            case 'notification':
            $scope.modalNotification.hide();

            default:
            break;
        }
    };
});
