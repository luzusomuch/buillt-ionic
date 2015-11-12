angular.module('buiiltApp')
    .controller('DashboardCtrl', function(boardService, peopleService, notificationService, projectService,fileService, builderPackageService,contractorService,materialPackageService,staffPackageService, designService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, taskService, messageService) {
    $scope.defaultSelectedPackage = 0;
    $scope.getPackageType = function(type) {
        $scope.defaultSelectedPackage = type;
        switch (type) {
            case 0:
                $scope.currentPackage.name = "DASHBOARD";
            break;
            case 1:
                $scope.currentPackage.name = "PEOPLE";
            break;
            case 2:
                $scope.currentPackage.name = "BOARD";
            break;
            case 3:
                $scope.currentPackage.name = "DOCUMENTS";
            break;
        };
        $scope.modalPackage.hide();
    };

    function filterInPeoplePackage(peoplePackage) {
        _.each(peoplePackage.builders, function(item) {
            if (item._id && item.hasSelect) {
                if (item._id._id == $scope.user._id) {
                    $scope.peoplePackages.push(peoplePackage);
                }
            }
        });
        _.each(peoplePackage.clients, function(item) {
            if (item._id && item.hasSelect) {
                if (item._id._id == $scope.user._id) {
                    $scope.peoplePackages.push(peoplePackage);
                }
            }
        });
        _.each(peoplePackage.architects, function(item) {
            if (item._id && item.hasSelect) {
                if (item._id._id == $scope.user._id) {
                    $scope.peoplePackages.push(peoplePackage);
                }
            }
        });
        _.each(peoplePackage.subcontractors, function(item) {
            if (item._id && item.hasSelect) {
                if (item._id._id == $scope.user._id) {
                    $scope.peoplePackages.push(peoplePackage);
                }
            }
        });
        _.each(peoplePackage.consultants, function(item) {
            if (item._id && item.hasSelect) {
                if (item._id._id == $scope.user._id) {
                    $scope.peoplePackages.push(peoplePackage);
                }
            }
        });
    };

    function filterInBoardPackage(boardPackage) {
        _.each(boardPackage, function(board) {
            _.each(board.invitees, function(item) {
                if (item._id) {
                    if (item._id._id == $scope.user._id || board.owner._id == $scope.user._id) {
                        $scope.boardPackages.push(board);
                    }
                }
            });
        });
        $scope.boardPackages = _.uniq($scope.boardPackages, '_id');
    };

    $scope.projects = [];
    $scope.peoplePackages = [];
    $scope.boardPackages = [];

    authService.getCurrentUser().$promise.then(function(user){
        $rootScope.user = $scope.user = user;
        $scope.projects = user.projects;
        $scope.projects = _.uniq($scope.projects, '_id');
        $rootScope.isLeader = (user.team.role == 'leader');
        authService.getCurrentTeam().$promise.then(function(team){
            $rootScope.currentTeam = $scope.currentTeam = team;
        });
        _.each($scope.projects, function(project) {
            peopleService.getInvitePeople({id: project._id}).$promise.then(function(res) {
                res.name = project.name;
                filterInPeoplePackage(res);
            });
            boardService.getBoards({id: project._id}).$promise.then(function(res) {
                filterInBoardPackage(res);
            });
        });
    });

    notificationService.getTotalForIos().$promise
    .then(function(res) {
        if (res.length > 0) {
            $scope.totalNotifications = res.length;
        }
    });

    function findAllByProject(project) {
        $scope.peoplePackages = [];
        $scope.boardPackages = [];
        $scope.files = [];
        peopleService.getInvitePeople({id: project._id}).$promise.then(function(res) {
            res.name = project.name;
            filterInPeoplePackage(res);
        });
        boardService.getBoards({id: project._id}).$promise.then(function(res) {
            filterInBoardPackage(res);
        });
        fileService.getFileInProject({id: project._id}).$promise.then(function(res) {
            $scope.files = res;
        });
    };

    $scope.selectProject = function(project) {
        $scope.headingName = " ";
        $scope.selectedProject = project;
        $rootScope.currentProjectId = $scope.projectId = project._id;
        findAllByProject(project);
        $scope.modalProject.hide();
        $rootScope.$broadcast('getProject', project._id);
    };

    if ($rootScope.selectProject._id) {
        $scope.headingName = " ";
        $scope.selectedProject = $rootScope.selectProject;
        $scope.projectId = $scope.selectedProject._id;
        findAllByProject($scope.selectedProject);
        $rootScope.$broadcast('getProject', $scope.projectId);
    }

    $scope.currentPackageType = 0;
    $scope.getCurrentPackageType = function(value) {
        $scope.currentPackageType = value;
    };

    $scope.headingName = "Project";

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

  $ionicModal.fromTemplateUrl('modalPackage.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalPackage = modal;
  });

  $scope.choosePackageModal = function(){
    $scope.modalPackage.show();
  };

  if ($rootScope.currentPackage) {
    $scope.currentPackage = $rootScope.currentPackage;

    $rootScope.isCurrentSelectPackage = $scope.currentPackage;
    $rootScope.$broadcast('getPackage', $rootScope.currentPackage);
  }

  $scope.getPackage = function(value) {
    $rootScope.currentPackage = $scope.currentPackage = value;
    $scope.modalPackage.hide();
    $rootScope.$broadcast('getPackage', $rootScope.currentPackage);
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
    console.log('aaaaaaaaaaaaaaaaa');
    $scope.submitted = true;
    console.log(form);
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
        console.log($scope.task.assignees);
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

  $scope.$on('availableAssigneeInThread', function(event, value){
    $scope.availableAssigneesInThread = value;
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

  //upload new document
  $ionicModal.fromTemplateUrl('modalCreateDocument.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalCreateDocument = modal;
  });

  $scope.createTaskThreadDocument = function(){
    if ($scope.currentTab == 'thread') {
      $scope.modalCreateThread.show();
    } else if ($scope.currentTab == 'task') {
      $scope.modalCreateTask.show();
    } else if ($scope.currentTab == 'document') {
      $scope.modalCreateDocument.show();
    }
  };

  //show config
  $ionicModal.fromTemplateUrl('modalConfig.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalConfig = modal;
  });

  $scope.showConfig = function() {
    $scope.modalConfig.show();
  };

  //function hide modal
  $scope.closeModal = function(value) {
    switch(value) {
      case 'Project':
      $scope.modalProject.hide();
      break;

      case 'Package':
      $scope.modalPackage.hide();
      break;

      case 'CreateTask':
      $scope.modalCreateTask.hide();
      break;

      case 'CreateThread':
      $scope.modalCreateThread.hide();
      break;

      case 'CreateDocument':
      $scope.modalCreateDocument.hide();
      break;

      case 'Config':
      $scope.modalConfig.hide();
      break;

      default:
      break;
    }
  };
});
