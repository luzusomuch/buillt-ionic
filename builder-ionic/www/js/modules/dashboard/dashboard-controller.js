angular.module('buiiltApp')
  .controller('DashboardCtrl', function(fileService,contractorService,materialPackageService,staffPackageService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService) {
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

  $scope.clickChange = function(value) {
    $scope.headingName = " ";
    $scope.projectId = value;
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
  $scope.isShowDefault = true;
  $scope.isShowContractorPackage = false;
  $scope.isShowMaterialPackage = false;
  $scope.isShowStaffPackage = false;
  $scope.isShowDocumentation = false;
  $scope.choosePackage = function(value) {
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
      $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
    }
    else if (value == 3) {
      $scope.isShowDefault = false;
      $scope.isShowContractorPackage = false;
      $scope.isShowMaterialPackage = true;
      $scope.isShowStaffPackage = false;
      $scope.isShowDocumentation = false;
      $(".menu-content.pane").css({transform: 'translate3d(0px,0px,0px)'});
    }
    else if (value == 4) {
      $scope.isShowDefault = false;
      $scope.isShowContractorPackage = false;
      $scope.isShowMaterialPackage = false;
      $scope.isShowStaffPackage = true;
      $scope.isShowDocumentation = false;
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
});
