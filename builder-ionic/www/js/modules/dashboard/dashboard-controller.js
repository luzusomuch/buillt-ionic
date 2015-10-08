angular.module('buiiltApp')
  .controller('DashboardCtrl', function(notificationService, projectService,fileService, builderPackageService,contractorService,materialPackageService,staffPackageService, designService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, taskService, messageService) {
  $scope.currentPackageType = 0;
  $scope.getCurrentPackageType = function(value) {
    $scope.currentPackageType = value;
  };

  $scope.projects = [];
  authService.getCurrentUser().$promise.then(function(user){
    $rootScope.user = $scope.user = user;
    $rootScope.isLeader = (user.team.role == 'leader');
    authService.getCurrentTeam().$promise.then(function(team){
      $rootScope.currentTeam = $scope.currentTeam = team;
      $scope.projects = team.project;
    });
  });

  notificationService.getTotalForIos().$promise
  .then(function(res) {
    if (res.length > 0) {
      $scope.totalNotifications = res.length;
    }
  });

  $scope.headingName = "Project";

  $scope.currentTab = 'thread';
  $scope.selectTabWithIndex = function(value){
    $ionicTabsDelegate.select(value);
    if (value == 0) {
      $scope.currentTab = 'thread';
    } else if (value == 1) {
      $scope.currentTab = 'task';
    } else if (value == 2) {
      $scope.currentTab = 'document';
    } else {
      $scope.currentTab = 'notification';
    }
  };

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
              
  // $scope.toggleMenu = function(){
  //   var transform = $(".menu-content.pane").css('transform');
  //   var values = transform.match(/-?[\d\.]+/g);
  //   if (values == null || values[4] == "0") {
  //     $(".menu-content.pane").css({transform: 'translate3d(275px,0px,0px)'});
  //   }
  //   else {
  //     $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
  //   }
  // };

  $scope.contractorPackages = [];
  $scope.materialPackages = [];
  $scope.staffPackages = [];
  $scope.files = [];
  $scope.projectId = '';
  $scope.selectedProject = {};

  function showPackageTypeByTeam(hasArchitectManager){
    if (hasArchitectManager) {
      $scope.allPackageTypes = {
        homeOwner: [{'name': 'Architect', 'id' : 1}],
        builder: [
          {'name':'Architect', 'id': 1},
          {'name':'Subcontractors', 'id':3},
          {'name':'Suppliers', 'id':4},
          {'name':'Employees', 'id':5}],
        contractor: [{'name': 'Contracts', 'id' : 3}],
        supplier: [{'name': 'Material', 'id' : 5}],
        architect: [
          {'name':'Design', 'id': 2},
          {'name':'Client', 'id':1},
          {'name':'Builder', 'id':1},]
      };
    } else {
      $scope.allPackageTypes = {
        homeOwner: [{'name': 'Builder', 'id' : 1}],
        builder: [
          {'name':'Client', 'id': 1},
          {'name':'Subcontractors', 'id':3},
          {'name':'Suppliers', 'id':4},
          {'name':'Employees', 'id':5}],
        contractor: [{'name': 'Contracts', 'id' : 3}],
        supplier: [{'name': 'Material', 'id' : 5}],
        architect: [
          {'name':'Design', 'id': 2},
          {'name':'Client', 'id':1},
          {'name':'Builder', 'id':1},]
      };
    }
  };

  function findPackageByProject(value){
    builderPackageService.findDefaultByProject({id: value}).$promise.then(function(builderPackage){
      $scope.builderPackage = builderPackage;
      showPackageTypeByTeam($scope.builderPackage.hasArchitectManager);
      if ($scope.currentTeam.type === 'homeOwner') {
        $scope.packageTypeByTeam = $scope.allPackageTypes['homeOwner'];
      }
      else if ($scope.currentTeam.type === 'builder') {
        $scope.packageTypeByTeam = $scope.allPackageTypes['builder'];
      }
      else if ($scope.currentTeam.type === 'contractor') {
        $scope.packageTypeByTeam = $scope.allPackageTypes['contractor'];
      }
      else if ($scope.currentTeam.type === 'supplier') {
        $scope.packageTypeByTeam = $scope.allPackageTypes['supplier'];
      }
      else if ($scope.currentTeam.type == 'architect') {
        $scope.packageTypeByTeam = $scope.allPackageTypes['architect'];
      }
    });
    if ($scope.currentTeam.type == 'architect') {
      designService.getAll({id: value}).$promise.then(function(designPackages){
        $scope.designPackages = designPackages;
      });
    } else if ($scope.currentTeam.type == 'builder' || $scope.currentTeam.type == 'homeOwner') {
      designService.getListInArchitect({id: value}).$promise.then(function(designPackages){
        $scope.designPackages = designPackages;
      });
    } else {
      $scope.designPackages = [];
    }
    contractorService.get({id : value}).$promise.then(function(contractorPackages){
      $scope.contractorPackages = contractorPackages;
    });
    materialPackageService.get({id : value}).$promise.then(function(materialPackages){
      $scope.materialPackages = materialPackages;
    });
    staffPackageService.getAll({id: value}).$promise.then(function(staffPackages){
      $scope.staffPackages = staffPackages;
    });
  };

  

  if ($rootScope.selectProject._id) {
    $scope.headingName = " ";
    $scope.selectedProject = $rootScope.selectProject;
    $scope.projectId = $scope.selectedProject._id;
    findPackageByProject($scope.selectedProject._id);
    $rootScope.$broadcast('getProject', $scope.projectId);
  }

  $scope.clickChange = function(value) {
    $scope.headingName = " ";
    $scope.selectedProject = value;
    $rootScope.currentProjectId = $scope.projectId = value._id;
    findPackageByProject(value._id);
    $scope.modalProject.hide();
    $rootScope.$broadcast('getProject', value._id);
  };
  $scope.isShowDefault = true;
  $scope.isShowContractorPackage = false;
  $scope.isShowMaterialPackage = false;
  $scope.isShowStaffPackage = false;
  $scope.isShowDocumentation = false;

  if ($rootScope.hasResourceType) {
    $scope.isShowDefault = false;
  }

  function resetCurrentResource(){
    $rootScope.hasResourceType = false;
    $rootScope.currentResource = [];
    $rootScope.currentSelectResource = [];
  };

  // $scope.choosePackage = function(value) {
  //   resetCurrentResource();
  //   if (value == 1) {
  //     $scope.isShowDefault = false;
  //     $scope.isShowContractorPackage = false;
  //     $scope.isShowMaterialPackage = false;
  //     $scope.isShowStaffPackage = false;
  //     $scope.isShowDocumentation = false;
  //     $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
  //     $state.go('client',{id: $scope.projectId});
  //   }
  //   else if (value == 2) {
  //     $scope.isShowDefault = false;
  //     $scope.isShowContractorPackage = true;
  //     $scope.isShowMaterialPackage = false;
  //     $scope.isShowStaffPackage = false;
  //     $scope.isShowDocumentation = false;
  //     $rootScope.hasResourceType = true;
  //     $rootScope.currentResource = $scope.contractorPackages;
  //     $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
  //   }
  //   else if (value == 3) {
  //     $scope.isShowDefault = false;
  //     $scope.isShowContractorPackage = false;
  //     $scope.isShowMaterialPackage = true;
  //     $scope.isShowStaffPackage = false;
  //     $scope.isShowDocumentation = false;
  //     $rootScope.hasResourceType = true;
  //     $rootScope.currentResource = $scope.materialPackages;
  //     $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
  //   }
  //   else if (value == 4) {
  //     $scope.isShowDefault = false;
  //     $scope.isShowContractorPackage = false;
  //     $scope.isShowMaterialPackage = false;
  //     $scope.isShowStaffPackage = true;
  //     $scope.isShowDocumentation = false;
  //     $rootScope.hasResourceType = true;
  //     $rootScope.currentResource = $scope.staffPackages;
  //     $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
  //   }
  //   else if (value == 5) {
  //     $scope.isShowDefault = false;
  //     $scope.isShowContractorPackage = false;
  //     $scope.isShowMaterialPackage = false;
  //     $scope.isShowStaffPackage = false;
  //     $scope.isShowDocumentation = true;
  //     $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
  //   }
  // };

  $scope.goToResourceDetail = function(resource) {
    if (resource.type == 'contractor') {
      $state.go('contractorRequestInProgress',{id:resource.project, packageId: resource._id});
    }
    else if (resource.type == 'material') {
      $state.go('materialRequestInProcess',{id:resource.project, packageId: resource._id});
    }
    else if (resource.type == 'staffPackage') {
      $state.go('staffView',{id:resource.project, packageId: resource._id});
    }
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
