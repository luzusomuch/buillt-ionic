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
            if (scope.notification.fromUser.email == scope.currentUser.email) {
              return '<span class="highlight">You</span> '
            }
            return '<span class="highlight">{{notification.fromUser.email}}</span> '
          },
          toUser : function () {
            if (scope.notification.toUser.email == scope.currentUser.email) {
              return '<span class="highlight">You</span> '
            }
            return '<span class="highlight">{{notification.toUser.email}}</span>';
          },
          team : function() {
            if (scope.notification.element._id == scope.currentUser.team._id) {
              return '<span class="highlight">your team</span> '
            }
            return 'team <span class="highlight">{{notification.element.name}}</span>';
          },
          element : '<span class="highlight">{{notification.element.name}}</span> ',
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
            return 'taskDetail({id : notification.element.project, taskId : notification.element._id})';
          }
          if (serviceThreadArray.indexOf(notification.type) != -1)  {
            return 'threadDetail({id : notification.element.project, threadId : notification.element._id})';
          }
          // if (serviceDocumentArray.indexOf(notification.type) != -1) {
          //   switch(notification.referenceTo){
          //     case 'DocumentInProject': 
          //       return 'projects.view({id: notification.element.projectId})';
          //     case 'DocumentContractorPackage': 
          //       return 'contractorRequest.contractorPackageInProcess({id: notification.element.projectId, packageId: notification.element.uploadIn._id})';
          //     case 'DocumentMaterialPackage': 
          //       return 'materialRequest.materialPackageInProcess({id: notification.element.projectId, packageId: notification.element.uploadIn._id})';
          //     case 'DocumentStaffPackage': 
          //       return 'staff.view({id: notification.element.projectId, packageId: notification.element.uploadIn._id})';
          //     // case 'DocumentVariation': 
          //       // return 'variationRequest.inProcess({id: notification.element.projectId, packageId: notification.element.uploadIn._id})';
          //     case 'DocumentBuilderPackage': 
          //       return 'client({id: notification.element.projectId})';
          //   }
          // }
        };

        var text;
        // if (scope.notification.type === 'task-assign') {
        //   text = params.fromUser() + ' has assigned ' + params.toUser() + ' to task ' + params.element;
        // }
        if (scope.notification.type === 'task-assign') {
          text = 'New task: ' + params.element;
        }
        // if (scope.notification.type === 'task-reopened') {
        //   text =  params.fromUser() + ' has reopened task ' + params.element;
        // }
        // if (scope.notification.type === 'task-completed') {
        //   text = params.fromUser() + ' has completed task ' + params.element;
        // }
        if (scope.notification.type === 'task-reopened') {
          text = 'Reopened task: ' + params.element;
        }
        if (scope.notification.type === 'task-completed') {
          text = 'Completed task: ' + params.element;
        }
        // if (scope.notification.type === 'uploadDocument') {
        //   text = params.fromUser()  + 'has added a new document ' + params.fileName + ' to ' + params.place;
        // }
        // if (scope.notification.type === 'uploadNewDocumentVersion') {
        //   text = params.fromUser()  + 'has updated the document ' + params.fileName + ' in project ' + params.place;
        // }
        // if (scope.notification.type === 'thread-assign') {
        //   text = params.fromUser() + ' has assigned ' + params.toUser() + ' to thread ' + params.element;
        // }
        // if (scope.notification.type === 'thread-message') {
        //   text = params.fromUser() + ' has send new message in thread ' + params.element;
        // }
        if (scope.notification.type === 'thread-assign') {
          text = 'New thread: ' + params.element;
        }
        if (scope.notification.type === 'thread-message') {
          text = 'New message: '+ params.element;
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