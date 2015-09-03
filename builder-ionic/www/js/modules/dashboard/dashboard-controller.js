angular.module('buiiltApp')
  .controller('DashboardCtrl', function(fileService,contractorService,materialPackageService,staffPackageService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService) {
  
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
              
              $scope.toggleMenu = function(){
              $(".menu-content.pane").toggle();
              };

  $scope.contractorPackages = [];
  $scope.materialPackages = [];
  $scope.staffPackages = [];
  $scope.files = [];
  $scope.projectId = '';

  $scope.clickChange = function(value) {
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
      console.log(files);
      _.each($scope.files, function(file){
        if (file.isNewNotification == 'undefined') {
          file.isNewNotification = false;
        }
      });
    });
  };

  $scope.isShowContractorPackage = false;
  $scope.isShowMaterialPackage = false;
  $scope.isShowStaffPackage = false;
  $scope.isShowDocumentation = false;
  $scope.choosePackage = function(value) {
    if (value == 1) {
      $scope.isShowContractorPackage = false;
      $scope.isShowMaterialPackage = false;
      $scope.isShowStaffPackage = false;
      $scope.isShowDocumentation = false;
      $state.go('client',{id: $scope.projectId});
    }
    else if (value == 2) {
      $scope.isShowContractorPackage = true;
      $scope.isShowMaterialPackage = false;
      $scope.isShowStaffPackage = false;
      $scope.isShowDocumentation = false;
    }
    else if (value == 3) {
      $scope.isShowContractorPackage = false;
      $scope.isShowMaterialPackage = true;
      $scope.isShowStaffPackage = false;
      $scope.isShowDocumentation = false;
    }
    else if (value == 4) {
      $scope.isShowContractorPackage = false;
      $scope.isShowMaterialPackage = false;
      $scope.isShowStaffPackage = true;
      $scope.isShowDocumentation = false;
    }
    else if (value == 5) {
      $scope.isShowContractorPackage = false;
      $scope.isShowMaterialPackage = false;
      $scope.isShowStaffPackage = false;
      $scope.isShowDocumentation = true;
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
