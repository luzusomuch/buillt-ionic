angular.module('buiiltApp')
    .controller('DashboardCtrl', function($q, $ionicLoading, team, peopleService, notificationService, projectService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, $ionicPopover, taskService, messageService, totalNotifications, socket, $ionicPopup, teamService, documentService, fileService) {
    $scope.error = {};
    $scope.currentTeam = team;
    $scope.currentUser = $rootScope.currentUser;
    $scope.projects = [];
    $scope.submitted = false;
    _.each($scope.currentUser.projects, function(project) {
        if (project.status!=="archive") {
            $scope.projects.push(project);
        }
    });

    // convert last access of current user to thread to show it first
    function getThreadsLastAccess(threads) {
        _.each(threads, function(thread) {
            if (thread.lastAccess&&thread.lastAccess.length>0) {
                var accessIndex = _.findIndex(thread.lastAccess, function(access) {
                    return access.user.toString()===$scope.currentUser._id.toString();
                });
                if (accessIndex !==-1) {
                    thread.updatedAt = new Date(thread.lastAccess[accessIndex].time);
                }
            }
        });
        threads.sort(function(a,b) {
            if (a.updatedAt < b.updatedAt) {
                return 1;
            } 
            if (a.updatedAt > b.updatedAt) {
                return -1;
            }
            return 0;
        });
    };
    /*Get last access of current user in files list to show recently first*/
    function getFilesLastAccess(files) {
        _.each(files, function(file) {
            if (file.lastAccess&&file.lastAccess.length>0) {
                var accessIndex = _.findIndex(file.lastAccess, function(access) {
                    return access.user.toString()===$scope.currentUser._id.toString();
                });
                if (accessIndex !==-1) {
                    file.createdAt = file.lastAccess[accessIndex].time;
                }
            }
        });
        files.sort(function(a,b) {
            if (a.createdAt < b.createdAt) {
                return 1;
            }
            if (a.createdAt > b.createdAt) {
                return -1;
            }
            return 0;
        });
    };

    // convert task date end to tomorrow, today, yesterday text
    function filterAndSortTaskDueDate(tasks) {
        angular.forEach(tasks, function(task) {
            var taskDueDate = moment(task.dateEnd).format("YYYY-MM-DD");
            if (task.dateEnd) {
                if (moment(taskDueDate).isSame(moment().format("YYYY-MM-DD"))) {
                    task.dueDate = "Today";
                } else if (moment(taskDueDate).isSame(moment().add(1, "days").format("YYYY-MM-DD"))) {
                    task.dueDate = "Tomorrow";
                } else if (moment(taskDueDate).isSame(moment().subtract(1, "days").format("YYYY-MM-DD"))) {
                    task.dueDate = "Yesterday";
                }
            }
        });
        tasks.sort(function(a,b) {
            if (a.dateEnd < b.dateEnd) {
                return -1;
            } 
            if (a.dateEnd > b.dateEnd) {
                return 1;
            }
            return 0;
        });
    };

    function documentSetInitial() {
        /*Check to allow added document set 1*/
        var allowAddedSet1 = true;
        _.each($scope.documentSets, function(documentSet) {
            if (documentSet.name==="Set 1" && documentSet.notAllowEditOrCopy) {
                allowAddedSet1 = false;
                return false;
            }
        });
        if (allowAddedSet1) 
            $scope.documentSets.push({name: "Set 1", documents: [], notAllowEditOrCopy: true});

        /*Add documents to document set 1 which haven't belong to any document set */
        _.each($scope.documents, function(document) {
            if (!document.documentSet) {
                document.project = (document.project._id) ? document.project._id : document.project;
                $scope.documentSets[$scope.documentSets.length -1].documents.push(document);
            }
        });
    }

    // get thread with notifications and task with notifications
    function getThreadAndTaskWithNotification() {
        var notificationThreads = _.filter($scope.threads, function(thread) {
            return thread.__v > 0;
        });
        var notificationTasks = _.filter($scope.tasks, function(task) {
            return task.__v > 0;
        }); 
        return notificationTasks.length + notificationThreads.length;
    };

    //start recieve socket from server
    socket.emit("join", $scope.currentUser._id);

    socket.on("thread:new", function(data) {
        if (data.owner._id!==$rootScope.currentUser._id) {
            $scope.threads.push(data);
            var index = getItemIndex($scope.projects, data.project._id);
            if (index !== -1) {
                $scope.projects[projectIndex].__v = getThreadAndTaskWithNotification();
            }
        }
        $scope.threads = _.uniq($scope.threads, "_id");
    });

    socket.on("task:new", function(data) {
        if (data.owner._id!==$scope.currentUser._id) {
            $scope.tasks.push(data);
            var index = getItemIndex($scope.projects, data.project._id);
            if (index !== -1) {
                $scope.projects[projectIndex].__v = getThreadAndTaskWithNotification();
            }
        }
        $scope.tasks = _.uniq($scope.tasks, "_id");
        filterAndSortTaskDueDate($scope.tasks);
    });

    socket.on("file:new", function(data) {

    });

    socket.on("dashboard:new", function(data) {
        if (data.type==="task") {
            var index = getItemIndex($scope.tasks, data.task._id);
            if (index !== -1 && data.user._id.toString()!== $scope.currentUser._id.toString() && $scope.tasks[index].uniqId != data.uniqId) {
                var originalTask = angular.copy($scope.tasks[index]);
                var projectIndex = getItemIndex($scope.projects, data.task.project._id);
                $scope.tasks[index].uniqId = data.uniqId;
                $scope.tasks[index].__v += 1;
                if (projectIndex !== -1 && originalTask.__v === 0) {
                    $scope.projects[projectIndex].__v = getThreadAndTaskWithNotification();
                }
            } 
        } else if (data.type==="thread") {
            var index = getItemIndex($scope.threads, data.thread._id);
            if (index !== -1 && data.user._id.toString()!== $scope.currentUser._id.toString() && $scope.threads[index].uniqId != data.uniqId) {
                var originalThread = angular.copy($scope.threads[index]);
                var projectIndex = getItemIndex($scope.projects, data.thread.project._id);
                $scope.threads[index].uniqId = data.uniqId;
                $scope.threads[index].__v += 1;
                if (projectIndex !== -1 && originalThread.__v === 0) {
                    $scope.projects[projectIndex].__v = getThreadAndTaskWithNotification();
                }
            } 
        }
    });

    socket.on("thread:archive", function(data) {
        var index = getItemIndex($scope.threads, data._id);
        if (index !== -1) {
            $scope.threads.splice(index, 1);
            var projectIndex = getItemIndex($scope.projects, data.project);
            if (projectIndex !== -1) {
                $scope.projects[projectIndex].__v = getThreadAndTaskWithNotification();
            }
        }
    });
    //end recieve socket from server

    // subtract count number
    $scope.$on("$destroy", function() {
        functionClearThreadCount();
        functionClearTaskCount();
        functionUpdateThreadLastAccess();
    });

    var functionUpdateThreadLastAccess = $rootScope.$on("UpdateDashboardThreadLastAccess", function(event, data) {
        var index = getItemIndex($scope.threads, data._id);
        if (index !== -1) {
            $scope.threads[index].updatedAt = data.updatedAt;
        }
    });

    var functionClearThreadCount = $rootScope.$on("UpdateDashboardThreadCount", function(event, data) {
        var index = getItemIndex($scope.threads, data._id);
        if (index !== -1) {
            $scope.threads[index].__v = 0;
            var projectIndex = getItemIndex($scope.projects, data.project);
            if (projectIndex !== -1 && data.__v > 0) {
                $scope.projects[projectIndex].__v = getThreadAndTaskWithNotification();
            }
        }
    });

    var functionClearTaskCount = $rootScope.$on("UpdateDashboardTaskCount", function(event, data) {
        var index = getItemIndex($scope.tasks, data._id);
        if (index !== -1) {
            $scope.tasks[index].__v = 0;
            var projectIndex = getItemIndex($scope.projects, data.project);
            if (projectIndex !== -1 && data.__v > 0) {
                $scope.projects[projectIndex].__v = getThreadAndTaskWithNotification();
            }
        }
    });

    function getItemIndex(array, item) {
        var index = _.findIndex(array, function(i) {
            if (item && i._id)
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
        } else if (value===2) {
            $scope.currentTab = "file"
        } else if (value===3) {
            $scope.currentTab = "document";
        }
    };

    function findAllByProject(project) {
        $ionicLoading.show();
        var prom = [
            taskService.getProjectTask({id: project._id}).$promise, 
            messageService.getProjectThread({id : project._id}).$promise,
            fileService.getProjectFiles({id: project._id, type: "file"}).$promise,
            documentService.me({id: project._id}).$promise,
            fileService.getProjectFiles({id: project._id, type: "document"}).$promise
        ];
        $q.all(prom).then(function(res) {
            $scope.tasks = res[0];
            $scope.threads = res[1];
            $scope.files = res[2];
            $scope.documentSets = res[3];
            $scope.documents = res[4];
            filterAndSortTaskDueDate($scope.tasks);
            documentSetInitial();
            getThreadsLastAccess($scope.threads);
            getFilesLastAccess($scope.files);
            $ionicLoading.hide();
        });
    };

    $scope.headingName = "Project";

    $scope.selectProject = function(project) {
		$scope.projectPopover.hide();
        $scope.headingName = " ";
        $rootScope.selectedProject = project;
        findAllByProject(project);
    };

    /*
    If receive a push notification related to project invite
    then the app will show that project as selected
    */
    var pushNotificationProject = window.localStorage.getItem("pushProject")
    if ($rootScope.selectedProject || pushNotificationProject) {
        $scope.headingName = " ";
        if ($rootScope.selectedProject) {
            $scope.selectedProject = $rootScope.selectedProject;
            findAllByProject($scope.selectedProject);
        } else if (pushNotificationProject) {
            projectService.get({id: pushNotificationProject}).$promise.then(function(res) {
                $scope.selectedProject = res;
                findAllByProject($scope.selectedProject);
                window.localStorage.removeItem('pushProject');
            });
        }
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
                                    if (tenderer._id._id.toString() === $scope.currentUser._id.toString()) {
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
                } else if ($scope.currentTab==="file") {
                    $scope.createNewFile()
                }
            });
        }
        if ($scope.currentTab==="thread") {
            $scope.modalCreateThread.show();
        } else if ($scope.currentTab==="task") {
            $scope.modalCreateTask.show();
        } else if ($scope.currentTab==="file") {
            $scope.createNewFile()
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
        $scope.submitted = true;
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
            $scope.submitted = false;
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
        $scope.submitted = true;
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
                $scope.submitted = false;
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

    $ionicModal.fromTemplateUrl('modalCreateTeam.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalCreateTeam = modal;

        if ($scope.currentTeam && !$scope.currentTeam._id) {
            $scope.modalCreateTeam.show();
        }
    });

    $scope.newTeam = {};

    $scope.selectTeamType = function(value) {
        var originalTeamName = angular.copy($scope.newTeam.name);
        $scope.newTeam.type = value;
        if (value==="homeOwner") {
            $scope.newTeam.name = $scope.currentUser.name;
        } else {
            $scope.newTeam.name = originalTeamName;
        }
    };

    $scope.createTeam = function() {
        if ($scope.newTeam.name && $scope.newTeam.type) {
            $scope.newTeam.isMobile = true;
            $scope.newTeam.emails = [];
            teamService.create($scope.newTeam, function (team) {
                $rootScope.currentTeam = $scope.currentTeam = team;
                $scope.modalCreateTeam.hide();
            }, function (err) {
                $scope.error.team = "Error When Create New Team";
            });
        } else {
            $scope.error.team = "Please check your input";
        }
    };

    $scope.createNewFile = function() {
        $ionicLoading.show();
        $scope.uploadFile = {
            members: [],
            tags: [],
            type: "file"
        };
        fileService.create({id: $scope.selectedProject._id}, $scope.uploadFile).$promise.then(function(res) {
            $ionicLoading.hide();
            $ionicLoading.show({ template: 'Create New File Successfully!', noBackdrop: true, duration: 2000 });
            $scope.files.push(res);
            $state.go("fileDetail", {fileId: res._id});
        }, function(err) {
            $ionicLoading.hide();
            dialogService.showToast("There Has Been An Error...");
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
