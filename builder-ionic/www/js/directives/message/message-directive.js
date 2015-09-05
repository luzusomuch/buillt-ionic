angular.module('buiiltApp')
  .directive('message', function(){
    return {
      restrict: 'A',
      templateUrl: 'js/directives/message/message.html',
      scope:{
        package: '=',
        type : '@'
      },
      controller:
        function(notificationService,$scope,$rootScope,messageService, authService,$timeout,$location,filterFilter, $stateParams, $location , packageService, userService, projectService, documentService) {
          //Init Params
          console.log('asdsadasdsad');
          var contentHeight = $(".messages-list-content").height() - $("div.tab-nav.tabs").height();
          $("#createThreadForm").css('height', contentHeight + 'px');
          console.log(contentHeight);
          $scope.showMessageList = true;

          $("a#newMessage").on('click', function(){
            if ($("a#newMessage > i.icon").hasClass('ion-ios-plus-empty')) {
              $("a#newMessage > i.icon").removeClass('ion-ios-plus-empty');
              $("a#newMessage > i.icon").addClass('ion-ios-close-empty');
              $("a#createThread").trigger('click');
            }
            else if ($("a#newMessage > i.icon").hasClass('ion-ios-close-empty')) {
              $("a#newMessage > i.icon").removeClass('ion-ios-close-empty');
              $("a#newMessage > i.icon").addClass('ion-ios-plus-empty');
              $("span.close-thread").trigger('click');
            }
          });

          $scope.currentProject = $rootScope.currentProject;
          authService.getCurrentUser().$promise.then(function(res) {
            $scope.currentUser = res;
          });
          authService.getCurrentTeam().$promise.then(function(data){
            $scope.currentTeam = data;
            $scope.isLeader = (_.find($scope.currentTeam.leader,{_id : $scope.currentUser._id})) ? true : false;
            getAvailableUser($scope.type);
          });
          $scope.submitted = false;
          $scope.isNew = true;
          $scope.addThread = false;

          //Get Available assignee to assign to task
          var getAvailableUser = function(type) {
            
            switch(type) {
              case 'builder' :
                $scope.available = [];
                $scope.available = angular.copy($scope.currentTeam.leader);
                if ($scope.currentTeam._id == $scope.package.owner._id && $scope.isLeader) {
                  if ($scope.package.to.team) {
                    _.forEach($scope.package.to.team.leader, function (leader) {
                      $scope.available.push(leader);
                    })
                  }
                }
                if ($scope.package.to.team && $scope.currentTeam._id == $scope.package.to.team._id && $scope.isLeader) {
                  _.forEach($scope.package.owner.leader, function (leader) {
                    $scope.available.push(leader);
                  })
                }
                _.forEach($scope.currentTeam.member,function(member) {
                  if (member.status == 'Active') {
                    $scope.available.push(member._id);
                  }
                });
                _.remove($scope.available,{_id : $scope.currentUser._id});
                _.each($scope.available, function(assignee) {
                  assignee.isSelect = false;
                });
                break;
              case 'staff' :
                $scope.available =  angular.copy($scope.package.staffs);
                $scope.available = _.union($scope.available,$scope.currentTeam.leader);
                _.remove($scope.available,{_id : $scope.currentUser._id});
                _.each($scope.available, function(assignee) {
                  assignee.isSelect = false;
                });
                break;
              case 'contractor' :
                $scope.available = [];
                $scope.available = _.union($scope.available,$scope.currentTeam.leader);
                if ($scope.currentTeam._id == $scope.package.winnerTeam._id._id && $scope.isLeader) {
                  _.forEach($scope.package.owner.leader,function(leader) {
                    $scope.available.push(leader);
                  });
                }
                if ($scope.currentTeam._id == $scope.package.owner._id && $scope.isLeader) {
                  _.forEach($scope.package.winnerTeam._id.leader,function(leader) {
                    $scope.available.push(leader);
                  });
                }
                _.forEach($scope.currentTeam.member,function(member) {
                  if (member.status == 'Active') {
                    $scope.available.push(member._id);
                  }
                });
                _.remove($scope.available,{_id : $scope.currentUser._id});
                _.each($scope.available, function(assignee) {
                  assignee.isSelect = false;
                });
                break;
              case 'material' :
                $scope.available = [];
                $scope.available = _.union($scope.available,$scope.currentTeam.leader);
                if ($scope.currentTeam._id == $scope.package.winnerTeam._id._id && $scope.isLeader) {
                  _.forEach($scope.package.owner.leader,function(leader) {
                    $scope.available.push(leader);
                  });
                }
                if ($scope.currentTeam._id == $scope.package.owner._id  && $scope.isLeader) {
                  _.forEach($scope.package.winnerTeam._id.leader,function(leader) {
                    $scope.available.push(leader);
                  });
                }
                _.forEach($scope.currentTeam.member,function(member) {
                  if (member.status == 'Active') {
                    $scope.available.push(member._id);
                  }
                });
                _.remove($scope.available,{_id : $scope.currentUser._id});
                _.each($scope.available, function(assignee) {
                  assignee.isSelect = false;
                });
                break;
              case 'variation' :
                $scope.available = [];
                $scope.available = _.union($scope.available,$scope.currentTeam.leader);
                if ($scope.currentTeam._id == $scope.package.to._id._id && $scope.isLeader) {
                  _.forEach($scope.package.owner.leader,function(leader) {
                    $scope.available.push(leader);
                  });
                }
                if ($scope.currentTeam._id == $scope.package.owner._id && $scope.isLeader) {
                  _.forEach($scope.package.to._id.leader,function(leader) {
                    $scope.available.push(leader);
                  });
                }
                _.forEach($scope.currentTeam.member,function(member) {
                  if (member.status == 'Active') {
                    $scope.available.push(member._id);
                  }
                });
                _.remove($scope.available,{_id : $scope.currentUser._id});
                _.each($scope.available, function(assignee) {
                  assignee.isSelect = false;
                });
              default :
                break
            }
          };

          //Update Thread List
          var updateThread = function() {
            messageService.getIos({id : $scope.package._id, type : $scope.type}).$promise
              .then(function(res) {
                $scope.threads = res;
                //$scope.currentThread = $scope.threads[0];
                _.forEach($scope.threads,function(thread) {
                  if (_.find(thread.users,{'_id' : $scope.currentUser._id})) {
                    thread.canSee = true;
                  } else if (thread.owner == $scope.currentUser._id) {
                    thread.canSee = true;
                    thread.isOwner = true;
                  } else {
                    thread.canSee = false;
                    thread.isOwner = false
                  }
                  if (thread.isNewNotification == 'undefined') {
                    thread.isNewNotification = false;
                  }
                });
                if ($scope.currentThread) {
                  $scope.currentThread = _.find($scope.threads,{_id : $scope.currentThread._id});
                }
              });
          };
          updateThread();

          var getMessage = function() {
            if ($scope.currentThread)
              updateThread();
            //$timeout(getMessage,3000);

          };

          //$timeout(getMessage,3000);

          //Function fired when click new task
          $scope.newThread = function() {
            $scope.thread = {
              users : []
            };
            getAvailableUser($scope.type);
            $scope.isNew = true;
            $scope.addThread = true;
            $scope.showMessageList = false;
          };

          //Function fired when click edit task
          $scope.editThread = function(thread) {
            $scope.thread = angular.copy(thread);
            getAvailableUser($scope.type);
            _.forEach($scope.thread.users,function(item) {
              _.remove($scope.available,{_id : item._id});
            });
            $scope.isNew = false;

          };

          //Assign people to task
          $scope.assign = function(user,index) {
            if (user.isSelect == false) {
              user.isSelect = true;
              $scope.thread.users.push(user);
            }
            else if (user.isSelect == true) {
              user.isSelect = false;
              _.remove($scope.thread.users, {_id: user._id});
            }
            // $scope.thread.users.push(user);
            // $scope.available.splice(index,1);
          };

          //Revoke people to task
          $scope.revoke = function(assignee,index) {
            $scope.available.push(assignee);
            $scope.thread.users.splice(index,1);
          };

          $scope.selectThread = function(thread) {
            $scope.currentThread = thread;

            // socket.emit('join',thread._id);
          };

          // socket.on('message:new', function (thread) {
          //   $scope.currentThread = thread;
          //   // console.log($scope.scrollHeight = $('#messages')[0].scrollHeight);
          // });

          $scope.enterMessage = function ($event) {
            if ($event.keyCode === 13) {
              $event.preventDefault();
              $scope.sendMessage();
            }
          };

          $scope.message = {};
          $scope.sendMessage = function(thread) {
            if ($scope.message.text != '') {
              messageService.sendMessage({id: thread._id, type: $scope.type}, $scope.message).$promise
                .then(function (res) {
                  // console.log(res);
                  //$scope.currentThread = res;
                  updateThread();
                  $scope.message.text = '';
                });
            }

          };

          $scope.close = function() {
            $scope.submitted = false;
            $scope.addThread = false;
            $scope.showMessageList = true;
          };

          $scope.toggleThread = function(thread) {
            if ($scope.isThreadShown(thread)) {
              $scope.shownThread = null;
            } else {
              $scope.shownThread = thread;
            }
          };
          $scope.isThreadShown = function(thread) {
            return $scope.shownThread === thread;
          };

          $scope.goToThreadDetail = function(thread){
            notificationService.read({_id : thread._id}).$promise.then();
          };

          $scope.saveThread = function(form) {
            $scope.submitted = true;
            if (form.$valid) {
              if ($scope.isNew) {
                messageService.create({id: $scope.package._id, type: $scope.type}, $scope.thread).$promise
                  .then(function (res) {
                    // $('.card-title').trigger('click');
                    $scope.addThread = false;
                    $scope.currentThread = res;
                    $scope.showMessageList = true;
                    // socket.emit('join',res._id);
                    updateThread();
                  })
              } else {
                messageService.update({id : $scope.thread._id, type : $scope.type},$scope.thread).$promise
                  .then(function(res) {
                    // $('.card-title').trigger('click');
                    updateThread();
                  })
              }
            }
          };
        }
    }
  });
