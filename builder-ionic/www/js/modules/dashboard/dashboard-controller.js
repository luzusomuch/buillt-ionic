angular.module('buiiltApp')
  .controller('DashboardCtrl', function(projectService,fileService, builderPackageService,contractorService,materialPackageService,staffPackageService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal) {
  $scope.headingName = "Project";
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
              
  $scope.toggleMenu = function(){
    var transform = $(".menu-content.pane").css('transform');
    var values = transform.match(/-?[\d\.]+/g);
    if (values == null || values[4] == "0") {
      $(".menu-content.pane").css({transform: 'translate3d(275px,0px,0px)'});
    }
    else {
      $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
    }
  };

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

  $scope.choosePackage = function(value) {
    resetCurrentResource();
    if (value == 1) {
      $scope.isShowDefault = false;
      $scope.isShowContractorPackage = false;
      $scope.isShowMaterialPackage = false;
      $scope.isShowStaffPackage = false;
      $scope.isShowDocumentation = false;
      $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
      $state.go('client',{id: $scope.projectId});
    }
    else if (value == 2) {
      $scope.isShowDefault = false;
      $scope.isShowContractorPackage = true;
      $scope.isShowMaterialPackage = false;
      $scope.isShowStaffPackage = false;
      $scope.isShowDocumentation = false;
      $rootScope.hasResourceType = true;
      $rootScope.currentResource = $scope.contractorPackages;
      $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
    }
    else if (value == 3) {
      $scope.isShowDefault = false;
      $scope.isShowContractorPackage = false;
      $scope.isShowMaterialPackage = true;
      $scope.isShowStaffPackage = false;
      $scope.isShowDocumentation = false;
      $rootScope.hasResourceType = true;
      $rootScope.currentResource = $scope.materialPackages;
      $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
    }
    else if (value == 4) {
      $scope.isShowDefault = false;
      $scope.isShowContractorPackage = false;
      $scope.isShowMaterialPackage = false;
      $scope.isShowStaffPackage = true;
      $scope.isShowDocumentation = false;
      $rootScope.hasResourceType = true;
      $rootScope.currentResource = $scope.staffPackages;
      $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
    }
    else if (value == 5) {
      $scope.isShowDefault = false;
      $scope.isShowContractorPackage = false;
      $scope.isShowMaterialPackage = false;
      $scope.isShowStaffPackage = false;
      $scope.isShowDocumentation = true;
      $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
    }
  };

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

  $scope.getPackage = function(value) {
    $scope.currentPackage = value;
    if (value.type == 'BuilderPackage') {
      $scope.packageType = 'builder';
    } else if (value.type == 'staffPackage') {
      $scope.packageType = 'staff';
    } else {
      $scope.packageType = value.type;
    }
    $scope.modalChoosePackage.hide();
    $rootScope.$broadcast('getPackage', {package: $scope.currentPackage, type: $scope.packageType});
  };
});
