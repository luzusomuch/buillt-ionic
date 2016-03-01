angular.module('buiiltApp')
    .controller('DashboardCtrl', function($ionicLoading, team, currentUser, peopleService, notificationService, projectService,fileService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, taskService, messageService, totalNotifications) {
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

    notificationService.getTotalForIos().$promise
    .then(function(res) {
        if (res.length > 0) {
            $scope.totalNotifications = res;
        }
    });

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
        $scope.files = [];
        $ionicLoading.show();
        fileService.getFileInProject({id: project._id}).$promise.then(function(res) {
            $scope.files = res;
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
        $scope.headingName = " ";
        $rootScope.selectedProject = project;
        findAllByProject(project);
        $scope.modalProject.hide();
        $rootScope.$broadcast('getProject', project._id);
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

    $ionicModal.fromTemplateUrl('modalProject.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalProject = modal;
    });

    $scope.chooseProject = function(){
        $scope.modalProject.show();
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
        assignees : []
    };

    $scope.assign = function(staff,index) {
        if (staff.isSelect == false) {
            staff.isSelect = true;
            $scope.task.assignees.push(staff);
        }
        else if (staff.isSelect == true) {
            staff.isSelect = false;
            _.remove($scope.task.assignees, {_id: staff._id});
        }
    };

    $scope.submitted = false;
    $scope.createNewTask = function(form) {
        $scope.submitted = true;
        if (form.$valid) {
            var packageType = '';
            if ($scope.currentPackage.type == 'BuilderPackage') {
                packageType = 'builder';
            } else if ($scope.currentPackage.type == 'staffPackage') {
                packageType = 'staff';
            } else {
                packageType = $scope.currentPackage.type;
            }
            taskService.create({id : $scope.currentPackage._id, type : packageType},$scope.task)
            .$promise.then(function(res) {
                $rootScope.$broadcast('inComingNewTask', res);
                $scope.modalCreateTask.hide();
                _.each($scope.task.assignees, function(assignee){
                    assignee.isSelect = false;
                }); 
                $scope.task.name = null;
                $scope.task.dateEnd = null;
                $scope.submitted = false;
            });
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
        users : []
    };

    $scope.assignInThread = function(user,index) {
        if (user.isSelect == false) {
            user.isSelect = true;
            $scope.thread.users.push(user);
        }
        else if (user.isSelect == true) {
            user.isSelect = false;
            _.remove($scope.thread.users, {_id: user._id});
        }
    };

    $scope.createNewThread = function(form) {
        $scope.submitted = true;
        if (form.$valid && $scope.submitted) {
            var packageType = '';
            if ($scope.currentPackage.type == 'BuilderPackage') {
                packageType = 'builder';
            } else if ($scope.currentPackage.type == 'staffPackage') {
                packageType = 'staff';
            } else {
                packageType = $scope.currentPackage.type;
            }
            messageService.create({id: $scope.currentPackage._id, type: packageType}, $scope.thread)
            .$promise.then(function (res) {
                $rootScope.$broadcast('inComingNewThread', res);
                $scope.modalCreateThread.hide();
                $scope.thread.name = null;
                $scope.submitted = false;
            });
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
