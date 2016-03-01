angular.module('buiiltApp')
  .directive('notification', function($compile){
    return {
      restrict: 'EA',
      replace : true,
      scope: {
        notification: '=',
        currentUser: '='
      },
      link : function(scope,element) {
        var params = {
          fromUser : function() {
            if (scope.notification.fromUser._id == scope.currentUser._id) {
              return '<span class="highlight">You</span> '
            }
            return '<span class="highlight">{{notification.fromUser.name}}</span> '
          },
          toUser : function () {
            if (scope.notification.toUser._id == scope.currentUser._id) {
              return '<span class="highlight">You</span> '
            }
            return '<span class="highlight">{{notification.toUser.name}}</span>';
          },
          team : function() {
            if (scope.notification.element._id == scope.currentUser.team._id) {
              return '<span class="highlight">your team</span> '
            }
            return 'team <span class="highlight">{{notification.element.name}}</span>';
          },
          messageText: function() {
            if (scope.notification.element.messages) {
              var message = '';
              if (scope.notification.element.messages[scope.notification.element.__v -1].text.length > 20) {
                message = scope.notification.element.messages[scope.notification.element.__v -1].text.substr(0,20) + "...";
              } else {
                message = scope.notification.element.messages[scope.notification.element.__v -1].text;
              }
              return '<span class="highlight">'+message+'</span>';
            }
          },
          element : '<span class="highlight">{{notification.element.name}}</span> ',
          time : '<span class="highlight">{{notification.createdAt | date : "yyyy/MM/dd hh:mm a"}}</span>'
        };
        var serviceTaskArray = ['task-assign','task-reopened','task-completed'];
        var serviceThreadArray = ['thread-assign','thread-message'];
        var fileArray = ["file-assign",'file-upload-reversion', 'document-upload-reversion'];
        var teamArray = ['team-invite','team-accept','team-remove','team-leave','team-assign-leader', 'team-reject', 'join-team-request', "accept-team-request"];
        
        var getSref = function(notification) {
          if (notification.type === "invite-to-project") {
            return 'dashboard';
          }

          if (teamArray.indexOf(notification.type) !== -1)  {
            return 'dashboard';
          }
        };

        var text;
        if (scope.notification.type === "invite-to-project") {
          text = params.fromUser() + " has invited you to join their project, " + params.time;
        }
        if (scope.notification.type === 'team-invite') {
          text = params.fromUser() + ' has invited you to join ' + params.team() + ' at ' + params.time;
        }
        if (scope.notification.type === 'team-accept') {
          text = params.fromUser() + ' has accepted to join ' + params.team() + ' at ' + params.time;
        }
        if (scope.notification.type === 'team-remove') {
          text = params.fromUser() + ' has removed ' + params.toUser() + ' from ' + params.team() + ' at ' + params.time;
        }
        if (scope.notification.type === 'team-leave') {
          text = params.fromUser() + ' has left the team ' + params.team() + ' at ' + params.time;
        }
        if (scope.notification.type === 'team-assign-leader') {
          text = params.fromUser() + ' has assigned ' + params.toUser() + ' as an administrator in '+ params.team() + ' at ' + params.time;
        }
        if (scope.notification.type === 'team-reject') {
          text = params.fromUser() + ' has rejected ' + params.toUser() + ' your invitation at ' + params.time;
        }
        if (scope.notification.type === 'join-team-request') {
            text = params.fromUser() + " has asked you to accept his join team request at " + params.time;
        }
        if (scope.notification.type === 'accept-team-request') {
          text = params.fromUser() + " has accepted your request to join "+params.team()+" at " + params.time;
        }

        scope.notification.sref = getSref(scope.notification);
        element.html('<ion-item ui-sref="{{notification.sref}}" ui-sref-opts="{reload: true}" ng-click="click(notification)" style="padding: 0px"><div class="_notification"><p>' + text + '</p></div></ion-item>').show();
        $compile(element.contents())(scope);
      },
      controller: function ($scope, $rootScope, taskService, authService, $state, notificationService) {
        $scope.click = function(notification) {
          notificationService.markAsRead({_id : notification._id}).$promise
            .then(function(res) {
              $rootScope.$emit('notification:read',notification);
              $('#sidenav-overlay').trigger( "click" );
              $rootScope.modalNotification.hide();
            })
        };
        authService.getCurrentUser().$promise.then(function(currentUser){
          $rootScope.currentUser = $scope.currentUser = currentUser;
        });
      }
    }
  })
  .directive('spNotification',function() {
    return {
      restrict: 'EA',
      replace : true,
      templateUrl: 'js/directives/notification/notification.html',
      controller: [
        '$scope', '$rootScope','notificationService','socket','authService','$state',
        function ($scope, $rootScope, notificationService,socket,authService,$state) {
          $scope.currentUser = $rootScope.currentUser;
          $scope.notifications = [];
          var limit = 60;

          notificationService.get().$promise.then(function(res) {
            $scope.total = res.length;
            $scope.notifications = res;
          });

          $scope.markAllAsRead = function() {
            notificationService.markAllAsRead().$promise.then(function(res) {
              $scope.notifications = [];
              $scope.total = 0;
              $rootScope.$emit('notification:allRead');
              $('#slimScrollDiv').hide();
              $('#sidenav-overlay').trigger( "click" );
            });
          };

          $scope.$watch('total',function(value) {
            if (value == 0) {
              $('.slimScrollDiv').hide();
            } else
              $('.slimScrollDiv').show();
          })

          $rootScope.$on('notification:read',function(event,notification) {
            _.remove($scope.notifications,{_id : notification._id});
            $scope.total--;
          });

          // getNotifications(limit);
          socket.on('notification:new', function (notification) {
            if (notification) {
              $scope.notifications.unshift(notification);
              $scope.total++;
              $scope.$apply();
            }
          });

          socket.on('notification:read',function(notifications) {
            _.forEach(notifications,function(notification) {
              _.remove($scope.notifications,{_id : notification._id});
            });
            $scope.total -= notifications.length;

          })
        }]

    }
  });