angular.module('buiiltApp')
  .controller('DashboardCtrl', function($scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService) {
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

  $scope.selectTabWithIndex = function(value){
    $ionicTabsDelegate.select(value);
    if (value == 0) {
      window.location.reload();
    }
  };

  alert($rootScope.selectedTabs);
  if ($rootScope.selectedTabs == 1) {
    alert('22222222222');
    $ionicTabsDelegate.select(1);
  }
  else {
    alert('33333333333');
  }

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
