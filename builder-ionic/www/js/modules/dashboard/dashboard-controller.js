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

  if (window.localStorage.setItem("selectTabs") == '2') {
    $ionicTabsDelegate.select(1);
    (window.localStorage.removeItem("selectTabs");
  }
});
