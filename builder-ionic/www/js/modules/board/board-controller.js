angular.module('buiiltApp')
.controller('BoardCtrl', function($ionicLoading, team, currentUser, $stateParams, boardService, peopleService, notificationService, projectService,fileService, builderPackageService,contractorService,materialPackageService,staffPackageService, designService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, taskService, messageService, socket, FileUploader, API_URL, filepickerService, uploadService, $ionicLoading) {
    boardService.getBoardIOS({id: $stateParams.boardId}).$promise.then(function(res) {
        $scope.board = res;
        getTasksAndFilesByBoard(res);
        getAvailable(res);
        filterMessages(res);
        getInvitees(res.project);
        socket.emit('join', res._id);
    });

    $scope.team = team;
    $scope.currentUser = currentUser;

    socket.on('boardChat:new', function (board) {
        if (board._id == $scope.board._id) {
            $scope.board = board;
            filterMessages($scope.board);
        }
    });

    $scope.currentTab = 'thread';
    $scope.selectTabWithIndex = function(value){
        $ionicTabsDelegate.select(value);
        if (value == 0) {
            $scope.currentTab = 'thread';
        } else if (value == 1) {
            $scope.currentTab = 'task';
        } else if (value == 2) {
            $scope.currentTab = 'document';
        } else {
            $scope.currentTab = 'notification';
        }
    };

    function getInvitees(projectId) {
        $scope.availableInvite = [];
        builderPackageService.findDefaultByProject({id: projectId}).$promise.then(function(builderPackage){
            $scope.builderPackage = builderPackage;
            peopleService.getInvitePeople({id: projectId}).$promise.then(function(board){
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
                            }
                        });
                        _.each(board.consultants, function(consultant) {
                            if (consultant._id && consultant.hasSelect && consultant.inviter._id == $scope.currentUser._id) {
                                $scope.availableInvite.push(consultant._id);
                            }
                        });
                        if ($scope.currentUser.type == 'builder') {
                            _.each(board.subcontractors, function(subcontractor) {
                                if (subcontractor._id && subcontractor.hasSelect) {
                                    $scope.availableInvite.push(subcontractor._id);
                                }
                            });
                            _.each(board.builders[0].teamMember, function(member) {
                                $scope.availableInvite.push(member);
                            });
                        } else {
                            _.each(board.clients[0].teamMember, function(member) {
                                $scope.availableInvite.push(member);
                            });
                        }
                    } else if ($scope.currentUser.type == 'architect') {
                        _.each(board.builders, function(builder) {
                            if (builder._id && builder.hasSelect) {
                                $scope.availableInvite.push(builder._id);
                            }
                        });
                        _.each(board.clients, function(client) {
                            if (client._id && client.hasSelect) {
                                $scope.availableInvite.push(client._id);
                            }
                        });
                        _.each(board.consultants, function(consultant) {
                            if (consultant._id && consultant.hasSelect && consultant.inviter._id == $scope.currentUser._id) {
                                $scope.availableInvite.push(consultant._id);
                            }
                        });
                        _.each(board.architects[0].teamMember, function(member) {
                            $scope.availableInvite.push(member);
                        });
                    } else if ($scope.currentUser.type == 'subcontractor') {
                        _.each(board.subcontractors, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    _.each(item.teamMember, function(member) {
                                        $scope.availableInvite.push(member);
                                    });
                                }
                            }
                        });
                    } else if ($scope.currentUser.type == 'consultant') {
                        _.each(board.consultants, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    _.each(item.teamMember, function(member) {
                                        $scope.availableInvite.push(member);
                                    });
                                }
                            }
                        });
                    }
                } else if ($scope.builderPackage.projectManager.type == 'builder') {
                    if ($scope.currentUser.type == 'builder') {
                        _.each(board.builders[0].teamMember, function(member) {
                            $scope.availableInvite.push(member);
                        });
                        _.each(board.architects, function(architect) {
                            if (architect._id && architect.hasSelect) {
                                $scope.availableInvite.push(architect._id);
                            }
                        });
                        _.each(board.consultants, function(consultant) {
                            if (consultant._id && consultant.hasSelect && consultant.inviter._id == $scope.currentUser._id) {
                                $scope.availableInvite.push(consultant._id);
                            }
                        });
                        _.each(board.subcontractors, function(subcontractor) {
                            if (subcontractor._id && subcontractor.hasSelect) {
                                $scope.availableInvite.push(subcontractor._id);
                            }
                        });
                        _.each(board.clients, function(client) {
                            if (client._id && client.hasSelect) {
                                $scope.availableInvite.push(client._id);
                            }
                        });
                    } else if ($scope.currentUser.type == 'client' || $scope.currentUser.type == 'architect') {
                        _.each(board.builders, function(builder) {
                            if (builder._id && builder.hasSelect) {
                                $scope.availableInvite.push(builder._id);
                            }
                        });
                        _.each(board.consultants, function(consultant) {
                            if (consultant._id && consultant.hasSelect && consultant.inviter._id == $scope.currentUser._id) {
                                $scope.availableInvite.push(consultant._id);
                            }
                        });
                        if ($scope.currentUser.type == "client") {
                            _.each(board.clients[0].teamMember, function(member) {
                                $scope.availableInvite.push(member);
                            });
                        } else {
                            _.each(board.architects[0].teamMember, function(member) {
                                $scope.availableInvite.push(member);
                            });
                        }
                    } else if ($scope.currentUser.type == 'subcontractor') {
                        _.each(board.subcontractors, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    _.each(item.teamMember, function(member) {
                                        $scope.availableInvite.push(member);
                                    });
                                }
                            }
                        });
                    } else if ($scope.currentUser.type == 'consultant') {
                        _.each(board.consultants, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    _.each(item.teamMember, function(member) {
                                        $scope.availableInvite.push(member);
                                    });
                                }
                            }
                        });
                    }
                } else {
                    if ($scope.currentUser.type == 'client') {
                        _.each(board.clients[0].teamMember, function(member) {
                            $scope.availableInvite.push(member);
                        });
                        _.each(board.builders, function(builder) {
                            if (builder._id && builder.hasSelect) {
                                $scope.availableInvite.push(builder._id);
                            }
                        });
                        _.each(board.architects, function(architect) {
                            if (architect._id && architect.hasSelect) {
                                $scope.availableInvite.push(architect._id);
                            }
                        });
                        _.each(board.consultants, function(consultant) {
                            if (consultant._id && consultant.hasSelect && consultant.inviter._id == $scope.currentUser._id) {
                                $scope.availableInvite.push(consultant._id);
                            }
                        });
                    } else if ($scope.currentUser.type == 'builder' || $scope.currentUser.type == 'architect') {
                        _.each(board.clients, function(client) {
                            if (client._id && client.hasSelect) {
                                $scope.availableInvite.push(client._id);
                            }
                        });
                        if ($scope.currentUser.type == 'builder') {
                            _.each(board.subcontractors, function(subcontractor) {
                                if (subcontractor._id && subcontractor.hasSelect) {
                                    $scope.availableInvite.push(subcontractor._id);
                                }
                            });
                            _.each(board.builders[0].teamMember, function(member) {
                                $scope.availableInvite.push(member);
                            });
                        } else {
                            _.each(board.architects[0].teamMember, function(member) {
                                $scope.availableInvite.push(member);
                            });
                        }
                    } else if ($scope.currentUser.type == 'subcontractor') {
                        _.each(board.subcontractors, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    _.each(item.teamMember, function(member) {
                                        $scope.availableInvite.push(member);
                                    });
                                }
                            }
                        });
                    } else if ($scope.currentUser.type == 'consultant') {
                        _.each(board.consultants, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    _.each(item.teamMember, function(member) {
                                        $scope.availableInvite.push(member);
                                    });
                                }
                            }
                        });
                    }
                }
                if ($scope.board._id) {
                    _.each($scope.board.invitees, function(invitee) {
                        if (invitee._id) {
                            _.remove($scope.availableInvite, {_id: invitee._id._id});
                        }
                    });
                }
                _.uniq($scope.availableInvite, '_id');
                _.remove($scope.availableInvite, {_id: $scope.currentUser._id});

                _.each($scope.availableInvite, function(invitee){
                    invitee.isSelect = false;
                });
            });
        });
    };

    function getTasksAndFilesByBoard(board) {
        fileService.getFileInBoard({id: board._id}).$promise.then(function(res){
            $scope.files = res;
        });
        taskService.getByPackage({id: board._id, type: 'board'}).$promise.then(function(res){
            $scope.tasks = res;
            _.each($scope.tasks, function(task){
                task.isOwner = false;
                _.each(task.assignees, function(user) {
                    if (user._id == $scope.currentUser._id) {
                        task.isOwner = true
                    }
                });
            });
        });
    };

    function getAvailable(board) {
        $scope.available = [];
        if (board._id) {
            if (board.invitees.length > 0) {
                _.each(board.invitees, function(invitee) {
                    if (invitee._id) {
                        invitee._id.isSelect = false;
                        $scope.available.push(invitee._id);
                    }
                });
            }
            board.owner.isSelect = false;
            $scope.available.push(board.owner);
        }
    };

    function filterMessages(board) {
        board.orderedMessages = [];
        for (var i = board.messages.length -1; i >= 0; i--) {
            board.orderedMessages.push(board.messages[i]);
        };
        _.each(board.orderedMessages, function(message){
            if (message.user._id == $scope.currentUser._id) {
                message.owner = true;
            }
            else {
                message.owner = false;
            }
        });
    };

    $scope.enterMessage = function ($event) {
        if ($event.keyCode === 13) {
            $event.preventDefault();
            $scope.sendMessage();
        } else if (($event.keyCode === 32 || $event.keyCode === 8) && $scope.showPopup) {
            $scope.showPopup = false;
        } else if ($event.keyCode === 9) {
            $event.preventDefault();
            if ($scope.mentionPeople.length > 0) {
                $scope.getMentionValue($scope.mentionPeople[0]);
            } else {
                $scope.getMentionValue($scope.available[0]);
            }
        }
    };


    $scope.message = {
        mentions: []
    };
    $scope.showPopup = false;
    $scope.mentionString = '';

    $scope.getMentionValue = function(mention) {
        $scope.message.text = $scope.message.text.substring(0, $scope.message.text.length - ($scope.mentionString.length +1));
        $scope.message.text += mention.name;  
        $scope.message.mentions.push(mention._id);
        $scope.showPopup = false;
        $timeout(function(){ 
            document.getElementById("textarea1-board-chat").focus();
        },500);
    };

    $scope.$watch('message.text', function(newValue, oldValue) {
        if (newValue) {
            if (newValue.indexOf("@") != -1) {
                $scope.showPopup = true;
                $scope.mentionString = newValue.substring(newValue.indexOf("@") + 1);
                $scope.mentionPeople = [];
                _.each($scope.available, function(item) {
                    if (item.name.toLowerCase().indexOf($scope.mentionString) != -1 || item.name.indexOf($scope.mentionString) != -1) {
                        $scope.mentionPeople.push(item);
                    }
                });
            }
        }
    });

    $scope.sendMessage = function() {
        $ionicLoading.show();
        boardService.sendMessage({id: $scope.board._id}, $scope.message).$promise.then(function(res) {
            $scope.board = res;
            $scope.message.text = null;
            $scope.message.mentions = [];
            filterMessages($scope.board);
            $ionicLoading.hide();
        }, function(err){
            console.log(err);
            $ionicLoading.hide();
        });
    };

    $ionicModal.fromTemplateUrl('modalCreateTaskInBoard.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalCreateTask = modal;
    });

    $ionicModal.fromTemplateUrl('modalInvitePeopleToBoard.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalInvitePeopleToBoard = modal;
    });

    $ionicModal.fromTemplateUrl('modalAttachment.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalAttachment = modal;
    });

    $scope.inviteMorePeopleToBoardOrCreateNewTaskModal = function() {
        if ($scope.currentTab == 'thread') {
            $scope.invite = {
                invitees: []
            };
            $scope.modalInvitePeopleToBoard.show();
        } else if ($scope.currentTab == 'task') {
            $scope.task = {
                assignees : []
            };
            $scope.modalCreateTask.show();
        }
    };

    $scope.closeModal = function() {
        if ($scope.currentTab == 'thread') {
            $scope.modalInvitePeopleToBoard.hide();
        } else if ($scope.currentTab == 'task') {
            $scope.modalCreateTask.hide();
        } else if ($scope.currentTab == 'document') {
            $scope.modalAttachment.hide();
        }
    };

    $scope.isShowInputDate = false;
    $scope.callDateInput = function(){
        $scope.isShowInputDate = true;
        $("input#dueDate").trigger('click');
    };

    $scope.$on('taskAvaiableAssignees', function(event, value){
        $scope.available = value;
    });

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
        $scope.submitted = true;
        if (form.$valid) {
            $ionicLoading.show();
            taskService.create({id : $scope.board._id, type : 'board'},$scope.task)
                .$promise.then(function(res) {
                $scope.modalCreateTask.hide();
                _.each($scope.task.assignees, function(assignee){
                    assignee.isSelect = false;
                }); 
                $scope.task.name = null;
                $scope.task.dateEnd = null;
                $scope.submitted = false;
                getTasksAndFilesByBoard($scope.board);
                $ionicLoading.hide();
            }, function(err) {
                $ionicLoading.hide();
            });
        }
    };

    $scope.inviteToBoard = function(staff,index) {
        if (staff.isSelect == false) {
            staff.isSelect = true;
            $scope.invite.invitees.push(staff);
        }
        else if (staff.isSelect == true) {
            staff.isSelect = false;
            _.remove($scope.invite.invitees, {_id: staff._id});
        }
    };

    $scope.invitePeople = function(form) {
        $scope.submitted = true;
        if (form.$valid) {
            $ionicLoading.show();
            boardService.invitePeople({id: $scope.board._id}, $scope.invite).$promise.then(function(res){
                $scope.board = res;
                $scope.submitted = false;
                $scope.modalInvitePeopleToBoard.hide();
                $scope.invite.description = null;
                $scope.invite.invitees = [];
                getInvitees(res.project);
                getAvailable(res);
                $ionicLoading.hide();
            }, function(err){
                console.log(err);
                $ionicLoading.hide();
            });
        }
    };

    $scope.addFile = function() {
        $scope.modalAttachment.show();
    };
    $scope.allowUpload = false;
    $scope.getFileUpload = function() {
        var input = document.getElementById("store-input");
        alert(input.value);
        if (input.value) {
            alert(filepickerService.store);
            filepickerService.store(
                input,
                function(Blob) {
                    Blob.belongToType = 'board';
                    Blob.tags = [];
                    $scope.uploadFile = Blob;
                },
                function(err) {
                    console.log(err.toString());
                    alert(err);
                },
                function(progress) {
                    alert("progress");
                    alert(progress);
                    $("#spinning").show();
                    for (var i = 0; i < 100; i++) {
                        if (progress == 100) {
                            $("#spinning").hide();
                            $("#completed").show();
                            $scope.allowUpload = true;
                            return false;
                        }
                    };
                }
            );
        } else {
            $scope.error = "Please choose another file";
        }
    };

    $scope.onUpload = onUpload;
    $scope.localUpload = localUpload;

    function localUpload(value){
        if (!value){
            return;
        }
        // TODO - create directive
        $ionicLoading.show();
        filepicker.store(
            value,
            onUpload
        );
    }
    function onUpload(data){
        // FilesService.add(data);
        data.belongToType = 'board';
        data.tags = [];
        $scope.uploadFile = data;
        $ionicLoading.hide();
        $scope.allowUpload = true;
    }

    $scope.uploadAttachment = function() {
        var input = document.getElementById("store-input");
        if ($scope.allowUpload) {
            uploadService.uploadMobile({id: $stateParams.boardId},$scope.uploadFile).$promise.then(function(res) {
                $scope.modalAttachment.hide();
                $scope.files.push(res);
            }, function(err) {
                console.log(err);
            });
        } else if (!input.value) {
            $scope.error = "Please choose file.";
        } else {
            $scope.error = "Please waiting for upload progress.";
        }
    };
    
});
