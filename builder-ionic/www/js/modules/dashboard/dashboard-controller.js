angular.module('buiiltApp')
  .controller('DashboardCtrl', function($ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService) {
  
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.clickChange = function(value) {
    console.log(value);
    builderPackage: function(builderPackageService, $stateParams) {
        return builderPackageService.findDefaultByProject({id : value.id});
      },
      contractorPackages: function(contractorService, $stateParams) {
        return contractorService.get({id : value.id});
      },
      materialPackages: function(materialPackageService, $stateParams) {
        return materialPackageService.get({id : value.id});
      },
      staffPackages: function(staffPackageService, $stateParams) {
        return staffPackageService.getAll({id: value.id});
      },
      documents: function(fileService, $stateParams) {
        return fileService.getFileByStateParam({'id': value.id});
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
  notificationService.getTotalForIos().$promise
  .then(function(res) {
    if (res.length > 0)
      $scope.total = res.length;
    });

  // $scope.selectTabWithIndex = function(value){
  //   console.log(value);
  //   $ionicTabsDelegate.select(value);
  //   if (value == 0) {
  //     window.location.reload();
  //   }
  // };

  // var selectedTab = $rootScope.selectedTabs;
  // $scope.selectedTab = $rootScope.selectedTabs;
  // if ($rootScope.selectedTabs == 1) {
  //   $("div.tab-nav.tabs a.tab-item:last-child").trigger('click');
  //   alert('22222222222');
  // }
  // else {
  //   alert('33333333333');
  // }

  // jQuery(document).ready(function(){
  //   if ($rootScope.selectedTabs == 1) {
  //     $timeout(function(){
  //       $("div.tab-nav.tabs a.tab-item:last-child").trigger('click');
  //     },3000)
  //   }
  // });

  
  

  // alert(window.localStorage.getItem('selectTabs'))
  // if (window.localStorage.getItem('selectTabs') == '2') {
  //   alert('1111111111');
  //   $scope.selectTabWithIndex(1);
  //   $ionicTabsDelegate.select(1);
  //   console.log($ionicTabsDelegate.select(1));
  //   window.localStorage.removeItem("selectTabs");
  // }
  // else {
  //   alert('22222222222');
  // }
});
