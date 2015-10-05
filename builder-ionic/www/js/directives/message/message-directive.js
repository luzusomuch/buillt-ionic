angular.module('buiiltApp')
  .directive('message', function(){
    return {
      restrict: 'A',
      templateUrl: 'js/directives/message/message.html',
      // scope:{
      //   package: '=',
      //   type : '='
      // },
      controller:
        function(notificationService,$scope,$rootScope,messageService, authService,$timeout,$location,filterFilter, $stateParams, $location , packageService, userService, projectService, documentService) {
          //Init Params
          var getThreadByProject = function(projectId) {
            messageService.getAllByProject({id: projectId}).$promise.then(function(res){
              $scope.threads = res;
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
            });
          }

          //Get Available assignee to assign to task
          var getAvailableUser = function(type) {
            console.log($scope.package);
            switch(type) {
              case 'builder' :
                $scope.available = [];
                var tempAvailable = [];
                $scope.available = angular.copy($scope.currentTeam.leader);
                if ($scope.currentTeam._id == $scope.package.owner._id && $scope.isLeader) {
                  if ($scope.package.to.team) {
                    _.forEach($scope.package.to.team.leader, function (leader) {
                      $scope.available.push(leader);
                    })
                  }
                }
                if ($scope.package.to.team) {
                  if ($scope.package.to.team._id != $scope.currentTeam._id && $scope.isLeader) {
                    _.forEach($scope.package.to.team.leader, function (leader) {
                      tempAvailable.push(leader);
                    });
                    $scope.available = _.union($scope.available, tempAvailable);
                  }
                }
                if ($scope.package.architect && $scope.package.architect.team) {
                  if ($scope.package.architect.team._id != $scope.currentTeam._id && $scope.isLeader) {
                    _.each($scope.package.architect.team.leader, function(leader){
                      tempAvailable.push(leader);
                    });
                    $scope.available = _.union($scope.available, tempAvailable);
                  }
                }
                if ($scope.package.winner) {
                  if ($scope.package.winner._id != $scope.currentTeam._id && $scope.package.winner._id != $scope.package.owner._id) {
                    _.each($scope.package.winner.leader, function(leader){
                      tempAvailable.push(leader);
                    });
                    $scope.available = _.union($scope.available, tempAvailable);
                  }
                }
                _.forEach($scope.currentTeam.member,function(member) {
                  if (member.status == 'Active') {
                    $scope.available.push(member._id);
                  }
                });
                $scope.available = _.uniq($scope.available, '_id');
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
          var updateThread = function(packageId, type) {
            messageService.getIos({id : packageId, type : type}).$promise
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
          // updateThread();

          var getPackageType = function(package) {
            var type = '';
            if (package.type == 'BuilderPackage') {
              type = 'builder';
            } else if (package.type == 'staffPackage') {
              type = 'staff';
            } else {
              type = package.type;
            }
            return type;
          };

          $scope.$on('getPackage', function(event, package){
            $scope.package = package;
            $scope.type = getPackageType(package);
            updateThread(package._id, $scope.type);
            getAvailableUser($scope.type);
            $rootScope.hasSelectCurrentPackage = true;
            $rootScope.currentSelectPackage = package;
            $rootScope.$broadcast('availableAssigneeInThread', $scope.available);
          });

          $scope.$on('getProject', function(event, value){
            $rootScope.hasSelectCurrentPackage = false;
            $rootScope.currentProjectId = value;
            getThreadByProject(value);
          });

          $scope.$on('inComingNewThread', function(event, thread){
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
            $scope.threads.push(thread);
          });

          if (($rootScope.selectProject._id || $rootScope.currentProjectId) && !$rootScope.hasSelectCurrentPackage) {
            var projectId = ($rootScope.selectProject._id) ? $rootScope.selectProject._id : $rootScope.currentProjectId;
            getThreadByProject(projectId);
          } else if (($rootScope.selectPackage || $rootScope.currentSelectPackage) && $rootScope.hasSelectCurrentPackage) {
            $scope.package = ($rootScope.selectPackage) ? $rootScope.selectPackage : $rootScope.currentSelectPackage;
            updateThread($scope.package._id, getPackageType($scope.package));
            getAvailableUser($scope.type);
            $rootScope.$broadcast('availableAssigneeInThread', $scope.available);
          } else {
            messageService.getAllByUser().$promise.then(function(res){
              $scope.threads = res;
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
            });
          }
          
          var contentHeight = $(".messages-list-content").height() - $("div.tab-nav.tabs").height();
          $("#createThreadForm").css('height', contentHeight + 'px');
          $scope.showMessageList = true;

          $scope.currentProject = $rootScope.currentProject;
          authService.getCurrentUser().$promise.then(function(res) {
            $scope.currentUser = res;
          });
          authService.getCurrentTeam().$promise.then(function(data){
            $scope.currentTeam = data;
            $scope.isLeader = (_.find($scope.currentTeam.leader,{_id : $scope.currentUser._id})) ? true : false;
            // getAvailableUser($scope.type);
          });
          $scope.submitted = false;
          $scope.isNew = true;
          $scope.addThread = false;

          var getMessage = function() {
            if ($scope.currentThread)
              updateThread();
            //$timeout(getMessage,3000);

          };

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
                    $("a#newMessage > i.icon").removeClass('ion-ios-close-empty');
                    $("a#newMessage > i.icon").addClass('ion-ios-plus-empty');
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
