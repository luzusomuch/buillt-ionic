angular.module('buiiltApp')
    .controller('DashboardCtrl', function(team, currentUser, boardService, peopleService, notificationService, projectService,fileService, builderPackageService,contractorService,materialPackageService,staffPackageService, designService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, taskService, messageService) {
    $scope.defaultSelectedPackage = 0;
    $scope.team = team;
    $scope.currentUser = currentUser;
    $scope.getPackageType = function(type) {
        $scope.defaultSelectedPackage = type;
        switch (type) {
            case 0:
                $scope.currentPackage.name = "DASHBOARD";
            break;
            case 1:
                $scope.currentPackage.name = "PEOPLE";
            break;
            case 2:
                $scope.currentPackage.name = "BOARD";
            break;
            case 3:
                $scope.currentPackage.name = "DOCUMENTS";
            break;
        };
        $scope.modalPackage.hide();
    };

    function getAvailableAddedToNewBoard(projectId) {
        $scope.newBoardPeople = [];
        $scope.availableInvite = [];
        builderPackageService.findDefaultByProject({id: projectId}).$promise.then(function(builderPackage){
            $scope.builderPackage = builderPackage;
            peopleService.getInvitePeople({id: projectId}).$promise.then(function(board){
                console.log(board);
                if (_.findIndex(board.builders, function(item) {
                    if (item._id) {
                        return item._id._id == $scope.currentUser._id;
                    }}) != -1) {
                    $scope.currentUser.type = 'builder';
                } else if (_.findIndex(board.architects, function(item) {
                    if (item._id) {return item._id._id == $scope.currentUser._id;}
                    }) != -1) {
                    $scope.currentUser.type = 'architect';
                } else if (_.findIndex(board.clients, function(item){
                    if (item._id) {return item._id._id == $scope.currentUser._id;}
                    }) != -1) {
                    $scope.currentUser.type = 'client';
                } else if (_.findIndex(board.subcontractors, function(item){
                    if (item._id) {return item._id._id == $scope.currentUser._id;}
                    }) != -1) {
                    $scope.currentUser.type = 'subcontractor';
                } else if (_.findIndex(board.consultants, function(item){
                    if (item._id) {return item._id._id == $scope.currentUser._id;}
                    }) != -1) {
                    $scope.currentUser.type = 'consultant';
                } else {
                    $scope.currentUser.type = 'default';
                }
                if ($scope.builderPackage.projectManager.type == 'architect') {
                    if ($scope.currentUser.type == 'builder' || $scope.currentUser.type == 'client') {
                        _.each(board.architects, function(architect) {
                            if (architect._id && architect.hasSelect) {
                                $scope.availableInvite.push(architect._id);
                                $scope.newBoardPeople.push(architect._id);
                            }
                        });
                        _.each(board.consultants, function(consultant) {
                            if (consultant._id && consultant.hasSelect && consultant.inviter._id == $scope.currentUser._id) {
                                $scope.availableInvite.push(consultant._id);
                                $scope.newBoardPeople.push(consultant._id);
                            }
                        });
                        if ($scope.currentUser.type == 'builder') {
                            _.each(board.subcontractors, function(subcontractor) {
                                if (subcontractor._id && subcontractor.hasSelect) {
                                    $scope.availableInvite.push(subcontractor._id);
                                    $scope.newBoardPeople.push(subcontractor._id);
                                }
                            });
                        }
                    } else if ($scope.currentUser.type == 'architect') {
                        _.each(board.builders, function(builder) {
                            if (builder._id && builder.hasSelect) {
                                $scope.availableInvite.push(builder._id);
                                $scope.newBoardPeople.push(builder._id);
                            }
                        });
                        _.each(board.clients, function(client) {
                            if (client._id && client.hasSelect) {
                                $scope.availableInvite.push(client._id);
                                $scope.newBoardPeople.push(client._id);
                            }
                        });
                        _.each(board.consultants, function(consultant) {
                            if (consultant._id && consultant.hasSelect && consultant.inviter._id == $scope.currentUser._id) {
                                $scope.availableInvite.push(consultant._id);
                                $scope.newBoardPeople.push(consultant._id);
                            }
                        });
                    } else if ($scope.currentUser.type == 'subcontractor') {
                        _.each(board.subcontractors, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    $scope.newBoardPeople.push(item.inviter);
                                }
                            }
                        });
                    } else if ($scope.currentUser.type == 'consultant') {
                        _.each(board.consultants, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    $scope.newBoardPeople.push(item.inviter);
                                }
                            }
                        });
                    }
                } else if ($scope.builderPackage.projectManager.type == 'builder') {
                    if ($scope.currentUser.type == 'builder') {
                        _.each(board.architects, function(architect) {
                            if (architect._id && architect.hasSelect) {
                                $scope.availableInvite.push(architect._id);
                                $scope.newBoardPeople.push(architect._id);
                            }
                        });
                        _.each(board.consultants, function(consultant) {
                            if (consultant._id && consultant.hasSelect && consultant.inviter._id == $scope.currentUser._id) {
                                $scope.availableInvite.push(consultant._id);
                                $scope.newBoardPeople.push(consultant._id);
                            }
                        });
                        _.each(board.subcontractors, function(subcontractor) {
                            if (subcontractor._id && subcontractor.hasSelect) {
                                $scope.availableInvite.push(subcontractor._id);
                                $scope.newBoardPeople.push(subcontractor._id);
                            }
                        });
                        _.each(board.clients, function(client) {
                            if (client._id && client.hasSelect) {
                                $scope.availableInvite.push(client._id);
                                $scope.newBoardPeople.push(client._id);
                            }
                        });
                    } else if ($scope.currentUser.type == 'client' || $scope.currentUser.type == 'architect') {
                        _.each(board.builders, function(builder) {
                            if (builder._id && builder.hasSelect) {
                                $scope.availableInvite.push(builder._id);
                                $scope.newBoardPeople.push(builder._id);
                            }
                        });
                        _.each(board.consultants, function(consultant) {
                            if (consultant._id && consultant.hasSelect && consultant.inviter._id == $scope.currentUser._id) {
                                $scope.availableInvite.push(consultant._id);
                                $scope.newBoardPeople.push(consultant._id);
                            }
                        });
                    } else if ($scope.currentUser.type == 'subcontractor') {
                        _.each(board.subcontractors, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    $scope.newBoardPeople.push(item.inviter);
                                }
                            }
                        });
                    } else if ($scope.currentUser.type == 'consultant') {
                        _.each(board.consultants, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    $scope.newBoardPeople.push(item.inviter);
                                }
                            }
                        });
                    }
                } else {
                    if ($scope.currentUser.type == 'client') {
                        _.each(board.builders, function(builder) {
                            if (builder._id && builder.hasSelect) {
                                $scope.availableInvite.push(builder._id);
                                $scope.newBoardPeople.push(builder._id);
                            }
                        });
                        _.each(board.architects, function(architect) {
                            if (architect._id && architect.hasSelect) {
                                $scope.availableInvite.push(architect._id);
                                $scope.newBoardPeople.push(architect._id);
                            }
                        });
                        _.each(board.consultants, function(consultant) {
                            if (consultant._id && consultant.hasSelect && consultant.inviter._id == $scope.currentUser._id) {
                                $scope.availableInvite.push(consultant._id);
                                $scope.newBoardPeople.push(consultant._id);
                            }
                        });
                    } else if ($scope.currentUser.type == 'builder' || $scope.currentUser.type == 'architect') {
                        _.each(board.clients, function(client) {
                            if (client._id && client.hasSelect) {
                                $scope.availableInvite.push(client._id);
                                $scope.newBoardPeople.push(client._id);
                            }
                        });
                        if ($scope.currentUser.type == 'builder') {
                            _.each(board.subcontractors, function(subcontractor) {
                                if (subcontractor._id && subcontractor.hasSelect) {
                                    $scope.availableInvite.push(subcontractor._id);
                                    $scope.newBoardPeople.push(subcontractor._id);
                                }
                            });
                        }
                    } else if ($scope.currentUser.type == 'subcontractor') {
                        _.each(board.subcontractors, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    $scope.newBoardPeople.push(item.inviter);
                                }
                            }
                        });
                    } else if ($scope.currentUser.type == 'consultant') {
                        _.each(board.consultants, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    $scope.newBoardPeople.push(item.inviter);
                                }
                            }
                        });
                    }
                }
                if ($scope.team._id) {
                    _.each(team.leader, function(leader) {
                        $scope.availableInvite.push(leader);
                        $scope.newBoardPeople.push(leader);
                    });
                    _.each(team.member, function(member){
                        if (member._id && member.status == 'Active') {
                            $scope.availableInvite.push(member._id);
                            $scope.newBoardPeople.push(member._id);
                        }
                    });
                }
                // if ($scope.currentBoard._id) {
                //     _.each($scope.currentBoard.invitees, function(invitee) {
                //         if (invitee._id) {
                //             _.remove($scope.availableInvite, {_id: invitee._id._id});
                //         }
                //     });
                // }
                _.uniq($scope.availableInvite, '_id');
                _.uniq($scope.newBoardPeople, '_id');
                _.remove($scope.availableInvite, {_id: $scope.currentUser._id});
                _.remove($scope.newBoardPeople, {_id: $scope.currentUser._id});
                console.log($scope.availableInvite);
                console.log($scope.newBoardPeople);
            });
        });
    };

    function filterInPeoplePackage(peoplePackage) {
        _.each(peoplePackage.builders, function(item) {
            if (item._id && item.hasSelect) {
                if (item._id._id == $scope.user._id) {
                    $scope.peoplePackages.push(peoplePackage);
                }
            }
        });
        _.each(peoplePackage.clients, function(item) {
            if (item._id && item.hasSelect) {
                if (item._id._id == $scope.user._id) {
                    $scope.peoplePackages.push(peoplePackage);
                }
            }
        });
        _.each(peoplePackage.architects, function(item) {
            if (item._id && item.hasSelect) {
                if (item._id._id == $scope.user._id) {
                    $scope.peoplePackages.push(peoplePackage);
                }
            }
        });
        _.each(peoplePackage.subcontractors, function(item) {
            if (item._id && item.hasSelect) {
                if (item._id._id == $scope.user._id) {
                    $scope.peoplePackages.push(peoplePackage);
                }
            }
        });
        _.each(peoplePackage.consultants, function(item) {
            if (item._id && item.hasSelect) {
                if (item._id._id == $scope.user._id) {
                    $scope.peoplePackages.push(peoplePackage);
                }
            }
        });
    };

    function filterInBoardPackage(boardPackage) {
        _.each(boardPackage, function(board) {
            _.each(board.invitees, function(item) {
                if (item._id) {
                    if (item._id._id == $scope.user._id || board.owner._id == $scope.user._id) {
                        $scope.boardPackages.push(board);
                    }
                }
            });
        });
        $scope.boardPackages = _.uniq($scope.boardPackages, '_id');
    };

    $scope.projects = [];
    $scope.peoplePackages = [];
    $scope.boardPackages = [];

    authService.getCurrentUser().$promise.then(function(user){
        $rootScope.user = $scope.user = user;
        $scope.projects = user.projects;
        $scope.projects = _.uniq($scope.projects, '_id');
        $rootScope.isLeader = (user.team.role == 'leader');
        authService.getCurrentTeam().$promise.then(function(team){
            $rootScope.currentTeam = $scope.currentTeam = team;
        });
        _.each($scope.projects, function(project) {
            peopleService.getInvitePeople({id: project._id}).$promise.then(function(res) {
                res.name = project.name;
                filterInPeoplePackage(res);
            });
            boardService.getBoards({id: project._id}).$promise.then(function(res) {
                filterInBoardPackage(res);
            });
        });
    });

    notificationService.getTotalForIos().$promise
    .then(function(res) {
        if (res.length > 0) {
            $scope.totalNotifications = res.length;
        }
    });

    function findAllByProject(project) {
        $scope.peoplePackages = [];
        $scope.boardPackages = [];
        $scope.files = [];
        peopleService.getInvitePeople({id: project._id}).$promise.then(function(res) {
            res.name = project.name;
            filterInPeoplePackage(res);
        });
        boardService.getBoards({id: project._id}).$promise.then(function(res) {
            filterInBoardPackage(res);
        });
        fileService.getFileInProject({id: project._id}).$promise.then(function(res) {
            $scope.files = res;
        });
    };

    $scope.selectProject = function(project) {
        $scope.headingName = " ";
        $scope.selectedProject = project;
        $rootScope.currentProjectId = $scope.projectId = project._id;
        findAllByProject(project);
        $scope.modalProject.hide();
        getAvailableAddedToNewBoard(project._id);
        $rootScope.$broadcast('getProject', project._id);
    };

    if ($rootScope.selectProject._id) {
        $scope.headingName = " ";
        $scope.selectedProject = $rootScope.selectProject;
        $scope.projectId = $scope.selectedProject._id;
        findAllByProject($scope.selectedProject);
        getAvailableAddedToNewBoard(project._id);
        $rootScope.$broadcast('getProject', $scope.projectId);
    }

    $scope.currentPackageType = 0;
    $scope.getCurrentPackageType = function(value) {
        $scope.currentPackageType = value;
    };

    $scope.headingName = "Project";

    $ionicModal.fromTemplateUrl('modalCreateBoard.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalCreateBoard = modal;
    });

    $scope.setNewBoard = function(){
        $scope.board = {
            invitees: []
        };
    };

    $scope.assignToNewBoard = function(staff,index) {
        if (!staff.isSelect) {
            staff.isSelect = true;
            $scope.board.invitees.push(staff);
        }
        else if (staff.isSelect) {
            staff.isSelect = false;
            _.remove($scope.board.invitees, {_id: staff._id});
        }
        console.log($scope.board);
    };
    $scope.createNewBoard = function(form) {
        $scope.submitted = true;
        if (form.$valid) {
            boardService.createBoard({id: $scope.selectedProject._id}, $scope.board).$promise.then(function(res){
                boardService.getBoards({id: $scope.selectedProject._id}).$promise.then(function(res) {
                    filterInBoardPackage(res);
                });
                $scope.modalCreateBoard.hide();
                $scope.submitted = false;
                $scope.board.name = null;
                $scope.board.invitees = [];
            }, function(err){
                console.log(err);
            });
        }
    };

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $ionicModal.fromTemplateUrl('modalProject.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalProject = modal;
  });

  $scope.chooseProject = function(){
    $scope.modalProject.show();
  };

  $ionicModal.fromTemplateUrl('modalPackage.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalPackage = modal;
  });

  $scope.choosePackageModal = function(){
    $scope.modalPackage.show();
  };

  if ($rootScope.currentPackage) {
    $scope.currentPackage = $rootScope.currentPackage;

    $rootScope.isCurrentSelectPackage = $scope.currentPackage;
    $rootScope.$broadcast('getPackage', $rootScope.currentPackage);
  }

  $scope.getPackage = function(value) {
    $rootScope.currentPackage = $scope.currentPackage = value;
    $scope.modalPackage.hide();
    $rootScope.$broadcast('getPackage', $rootScope.currentPackage);
  };

  //create new task
  $ionicModal.fromTemplateUrl('modalCreateTask.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalCreateTask = modal;
  });

  $scope.isShowInputDate = false;
  $scope.callDateInput = function(){
    $scope.isShowInputDate = true;
    $("input#dueDate").trigger('click');
  };

  $scope.$on('taskAvaiableAssignees', function(event, value){
    $scope.available = value;
  });

  $scope.task = {
    assignees : []
  };

  $scope.assign = function(staff,index) {
    if (staff.isSelect == false) {
      staff.isSelect = true;
      $scope.task.assignees.push(staff);
    }
    else if (staff.isSelect == true) {
      staff.isSelect = false;
      _.remove($scope.task.assignees, {_id: staff._id});
    }
  };

  $scope.submitted = false;
  $scope.createNewTask = function(form) {
    console.log('aaaaaaaaaaaaaaaaa');
    $scope.submitted = true;
    console.log(form);
    if (form.$valid) {
      var packageType = '';
      if ($scope.currentPackage.type == 'BuilderPackage') {
        packageType = 'builder';
      } else if ($scope.currentPackage.type == 'staffPackage') {
        packageType = 'staff';
      } else {
        packageType = $scope.currentPackage.type;
      }
      taskService.create({id : $scope.currentPackage._id, type : packageType},$scope.task)
      .$promise.then(function(res) {
        $rootScope.$broadcast('inComingNewTask', res);
        $scope.modalCreateTask.hide();
        console.log($scope.task.assignees);
        _.each($scope.task.assignees, function(assignee){
          assignee.isSelect = false;
        }); 
        $scope.task.name = null;
        $scope.task.dateEnd = null;
        $scope.submitted = false;
      });
    }
  };

  //create new thread
  $ionicModal.fromTemplateUrl('modalCreateThread.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalCreateThread = modal;
  });

  $scope.$on('availableAssigneeInThread', function(event, value){
    $scope.availableAssigneesInThread = value;
  });

  $scope.thread = {
    users : []
  };

  $scope.assignInThread = function(user,index) {
    if (user.isSelect == false) {
      user.isSelect = true;
      $scope.thread.users.push(user);
    }
    else if (user.isSelect == true) {
      user.isSelect = false;
      _.remove($scope.thread.users, {_id: user._id});
    }
  };

  $scope.createNewThread = function(form) {
    $scope.submitted = true;
    if (form.$valid && $scope.submitted) {
      var packageType = '';
      if ($scope.currentPackage.type == 'BuilderPackage') {
        packageType = 'builder';
      } else if ($scope.currentPackage.type == 'staffPackage') {
        packageType = 'staff';
      } else {
        packageType = $scope.currentPackage.type;
      }
      messageService.create({id: $scope.currentPackage._id, type: packageType}, $scope.thread)
      .$promise.then(function (res) {
        $rootScope.$broadcast('inComingNewThread', res);
        $scope.modalCreateThread.hide();
        $scope.thread.name = null;
        $scope.submitted = false;
      });
    }
  };

  //upload new document
  $ionicModal.fromTemplateUrl('modalCreateDocument.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalCreateDocument = modal;
  });

  $scope.createTaskThreadDocument = function(){
    if ($scope.currentTab == 'thread') {
        $scope.modalCreateThread.show();
    } else if ($scope.currentTab == 'task') {
        $scope.modalCreateTask.show();
    } else if ($scope.currentTab == 'document') {
        $scope.modalCreateDocument.show();
    } else if ($scope.selectedProject._id && $scope.currentPackage.name == "BOARD") {
        $scope.modalCreateBoard.show();
        $scope.setNewBoard();
    }
  };

  //show config
  $ionicModal.fromTemplateUrl('modalConfig.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modalConfig = modal;
  });

  $scope.showConfig = function() {
    $scope.modalConfig.show();
  };

  //function hide modal
  $scope.closeModal = function(value) {
    switch(value) {
      case 'Project':
      $scope.modalProject.hide();
      break;

      case 'Package':
      $scope.modalPackage.hide();
      break;

      case 'CreateTask':
      $scope.modalCreateTask.hide();
      break;

      case 'CreateThread':
      $scope.modalCreateThread.hide();
      break;

      case 'CreateDocument':
      $scope.modalCreateDocument.hide();
      break;

      case 'Config':
      $scope.modalConfig.hide();
      break;

      default:
      break;
    }
  };
});
