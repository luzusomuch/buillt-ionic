angular.module('buiiltApp')
  .directive('task', function(){
  return {
    restrict: 'EA',
    templateUrl: 'js/directives/task/task.html',
    // scope:{
    //   package: '=',
    //   type : '@'
    // },
    controller:
      function($scope,$rootScope,taskService, authService,filterFilter, $stateParams, $rootScope, $location , packageService, userService, projectService, documentService) {
        //Init Params
        $scope.deviceWidth = $rootScope.deviceWidth;
        $scope.currentProject = $rootScope.currentProject;
        authService.getCurrentUser().$promise.then(function(res) {
           $scope.currentUser = res;

            authService.getCurrentTeam().$promise.then(function(res) {
              $scope.currentTeam = res;
              $scope.isLeader = (_.find($scope.currentTeam.leader,{_id : $scope.currentUser._id})) ? true : false;
              // getAvailableAssignee($scope.type);
            });
        });

        $scope.showListTask = true;
        $scope.isShowInputDate = false;
        $scope.callDateInput = function(){
          $scope.isShowInputDate = true;
          $("input#dueDate").trigger('click');
        };

        //Update Task List
        var updateTasks = function(packageId, type) {
          var dueToday = new Date();
          var dueTomorrow = new Date();
          dueTomorrow.setDate(dueTomorrow.getDate() +1);
          
          taskService.get({id : packageId, type : type}).$promise
          .then(function(res) {
            $scope.tasks = res;
            _.forEach($scope.tasks,function(task) {
              var endDate = new Date(task.dateEnd);
              task.isOwner = (_.findIndex(task.assignees,{_id : $scope.currentUser._id}) != -1) || (task.user == $scope.currentUser._id);
              task.dateEnd = (task.dateEnd) ? new Date(task.dateEnd) : null;
              task.dueDateToday = (endDate.setHours(0,0,0,0) == dueToday.setHours(0,0,0,0)) ? true : false;
              if (dueTomorrow.setHours(0,0,0,0) == endDate.setHours(0,0,0,0)) {
                task.dueDateTomorrow = true;
              }
              else {
                task.dueDateTomorrow = false;
              }
            });
          });
        };

        var getTaskByProject = function(projectId){
          taskService.getAllByProject({id: projectId}).$promise.then(function(res){
            var dueToday = new Date();
            var dueTomorrow = new Date();
            dueTomorrow.setDate(dueTomorrow.getDate() +1);
            $scope.tasks = res;
            _.forEach($scope.tasks,function(task) {
              var endDate = new Date(task.dateEnd);
              task.isOwner = (_.findIndex(task.assignees,{_id : $scope.currentUser._id}) != -1) || (task.user == $scope.currentUser._id);
              task.dateEnd = (task.dateEnd) ? new Date(task.dateEnd) : null;
              task.dueDateToday = (endDate.setHours(0,0,0,0) == dueToday.setHours(0,0,0,0)) ? true : false;
              if (dueTomorrow.setHours(0,0,0,0) == endDate.setHours(0,0,0,0)) {
                task.dueDateTomorrow = true;
              }
              else {
                task.dueDateTomorrow = false;
              }
            });
          });
        };

        var getAvailableAssignee = function(type) {
          switch(type) {
            case 'builder' :
              $scope.available = [];
              var tempAvailable = [];
              // $scope.available = _.union($scope.available,$scope.currentTeam.leader);
              // if ($scope.currentTeam._id == $scope.package.owner._id && $scope.isLeader) {
              //   if ($scope.package.to.team) {
              //       _.forEach($scope.package.to.team.leader, function (leader) {
              //         $scope.available.push(leader);
              //       })
              //   }
              // }
              // if ($scope.package.to.team && $scope.currentTeam._id == $scope.package.to.team._id && $scope.isLeader) {
              //   _.forEach($scope.package.owner.leader, function (leader) {
              //     $scope.available.push(leader);
              //   })
              // }
              // _.forEach($scope.currentTeam.member,function(member) {
              //   if (member.status == 'Active') {
              //     $scope.available.push(member._id);
              //   }
              // });
              // _.each($scope.available, function(assignee) {
              //   assignee.isSelect = false;
              // });
              $scope.available = _.union($scope.available,$scope.currentTeam.leader);
              if ($scope.currentTeam._id != $scope.package.owner._id && $scope.isLeader) {
                _.each($scope.package.owner.leader, function(leader){
                  tempAvailable.push(leader);
                });
                $scope.available = _.union($scope.available, tempAvailable);
              }
              if ($scope.package.to.team) {
                if ($scope.package.to.team._id != $scope.currentTeam._id && $scope.isLeader) {
                  _.forEach($scope.package.to.team.leader, function (leader) {
                    tempAvailable.push(leader);
                  });
                  $scope.available = _.union($scope.available, tempAvailable);
                }
              }
              if ($scope.package.architect) {
                if ($scope.package.architect.team) {
                  if ($scope.package.architect.team._id != $scope.currentTeam._id && $scope.isLeader) {
                    _.each($scope.package.architect.team.leader, function(leader){
                      tempAvailable.push(leader);
                    });
                    $scope.available = _.union($scope.available, tempAvailable);
                  }
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
              break;
            case 'staff' :
              $scope.available =  angular.copy($scope.package.staffs);
              $scope.available = _.union($scope.available,$scope.currentTeam.leader);
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
              _.each($scope.available, function(assignee) {
                assignee.isSelect = false;
              });
              break;
            case 'design':
              $scope.available = [];
              $scope.available = angular.copy($scope.package.invitees);
              $scope.available = _.union($scope.available, $scope.currentTeam.leader);
              break;
            default :
              break
          }
        };

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
          $rootScope.package = $scope.package = package;
          var type = getPackageType(package);
          updateTasks($scope.package._id, type);
          getAvailableAssignee(type);
          $rootScope.hasSelectCurrentPackage = true;
          $rootScope.currentSelectPackage = package;
          $rootScope.$broadcast('taskAvaiableAssignees', $scope.available);
        });

        $scope.$on('getProject', function(event, value){
          $rootScope.hasSelectCurrentPackage = false;
          $rootScope.currentProjectId = value;
          getTaskByProject(value);
        });

        $scope.$on('inComingNewTask', function(event, task){
          var dueToday = new Date();
          var dueTomorrow = new Date();
          dueTomorrow.setDate(dueTomorrow.getDate() +1);
          var endDate = new Date(task.dateEnd);
          task.isOwner = (_.findIndex(task.assignees,{_id : $scope.currentUser._id}) != -1) || (task.user == $scope.currentUser._id);
          task.dateEnd = (task.dateEnd) ? new Date(task.dateEnd) : null;
          task.dueDateToday = (endDate.setHours(0,0,0,0) == dueToday.setHours(0,0,0,0)) ? true : false;
          if (dueTomorrow.setHours(0,0,0,0) == endDate.setHours(0,0,0,0)) {
            task.dueDateTomorrow = true;
          }
          else {
            task.dueDateTomorrow = false;
          }
          $scope.tasks.push(task);
        });
        if (($rootScope.selectProject._id || $rootScope.currentProjectId) && !$rootScope.hasSelectCurrentPackage) {
          var projectId = ($rootScope.selectProject._id) ? $rootScope.selectProject._id : $rootScope.currentProjectId;
          getTaskByProject(projectId);
        } else if (($rootScope.selectPackage || $rootScope.currentSelectPackage) && $rootScope.hasSelectCurrentPackage) {
          $scope.package = ($rootScope.selectPackage) ? $rootScope.selectPackage : $rootScope.currentSelectPackage;
          var type = getPackageType($scope.package);
          updateTasks($scope.package._id, type);
          getAvailableAssignee(type);
          $rootScope.$broadcast('taskAvaiableAssignees', $scope.available);
        } else {
          taskService.getAllByUser().$promise.then(function(res){
            var dueToday = new Date();
            var dueTomorrow = new Date();
            dueTomorrow.setDate(dueTomorrow.getDate() +1);
            $scope.tasks = res;
            _.forEach($scope.tasks,function(task) {
              var endDate = new Date(task.dateEnd);
              task.isOwner = (_.findIndex(task.assignees,{_id : $scope.currentUser._id}) != -1) || (task.user == $scope.currentUser._id);
              task.dateEnd = (task.dateEnd) ? new Date(task.dateEnd) : null;
              task.dueDateToday = (endDate.setHours(0,0,0,0) == dueToday.setHours(0,0,0,0)) ? true : false;
              if (dueTomorrow.setHours(0,0,0,0) == endDate.setHours(0,0,0,0)) {
                task.dueDateTomorrow = true;
              }
              else {
                task.dueDateTomorrow = false;
              }
            });
          });
        }

        var contentHeight = $(".tasks-list-content").height() - $("div.tab-nav.tabs").height();
        $("#createTaskForm").css('height', contentHeight + 'px');

        $scope.isNew = true;
        $scope.filter = 'all';
        $scope.customFilter = {};

        //Function fired when click new task
        $scope.newTask = function() {
          $scope.task = {
            assignees : []
          };
          getAvailableAssignee($scope.type);
          $scope.isNew = true;
          $scope.isShow = false;
          $scope.addTask = true;
          $scope.showListTask = false;
        };

        $scope.showTask = function(task) {
          $scope.task = angular.copy(task);
          getAvailableAssignee($scope.type);
          _.forEach($scope.task.assignees,function(item) {
            if (!_.find($scope.available,{_id : item._id})) {
              item.canRevoke = false;
            } else {
              item.canRevoke = true;
            }
            _.remove($scope.available,{_id : item._id});
          });
          $scope.isShow = true;
        };

        //Function fired when click edit task
        $scope.editTask = function(task) {
          $scope.task = angular.copy(task);
          getAvailableAssignee($scope.type);
          _.forEach($scope.task.assignees,function(item) {
            if (!_.find($scope.available,{_id : item._id})) {
              item.canRevoke = false;
            } else {
              item.canRevoke = true;
            }
            _.remove($scope.available,{_id : item._id});
          });
          $scope.isNew = false;
          $scope.isShow = false;

        };

        //Assign people to task
        $scope.assign = function(staff,index) {
          if (staff.isSelect == false) {
            staff.isSelect = true;
            $scope.task.assignees.push(staff);
          }
          else if (staff.isSelect == true) {
            staff.isSelect = false;
            _.remove($scope.task.assignees, {_id: staff._id});
          }
          // staff.canRevoke = true;
          // $scope.available.splice(index,1);
        };

        //Revoke people to task
        $scope.revoke = function(assignee,index) {
          $scope.available.push(assignee);
          $scope.task.assignees.splice(index,1);
        };

        //Complete task
        $scope.complete = function(task) {
          task.completed = !task.completed;
          if (task.completed) {
            task.completedBy = $scope.currentUser._id;
            task.completedAt = new Date();
          } else {
            task.completedBy = null;
            task.completedAt = null;
          }
          taskService.update({id : task._id, type : $scope.type},task).$promise
            .then(function(res) {
              //$('.card-title').trigger('click');
              updateTasks();
            })
        };

        $scope.toggleTask = function(task) {
          if ($scope.isTaskShown(task)) {
            $scope.shownTask = null;
          } else {
            $scope.shownTask = task;
          }
        };
        $scope.isTaskShown = function(task) {
          return $scope.shownTask === task;
        };

        $scope.cancelTask = function(){
          $scope.addTask = false;          
          $scope.showListTask = true;
          $scope.isShowInputDate = false;
        };

        //Submit form function
        $scope.save = function(form) {
          if (form.$valid) {
            if ($scope.isNew) {
              taskService.create({id : $scope.package._id, type : $scope.type},$scope.task).$promise
                .then(function(res) {
                  // $('.card-title').trigger('click');
                  updateTasks();
                  $scope.addTask = false;
                  $scope.showListTask = true;
                  $scope.isShowInputDate = false;
                  $("a#newTask > i.icon").removeClass('ion-ios-close-empty');
                  $("a#newTask > i.icon").addClass('ion-ios-plus-empty');
                })
            } else {
              taskService.update({id : $scope.task._id, type : $scope.type},$scope.task).$promise
                .then(function(res) {
                  // $('.card-title').trigger('click');
                  updateTasks();
                })
            }

          }
        }
      }
  }
});