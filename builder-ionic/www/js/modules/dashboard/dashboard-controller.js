angular.module('buiiltApp')
    .controller('DashboardCtrl', function($ionicScrollDelegate, $q, $ionicLoading, currentUser, team, peopleService, notificationService, projectService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, $ionicPopover, taskService, messageService, socket, $ionicPopup, teamService, documentService, fileService, contactBookService, uploadService) {

    $scope.currentTeam = team;
    $scope.currentUser = currentUser;
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
            $scope.documentSets.push({_id: "set1-"+$rootScope.selectedProject._id, name: "Set 1", documents: [], notAllowEditOrCopy: true});

        /*Add documents to document set 1 which haven't belong to any document set */
        _.each($scope.documents, function(document) {
            if (!document.documentSet) {
                document.project = (document.project._id) ? document.project._id : document.project;
                $scope.documentSets[$scope.documentSets.length -1].documents.push(document);
            }
        });
    }

    // get thread with notifications and task with notifications
    function countTotalProjectNotifications() {
        var notificationThreads = _.filter($scope.threads, function(thread) {
            return thread.__v > 0;
        });
        var notificationTasks = _.filter($scope.tasks, function(task) {
            return task.__v > 0;
        }); 
        var notificationFiles = _.filter($scope.files, function(file) {
            return file.__v > 0;
        });
        var notificationDocuments = _.filter($scope.documentSets, function(doc) {
            return doc.__v > 0;
        });
        return notificationTasks.length + notificationThreads.length + notificationFiles.length + notificationDocuments.length;
    };

    //start recieve socket from server
    socket.emit("join", $scope.currentUser._id);

    socket.on("thread:new", function(data) {
        if ($rootScope.selectedProject && data.project._id==$rootScope.selectedProject._id) {
            data.__v = 1;
            if ($scope.threads) {
                $scope.threads.push(data);
            }
            var index = getItemIndex($scope.projects, data.project._id);
            if (index !== -1) {
                $scope.projects[index].__v +=1;
                $scope.projects[index].element.thread += 1;
            }
        }
    });

    socket.on("task:new", function(data) {
        if ($rootScope.selectedProject && data.project._id==$rootScope.selectedProject._id) {
            data.__v = 1;
            if ($scope.tasks) {
                $scope.tasks.push(data);
                filterAndSortTaskDueDate($scope.tasks);
            }
            var index = getItemIndex($scope.projects, data.project._id);
            if (index !== -1) {
                $scope.projects[index].__v +=1;
                $scope.projects[index].element.task +=1;
            }
        }
    });

    socket.on("file:new", function(data) {
        if ($rootScope.selectedProject && data.project._id==$rootScope.selectedProject._id) {
            data.__v = 1;
            if ($scope.files) {
                $scope.files.push(data);
            }
            var index = getItemIndex($scope.projects, data.project._id);
            if (index !== -1) {
                $scope.projects[index].__v +=1;
                $scope.projects[index].element.file +=1;
            }
        }
    });

    socket.on("dashboard:new", function(data) {
        if (data.type==="task") {
            var index = getItemIndex($scope.tasks, data.task._id);
            if (index !== -1 && data.user._id.toString()!== $scope.currentUser._id.toString() && $scope.tasks[index].uniqId != data.uniqId) {
                var projectIndex = getItemIndex($scope.projects, (data.task.project._id) ? data.task.project._id : data.task.project);
                $scope.tasks[index].uniqId = data.uniqId;
                if (projectIndex!==-1 && $scope.tasks[index].__v===0) {
                    $scope.projects[projectIndex].__v +=1;
                    $scope.projects[projectIndex].element.task +=1;
                }
                $scope.tasks[index].__v += 1;
            }
        } else if (data.type==="thread") {
            var index = getItemIndex($scope.threads, data.thread._id);
            var projectIndex = getItemIndex($scope.projects, data.thread.project._id);
            if (index !== -1 && data.user._id.toString()!== $scope.currentUser._id.toString() && $scope.threads[index].uniqId != data.uniqId) {
                $scope.threads[index].uniqId = data.uniqId;
                if (projectIndex !== -1 && $scope.threads[index].__v === 0) {
                    $scope.projects[projectIndex].__v +=1;
                    $scope.projects[projectIndex].element.thread +=1;
                }
                $scope.threads[index].__v += 1;
            } else if (index === -1 && projectIndex !== -1 && $rootScope.uniqId != data.uniqId) {
                $rootScope.uniqId = data.uniqId;
                data.thread.__v = 1;
                if ($scope.threads) {
                    $scope.threads.push(data.thread);
                }
                $scope.projects[projectIndex].__v +=1;
                $scope.projects[projectIndex].element.thread +=1;
            }
        } else if (data.type==="file") {
            var index = getItemIndex($scope.files, data.file._id);
            var projectIndex = getItemIndex($scope.projects, data.file.project._id);
            if (index !== -1 && data.user._id.toString()!==$scope.currentUser.toString()) {
                if (projectIndex!==-1 && $scope.files[index].__v===0) {
                    $scope.projects[projectIndex].__v +=1;
                    $scope.projects[projectIndex].element.file +=1;
                }
                $scope.files[index].__v+=1;
            } else if (index === -1 && projectIndex !== -1 && $rootScope.uniqId != data.uniqId) {
                data.file.__v = 1;
                $rootScope.uniqId = data.uniqId;
                if ($scope.files) {
                    $scope.files.push(data.file);
                }
                $scope.projects[projectIndex].__v +=1;
                $scope.projects[projectIndex].element.file +=1;
            }
        } else if (data.type==="document") {
            var index = getItemIndex($scope.documentSets, data.documentSet._id);
            var projectIndex = getItemIndex($scope.projects, data.file.project._id);
            if (index !== -1 && data.user._id.toString()!==$scope.currentUser.toString()) {
                $scope.documentSets[index].__v +=1;
                var fileIndex = _.findIndex($scope.documentSets[index].documents, function(doc) {
                    return doc._id.toString()===data.file._id.toString();
                });
                if (fileIndex!==-1) {
                    if ($scope.documentSets[index].documents[fileIndex].__v==0) {
                        $scope.projects[projectIndex].__v +=1;
                        $scope.projects[projectIndex].element.document +=1;    
                    }
                    $scope.documentSets[index].__v += 1;
                    $scope.documentSets[index].documents[fileIndex].__v+=1;
                } else if (fileIndex===-1) {
                    data.file.__v = 1;
                    if ($scope.documentSets) {
                        $scope.documentSets[index].documents.push(data.file);
                        $scope.documentSets[index].__v += 1;
                    }
                    $scope.projects[projectIndex].__v +=1;
                    $scope.projects[projectIndex].element.document +=1;
                }
            } else if (index === -1 && projectIndex !== -1 && $rootScope.uniqId != data.uniqId) {
                $rootScope.uniqId = data.uniqId;
                data.documentSet.__v = 1;
                data.file.__v = 1;
                data.documentSet.documents = [data.file];
                if ($scope.documentSets) {
                    $scope.documentSets.push(data.documentSet);
                }
                $scope.projects[projectIndex].__v +=1;
                $scope.projects[projectIndex].element.document +=1;
            }
        }
    });

    socket.on("thread:archive", function(data) {
        var index = getItemIndex($scope.threads, data._id);
        if (index !== -1) {
            $scope.threads.splice(index, 1);
            // var projectIndex = getItemIndex($scope.projects, data.project);
            // if (projectIndex !== -1) {
            //     $scope.projects[projectIndex].__v = getThreadAndTaskWithNotification();
            // }
        }
    });
    //end recieve socket from server

    // subtract count number
    $scope.$on("$destroy", function() {
        functionClearThreadCount();
        functionClearTaskCount();
        functionUpdateThreadLastAccess();
        functionClearFileCount();
        functionClearDocumentCount();
    });

    var functionUpdateThreadLastAccess = $rootScope.$on("UpdateDashboardThreadLastAccess", function(event, data) {
        var index = getItemIndex($scope.threads, data._id);
        if (index !== -1) {
            $scope.threads[index].updatedAt = data.updatedAt;
        }
    });

    function getItemIndex(array, item) {
        var index = _.findIndex(array, function(i) {
            if (item && i._id)
                return i._id.toString()===item.toString();
        });
        return index;
    };

    function updateItemCount(itemArr, item, type) {
        var index = getItemIndex(itemArr, item._id);
        if (index !== -1) {
            var projectIndex = getItemIndex($scope.projects, item.project);
            if (projectIndex !== -1 && itemArr[index].__v > 0) {
                if ($scope.projects[projectIndex].__v > 0) {
                    $scope.projects[projectIndex].__v -=1;
                    $scope.projects[projectIndex].element[type] -=1;
                }
            }
            itemArr[index].__v = 0;
        }
    };

    var functionClearThreadCount = $rootScope.$on("UpdateDashboardThreadCount", function(event, data) {
        updateItemCount($scope.threads, data, "thread");
    });

    var functionClearTaskCount = $rootScope.$on("UpdateDashboardTaskCount", function(event, data) {
        updateItemCount($scope.tasks, data, 'task');
    });

    var functionClearFileCount = $rootScope.$on("UpdateDashboardFileCount", function(event, data) {
        updateItemCount($scope.files, data, 'file');
    });

    var functionClearDocumentCount = $rootScope.$on("Document.Read", function(event, data) {
        var allowUpdate = false;
        var index;
        if (data.documentSet) {
            index = _.findIndex($scope.documentSets, function(set) {
                return set._id.toString()===data.documentSet.toString();
            });
            if (index !== -1) {
                allowUpdate = true;
            }
        } else {
            index = _.findIndex($scope.documentSets, function(set) {
                return set.name==="Set 1";
            });
            if (index !== -1) {
                allowUpdate = true;
            }
        }
        if (allowUpdate) {
            var documentIndex = _.findIndex($scope.documentSets[index].documents, function(doc) {
                return doc._id.toString()===data._id.toString();
            });
            if (documentIndex !== -1) {
                var projectIndex = getItemIndex($scope.projects, data.project);
                if ($scope.documentSets[index].__v > 0) {
                    $scope.documentSets[index].__v -= 1;
                }
                if (projectIndex !== -1 && $scope.documentSets[index].__v === 0) {
                    $scope.projects[projectIndex].__v -=1;
                    $scope.projects[projectIndex].element.document -=1;
                }
                $scope.documentSets[index].documents[documentIndex].__v = 0;
            }
        }
    });

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

    function convertEmailToNameByContactBooks(contactBooks) {
        var availableTypes = ["tasks", "threads", "files"];
        _.each(availableTypes, function(type) {
            _.each($scope[type], function(item) {
                if (item.notMembers && item.notMembers.length > 0) {
                    item.notMemberNames = [];
                    _.each(item.notMembers, function(email) {
                        var index = _.findIndex(contactBooks, function(contact) {
                            return email === contact.email;
                        });
                        if (index !== -1) {
                            item.notMemberNames.push(contactBooks[index].name);
                        }
                    });
                }
            });
        });
    };

    function findAllByProject(project) {
        $ionicLoading.show();
        var prom1 = [
            taskService.getProjectTask({id: project._id}).$promise, 
            messageService.getProjectThread({id : project._id}).$promise,
        ];
        var prom2 = [
            fileService.getProjectFiles({id: project._id, type: "file"}).$promise,
            documentService.me({id: project._id}).$promise,
            fileService.getProjectFiles({id: project._id, type: "document"}).$promise,
            contactBookService.me().$promise
        ];

        $q.all(prom1).then(function(res) {
            $scope.tasks = res[0];
            $scope.threads = res[1];
            getThreadsLastAccess($scope.threads);
            filterAndSortTaskDueDate($scope.tasks);
            $q.all(prom2).then(function(res) {
                $scope.files = res[0];
                $scope.documentSets = res[1];
                $scope.documents = res[2];
                $scope.contactBooks = res[3];
                documentSetInitial();
                getFilesLastAccess($scope.files);
                convertEmailToNameByContactBooks($scope.contactBooks);
                $ionicLoading.hide();
            });
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
        $scope.step = 1;
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
                // Get project member name for non-user via contact books
                _.each($scope.projectMembers, function(member) {
                    if (!member._id) {
                        var index = _.findIndex($scope.contactBooks, function(contact) {
                            return member.email === contact.email;
                        });
                        if (index !== -1) {
                            member.name = $scope.contactBooks[index].name;
                        }
                    }
                })
            });
        } 
        if ($scope.currentTab==="thread") {
            $scope.modalCreateThread.show();
        } else if ($scope.currentTab==="task") {
            $scope.modalCreateTask.show();
        } else if ($scope.currentTab==="file") {
            $scope.modalCreateFile.show();
        }
    };

    $scope.next = function(type) {
        if (type==="create-task") {
            if ($scope.step==1 && (!$scope.task.description || $scope.task.description.trim().length===0)) {
                $ionicLoading.show({ template: 'Description is missing...', noBackdrop: true, duration: 2000 });
            } else if ($scope.step==2 && (!$scope.task.dateStart || !$scope.task.dateEnd)) {
                $ionicLoading.show({ template: 'Start date is missing...', noBackdrop: true, duration: 2000 });
            } else {
                $scope.step +=1;
            }
        } else if (type==="create-thread") {
            if ($scope.step==1 && (!$scope.thread.name || $scope.thread.name.trim().length==0)) {
                $ionicLoading.show({ template: 'Thread name is missing...', noBackdrop: true, duration: 2000 });
            } else {
                $scope.step +=1;
            }
        } else if (type==="create-file") {
            $scope.uploadFile.members = _.filter($scope.projectMembers, {select: true});
            if ($scope.step==1 && (!$scope.uploadFile.name || $scope.uploadFile.name.trim().length===0 || !$scope.uploadFile.selectedTag)) {
                $ionicLoading.show({ template: 'File name is missing...', noBackdrop: true, duration: 2000 });
            } else if ($scope.step==2 && $scope.uploadFile.members.length===0) {
                $ionicLoading.show({ template: 'File has no assignees...', noBackdrop: true, duration: 2000 });
            } else {
                $scope.step +=1;
            }
        }
    };

    function refreshProjectMembersAndStep() {
        _.each($scope.projectMembers, function(member) {
            member.select = false;
        });
        $scope.step = 1;
    };

    //create new task
    $ionicModal.fromTemplateUrl('modalCreateTask.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalCreateTask = modal;
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

    $scope.task = {
        members : [],
        dateEnd: new Date(moment().add(1, "hours")),
        dateStart: new Date(),
        time: {},
        type: "task-project"
    };

    $scope.assign = function(index) {
        $scope.projectMembers[index].select = !$scope.projectMembers[index].select;
    };

    $scope.createNewTask = function() {
        $scope.task.members = _.filter($scope.projectMembers, {select: true});
        if ($scope.task.members.length===0) {
            return $ionicLoading.show({ template: 'Task has no assignees...', noBackdrop: true, duration: 2000 });
        } else if (!$scope.task.dateEnd || !$scope.task.dateStart) {
            return $ionicLoading.show({ template: 'Start or End date is missing...', noBackdrop: true, duration: 2000 });
        } else if ($scope.task.description && $scope.task.description.trim().length===0) {
            return $ionicLoading.show({ template: 'Description is missing...', noBackdrop: true, duration: 2000 });
        }
        $scope.task.time.start = $scope.task.dateStart;
        $scope.task.time.end = $scope.task.dateEnd;
        
        taskService.create({id : $rootScope.selectedProject._id},$scope.task).$promise.then(function(res) {
            $scope.modalCreateTask.hide();
            $scope.task = {
                members : [],
                dateEnd: new Date(),
                dateStart: new Date(),
                time: {},
                type: "task-project"
            };
            refreshProjectMembersAndStep();
            $scope.tasks.push(res);
            filterAndSortTaskDueDate($scope.tasks);
            $ionicLoading.show({ template: 'New Task Created!', noBackdrop: true, duration: 2000 });
        }, function(err) {
            $ionicLoading.show({ template: 'There was an Error...', noBackdrop: true, duration: 2000 });
        });
    };

    // Create new thread section
    $ionicModal.fromTemplateUrl('modalCreateThread.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalCreateThread = modal;
    });

    $scope.thread = {
        members : [],
        type: "project-message"
    };

    $scope.createNewThread = function() {
        $scope.thread.members = _.filter($scope.projectMembers, {select: true});
        if ($scope.thread.members.length ===0) {
            $ionicLoading.show({ template: 'Assignees are missing...', noBackdrop: true, duration: 2000 })
        } else {
            messageService.create({id: $rootScope.selectedProject._id}, $scope.thread)
            .$promise.then(function (res) {
                $scope.modalCreateThread.hide();
                $scope.thread = {
                    members: [],
                    type: "project-message"
                };
                $scope.threads.push(res);
                refreshProjectMembersAndStep();
                $state.go("threadDetail", {threadId: res._id});
                $ionicLoading.show({ template: 'New Message Created!', noBackdrop: true, duration: 2000 })
            }, function(err) {
                $ionicLoading.show({ template: 'There was an error...', noBackdrop: true, duration: 2000 })
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
                $ionicLoading.show({ template: 'New Team Created!', noBackdrop: true, duration: 2000 })
                $rootScope.currentTeam = $scope.currentTeam = team;
                $scope.modalCreateTeam.hide();
            }, function (err) {
                $ionicLoading.show({ template: 'There was an error...', noBackdrop: true, duration: 2000 })
            });
        } else {
            $ionicLoading.show({ template: 'Please check your input!', noBackdrop: true, duration: 2000 });
        }
    };

    // Create new File
    $scope.tags = [];
    if ($scope.currentTeam) {
        _.each($scope.currentTeam.fileTags, function(tag) {
            $scope.tags.push({name: tag, select: false});
        });
    }

    $ionicModal.fromTemplateUrl('modalCreateFile.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalCreateFile = modal;
    });

    $scope.uploadFile = {
        members: [],
        tags: [],
        type: "file"
    };

    $scope.getFileUpload = function() {
        $ionicLoading.show();
        var input = document.getElementById("read-input");
        filepicker.store(
            input,
            function(Blob) {
                console.log(Blob);
                $scope.uploadFile.file = Blob;
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

    $scope.createNewFile = function() {
        if (!$scope.uploadFile.file) {
            $ionicLoading.show({ template: 'File is missing...', noBackdrop: true, duration: 2000 });
        } else {
            $ionicLoading.show();
            $scope.uploadFile.file.filename = $scope.uploadFile.name;
            uploadService.upload({id: $scope.selectedProject._id}, $scope.uploadFile).$promise.then(function(res) {
                $ionicLoading.hide();
                $scope.modalCreateFile.hide();
                $scope.uploadFile = {
                    members: [],
                    tags: [],
                    type: "file",
                    selectedTag: null
                };
                refreshProjectMembersAndStep();
                $ionicLoading.show({ template: 'New File Created!', noBackdrop: true, duration: 2000 });
                $scope.files.push(res);
                $state.go("fileDetail", {fileId: res._id});
            }, function(err) {
                $ionicLoading.hide();
                $ionicLoading.show({ template: 'There was an error...', noBackdrop: true, duration: 2000 });
            });
        }
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
