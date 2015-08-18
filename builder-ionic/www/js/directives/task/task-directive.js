angular.module('buiiltApp')
  .directive('task', function(){
  return {
    restrict: 'EA',
    templateUrl: 'js/directives/task/task.html',
    scope:{
      package: '=',
      type : '@'
    },
    controller:
      function($scope,$rootScope,taskService, authService,filterFilter, $stateParams, $rootScope, $location , packageService, userService, projectService, FileUploader, documentService) {
        //Init Params
        $scope.showListTask = true;

        var contentHeight = $(".tasks-list-content").height() - $("div.tab-nav.tabs").height();
        $("#createTaskForm").css('height', contentHeight + 'px');
        console.log(contentHeight);

        $("a#newTask").on('click', function(){
          if ($("a#newTask > i.icon").hasClass('ion-ios-plus-empty')) {
            $("a#newTask > i.icon").removeClass('ion-ios-plus-empty');
            $("a#newTask > i.icon").addClass('ion-ios-close-empty');
            $("a#createTask").trigger('click');
          }
          else if ($("a#newTask > i.icon").hasClass('ion-ios-close-empty')) {
            $("a#newTask > i.icon").removeClass('ion-ios-close-empty');
            $("a#newTask > i.icon").addClass('ion-ios-plus-empty');
            $("button.cancel-task").trigger('click');
          }
        });

        $scope.deviceWidth = $rootScope.deviceWidth;
        $scope.currentProject = $rootScope.currentProject;
        authService.getCurrentUser().$promise.then(function(res) {
           $scope.currentUser = res;

            authService.getCurrentTeam().$promise.then(function(res) {
              $scope.currentTeam = res;
              $scope.isLeader = (_.find($scope.currentTeam.leader,{_id : $scope.currentUser._id})) ? true : false;
              getAvailableAssignee($scope.type);
              updateTasks();

            });
        });

        $scope.isNew = true;
        $scope.filter = 'all';
        $scope.customFilter = {};
        //Get Available assignee to assign to task
        var getAvailableAssignee = function(type) {
          switch(type) {
            case 'builder' :
              $scope.available = [];
              $scope.available = _.union($scope.available,$scope.currentTeam.leader);
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
              _.each($scope.available, function(assignee) {
                assignee.isSelect = false;
              });
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
            default :
              break
          }
        };



        //Update Task List
        var updateTasks = function() {
          taskService.get({id : $scope.package._id, type : $scope.type}).$promise
            .then(function(res) {
              $scope.tasks = res;
              _.forEach($scope.tasks,function(task) {
                task.isOwner = (_.findIndex(task.assignees,{_id : $scope.currentUser._id}) != -1) || (task.user == $scope.currentUser._id);
                task.dateEnd = (task.dateEnd) ? new Date(task.dateEnd) : null;
              })
            });
        };


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