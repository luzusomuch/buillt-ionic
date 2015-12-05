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
        console.log(scope);
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
          projectName : '<span class="highlight">{{notification.element.project.name}}</span> ',
          taskDescription : '<span class="highlight">{{notification.element.description}}</span> ',
          quote: '<span class="highlight">{{notification.element.quote}}</span> ',
          fileName: '<span class="highlight">{{notification.element.file.title}}</span> ',
          packageName: '<span class="highlight">{{notification.element.package.name}}</span> ',
          place: '<span class="highlight">{{notification.element.uploadIn.name}}</span> ',
          builderOrHomeOwner: '<span class="highlight">{{(notification.element.to.type == "homeOwner") ? "home owner" : "builder"}}</span> ',
          time : '<span class="highlight">{{notification.createdAt | date : "yyyy/MM/dd hh:mm a"}}</span>'
        };
        var serviceTaskArray = ['task-assign','task-reopened','task-completed'];
        var serviceThreadArray = ['thread-assign','thread-message'];
        // var serviceDocumentArray = ['uploadNewDocumentVersion','uploadDocument'];
        
        var getSref = function(notification) {
          if (serviceTaskArray.indexOf(notification.type) != -1)  {
            return 'taskDetail({id : notification.element.project._id, taskId : notification.element._id})';
          }
          if (serviceThreadArray.indexOf(notification.type) != -1)  {
            return 'threadDetail({id : notification.element.project._id, threadId : notification.element._id})';
          }
          if (notification.referenceTo == "people-chat") {
            return 'peopleChat({id: notification.element.project._id, peopleChatId: notification.element._id})';
          }
          if (notification.referenceTo == "board-chat" || notification.type == "NewBoard") {
            return 'boardDetail({boardId: notification.element._id})';
          }
          if (notification.type == "invite-people") {
            return 'dashboard';
          }
        };

        var text;
        if (scope.notification.type === 'task-assign') {
          text = 'New task: ' + params.taskDescription;
        }
        if (scope.notification.type === 'task-reopened') {
          text = 'Reopened task: ' + params.taskDescription;
        }
        if (scope.notification.type === 'task-completed') {
          text = 'Completed task: ' + params.taskDescription;
        }
        if (scope.notification.referenceTo === 'people-chat') {
          text = params.fromUser() + " mentioned you " + params.messageText();
        }
        if (scope.notification.referenceTo === 'board-chat') {
          text = params.fromUser() + " mentioned you " + params.messageText();
        }
        if (scope.notification.type === 'invite-people') {
          text = params.fromUser() + ' has added you to project ' + params.projectName;
        }
        if (scope.notification.type === 'NewBoard') {
          text = params.fromUser() + ' has added you to board ' + params.element;
        }

        scope.notification.sref = getSref(scope.notification);
        element.html('<ion-item ui-sref="{{notification.sref}}" ui-sref-opts="{reload: true}" ng-click="click(notification)" style="padding: 0px"><div class="_notification"><p>' + text + '</p></div></ion-item>').show();
        // element.html('<option value='+scope.notification._id+'>'+ text + '</option>').show();
        $compile(element.contents())(scope);
      },
      controller: function ($scope, $rootScope, taskService, authService, $state, notificationService) {
        $scope.click = function(notification) {
          notificationService.markAsRead({_id : notification._id}).$promise
            .then(function(res) {
              $rootScope.$emit('notification:read',notification);
              $('#sidenav-overlay').trigger( "click" );
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
          $scope.slimScrollOptions = {height: '390px'};
          $scope.readMore = true;
          $scope.currentUser = $rootScope.user;
          $scope.currentState = $rootScope.currentState;
          $scope.notifications = [];
          var limit = 60;
                   
                   

          notificationService.getTotalForIos().$promise
            .then(function(res) {
              $scope.total = res.length;
              $scope.notifications = res;
              console.log(res);
            });

          $scope.loadMore = function() {
            limit += 10;
            getNotifications(limit);
          };

          $scope.markAllAsRead = function() {
            notificationService.markAllAsRead().$promise
              .then(function(res) {
                $scope.notifications = [];
                $scope.total = 0;
                $rootScope.$emit('notification:allRead');
                $('#slimScrollDiv').hide();
                $('#sidenav-overlay').trigger( "click" );
              })
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