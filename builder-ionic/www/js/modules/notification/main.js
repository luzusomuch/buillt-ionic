angular.module('buiiltApp').config(function($stateProvider) {
  //$stateProvider
  //.state('notification', {
  //  url: '/notification',
  //  template: '<ui-view/>'
  //})
  //.state('notification.view', {
  //  url: '/',
  //  templateUrl: '/app/modules/notification/view-notification/view.html',
  //  controller: 'ViewNotificationCtrl',
  //  authenticate : true,
  //  resolve : {
  //    notifications : [
  //      'notificationService',
  //      function(notificationService) {
  //        return notificationService.get().$promise;
  //      }
  //    ]
  //  }
  //});

  $stateProvider
  .state('notifications', {
    url: '/notifications',
    templateUrl: 'js/modules/notification/view-notification/view.html',
    controller: 'ViewNotificationCtrl',
    authenticate: true
  })
});