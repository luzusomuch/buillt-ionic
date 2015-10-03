angular.module('buiiltApp')
  .controller('DashboardCtrl', function(projectService,fileService, builderPackageService,contractorService,materialPackageService,staffPackageService, designService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, taskService, messageService, filepickerService, uploadService) {
  $scope.projects = [];
  authService.getCurrentUser().$promise.then(function(user){
    $rootScope.user = $scope.user = user;
    $rootScope.isLeader = (user.team.role == 'leader');
    $scope.total = $rootScope.totalNotification;
    authService.getCurrentTeam().$promise.then(function(team){
      $rootScope.currentTeam = $scope.currentTeam = team;
      $scope.projects = team.project;
    });
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

  function findPackageByProject(value){
    builderPackageService.findDefaultByProject({id: value}).$promise.then(function(builderPackage){
      $scope.builderPackage = builderPackage;
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
    fileService.getFileByStateParamIos({'id': value}).$promise.then(function(files){
      $scope.files = files;
      _.each($scope.files, function(file){
        if (file.isNewNotification == 'undefined') {
          file.isNewNotification = false;
        }
      });
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
    $scope.modalChooseProject.hide();
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

  

  $ionicModal.fromTemplateUrl('modal1.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalChooseProject = modal;
  });

  $scope.chooseProject = function(){
    $scope.modalChooseProject.show();
  };

  $ionicModal.fromTemplateUrl('modalPackage.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalChoosePackage = modal;
  });

  $scope.choosePackageModal = function(){
    $scope.modalChoosePackage.show();
  };

  if ($rootScope.currentPackage) {
    $scope.currentPackage = $rootScope.currentPackage;

    $rootScope.isCurrentSelectPackage = $scope.currentPackage;
    $rootScope.$broadcast('getPackage', $rootScope.currentPackage);
  }

  $scope.getPackage = function(value) {
    $rootScope.currentPackage = $scope.currentPackage = value;
    $scope.modalChoosePackage.hide();
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

  $scope.createNewTask = function(form) {
    if (form.$valid) {
      taskService.create({id : $scope.currentPackage._id, type : $scope.packageType},$scope.task)
      .$promise.then(function(res) {
        $rootScope.$broadcast('inComingNewTask', res);
        $scope.modalCreateTask.hide();
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
    messageService.create({id: $scope.currentPackage._id, type: $scope.packageType}, $scope.thread)
    .$promise.then(function (res) {
      $rootScope.$broadcast('inComingNewThread', res);
      $scope.modalCreateThread.hide();
    });
  };

  //upload new document
  $ionicModal.fromTemplateUrl('createNewDocument.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalCreateDocument = modal;
  });

  $scope.uploadFile = {};
  $scope.pickFile = pickFile;

  $scope.onSuccess = onSuccess;

  function pickFile(){
    filepickerService.pick(
      {mimetype: 'image/*'},
      onSuccess
    );
  };

  function onSuccess(file){
    $scope.uploadFile = {
      file: file,
      _id: ($scope.fileId) ? $scope.fileId : '',
      belongToType: ($scope.packageType) ? $scope.packageType : 'project',
      tags: [],
      isQuote: $scope.isQuote
    };
  };

  $scope.uploadNewDocument = function() {
    if ($scope.currentPackage) {
      uploadService.uploadInPackage({id: $scope.currentPackage._id, file: $scope.uploadFile})
      .$promise.then(function(res){
        $rootScope.$broadcast('inComingNewDocument', res);
        $scope.modalCreateDocument.hide();
      });
    } else {
      uploadService.upload({id: $rootScope.currentProjectId, file: $scope.uploadFile})
      .$promise.then(function(res){
        $rootScope.$broadcast('inComingNewDocument', res);
        $scope.modalCreateDocument.hide();
      });
    }
  };

  $scope.createTaskThreadDocument = function(){
    if ($scope.currentTab == 'thread') {
      $scope.modalCreateThread.show();
    } else if ($scope.currentTab == 'task') {
      $scope.modalCreateTask.show();
    } else if ($scope.currentTab == 'document') {
      $scope.modalCreateDocument.show();
    }
  }
});
