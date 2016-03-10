angular.module('buiiltApp')
    .controller('DashboardCtrl', function($ionicLoading, team, currentUser, peopleService, notificationService, projectService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, $ionicPopover, taskService, messageService, totalNotifications, socket, $ionicPopup) {
    $scope.error = {};
    $scope.currentTeam = team;
    $scope.currentUser = currentUser;
    $scope.projects = [];
    _.each($scope.currentUser.projects, function(project) {
        if (project.status!=="archive") {
            $scope.projects.push(project);
        }
    });

    //start recieve socket from server
    socket.emit("join", $scope.currentUser._id);

    socket.on("thread:new", function(data) {
        if (data.owner._id!==$rootScope.currentUser._id) {
            $scope.threads.push(data);
            var index = getItemIndex($scope.projects, data.project._id);
            if (index !== -1) {
                $scope.projects[index].__v += 1;
            }
        }
        $scope.threads = _.uniq($scope.threads, "_id");
    });

    socket.on("task:new", function(data) {
        if (data.owner._id!==$scope.currentUser._id) {
            $scope.tasks.push(data);
            var index = getItemIndex($scope.projects, data.project._id);
            if (index !== -1) {
                $scope.projects[index].__v += 1;
            }
        }
        $scope.tasks = _.uniq($scope.tasks, "_id");
    });

    socket.on("dashboard:new", function(data) {
        console.log(data);
        if (data.type==="task") {
            var index = getItemIndex($scope.tasks, data.task._id);
            if (index !== -1 && data.user._id.toString()!== $scope.currentUser._id.toString() && $scope.tasks[index].uniqId != data.uniqId) {
                var originalTask = angular.copy($scope.tasks[index]);
                var projectIndex = getItemIndex($scope.projects, data.task.project._id);
                if (projectIndex !== -1 && originalTask.__v === 0) {
                    $scope.projects[projectIndex].__v += 1;
                }
                $scope.tasks[index].uniqId = data.uniqId;
                $scope.tasks[index].__v += 1;
            } 
        } else if (data.type==="thread") {
            var index = getItemIndex($scope.threads, data.thread._id);
            if (index !== -1 && data.user._id.toString()!== $scope.currentUser._id.toString() && $scope.threads[index].uniqId != data.uniqId) {
                var originalThread = angular.copy($scope.threads[index]);
                var projectIndex = getItemIndex($scope.projects, data.thread.project._id);
                if (projectIndex !== -1 && originalThread.__v === 0) {
                    $scope.projects[projectIndex].__v += 1;
                }
                $scope.threads[index].uniqId = data.uniqId;
                $scope.threads[index].__v += 1;
            } 
        }
    });
    //end recieve socket from server

    // subtract count number
    $scope.$on("$destroy", function() {
        functionClearThreadCount();
    });

    var functionClearThreadCount = $rootScope.$on("UpdateDashboardThreadCount", function(event, data) {
        var index = getItemIndex($scope.threads, data._id);
        if (index !== -1) {
            $scope.threads[index].__v = 0;
            var projectIndex = getItemIndex($scope.projects, data.project);
            if (projectIndex !== -1 && data.__v > 0) {
                $scope.projects[index].__v -=1;
            }
        }
    });

    var functionClearTaskCount = $rootScope.$on("UpdateDashboardTaskCount", function(event, data) {
        var index = getItemIndex($scope.tasks, data._id);
        if (index !== -1) {
            $scope.tasks[index].__v = 0;
            var projectIndex = getItemIndex($scope.projects, data.project);
            if (projectIndex !== -1 && data.__v > 0) {
                $scope.projects[projectIndex].__v -=1;
            }
        }
    });

    function getItemIndex(array, item) {
        var index = _.findIndex(array, function(i) {
            return i._id.toString()===item.toString();
        });
        return index;
    };

    $scope.currentTab = 'thread';
    $scope.selectTabWithIndex = function(value){
        $ionicTabsDelegate.select(value);
        if (value == 0) {
            $scope.currentTab = 'thread';
        } else if (value == 1) {
            $scope.currentTab = 'task';
        }
    };

    function findAllByProject(project) {
        $ionicLoading.show();
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
    };

    if ($rootScope.selectedProject) {
        $scope.headingName = " ";
        $scope.selectedProject = $rootScope.selectedProject;
        findAllByProject($rootScope.selectedProject);
    }

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

    $scope.createNewTask = function() {
        if ($scope.task.members.length===0) {
            $scope.error.task="Please Select At Least 1 Member";
            return;
        } else if (!$scope.task.dateEnd) {
            $scope.error.task="Please Select Due Date";
            return;
        } else if ($scope.task.description.length === 0 || ($scope.task.description && $scope.task.description.trim()==="")) {
            $scope.error.task="Please check your task description";
            return;
        }
        $scope.task.type = "task-project";
        taskService.create({id : $rootScope.selectedProject._id},$scope.task)
        .$promise.then(function(res) {
            $scope.modalCreateTask.hide();
            $scope.task = {members:[]};
            $scope.error = {};
            $scope.tasks.push(res);
        }, function(err) {
            $scope.error.task = "Somethings went wrong";
        });
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
        if ($scope.thread.members.length === 0) {
            $scope.error.thread = "Please Select At Least 1 Members";
            return;
        } else {
            $scope.thread.type = "project-message";
            messageService.create({id: $rootScope.selectedProject._id}, $scope.thread)
            .$promise.then(function (res) {
                $scope.modalCreateThread.hide();
                $scope.thread = {members: []};
                $scope.error = {};
                $scope.threads.push(res);
            }, function(err) {
                $scope.error.thread = "Error When Create";
            });
        }
    };

    //show confirm modal
    $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: "Sign Out",
            content: "Do you want to sign out?"
        });
        confirmPopup.then(function(res) {
            if (res) {
                $state.go("signout");
            }
        });
    };


    //function hide modal
    $scope.closeModal = function(value) {
        switch(value) {
            case 'Project':
            $scope.projectPopover.hide();
            break;

            case 'CreateTask':
            $scope.modalCreateTask.hide();
            break;

            case 'CreateThread':
            $scope.modalCreateThread.hide();
            break;

            default:
            break;
        }
    };
});
