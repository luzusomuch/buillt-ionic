angular.module('buiiltApp')
    .controller('DashboardCtrl', function($ionicLoading, team, currentUser, boardService, peopleService, notificationService, projectService,fileService, builderPackageService,contractorService,materialPackageService,staffPackageService, designService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, taskService, messageService, peopleChatService, totalNotifications) {
    $scope.defaultSelectedPackage = 0;
    $scope.team = team;
    $scope.currentUser = currentUser;
    $scope.totalNotifications = totalNotifications;
    $rootScope.$on('notification:read',function(event,notification) {
        _.remove($scope.totalNotifications,{_id : notification._id});
        $scope.totalNotifications--;
    });
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
                $scope.currentPackage.name = "BOARDS";
            break;
            case 3:
                $scope.currentPackage.name = "DOCUMENTATION";
            break;
        };
        $scope.modalPackage.hide();
    };

    if ($scope.team._id) {
        $scope.availableTeamMember = $scope.team.leader;
        _.each($scope.team.member, function(member) {
            if (member._id && member.status == 'Active') {
                $scope.availableTeamMember.push(member._id);
            }
        });
        _.remove($scope.availableTeamMember, {_id: $scope.currentUser._id});
    }

    function getAvailableUser(project) {
        peopleService.getInvitePeople({id: project._id}).$promise.then(function(res){
            $scope.invitePeople = res;
            $scope.currentUser.hasSelect = false;
            $scope.availableUserType = [];
            $scope.currentTeamMembers = [];
            $scope.available = [];
            builderPackageService.findDefaultByProject({id: project._id}).$promise.then(function(builderPackage){
                $scope.builderPackage = builderPackage;
                _.each($scope.invitePeople.builders, function(builder){
                    if (builder._id) {
                        $scope.available.push(builder._id);
                        _.each(builder.teamMember, function(member) {
                            $scope.available.push(member);
                        });
                        if (builder._id._id == $scope.currentUser._id && builder.hasSelect) {
                            $scope.currentUser.hasSelect = true;
                        }
                    }
                });
                _.each($scope.invitePeople.architects, function(architect){
                    if (architect._id) {
                        $scope.available.push(architect._id);
                        _.each(architect.teamMember, function(member) {
                            $scope.available.push(member);
                        });
                        if (architect._id._id == $scope.currentUser._id && architect.hasSelect) {
                            $scope.currentUser.hasSelect = true;
                        }
                    }
                });
                _.each($scope.invitePeople.clients, function(client){
                    if (client._id) {
                        $scope.available.push(client._id);
                        _.each(client.teamMember, function(member) {
                            $scope.available.push(member);
                        });
                        if (client._id._id == $scope.currentUser._id && client.hasSelect) {
                            $scope.currentUser.hasSelect = true;
                        }
                    }
                });
                _.each($scope.invitePeople.subcontractors, function(subcontractor){
                    if (subcontractor._id) {
                        $scope.available.push(subcontractor._id);
                        _.each(subcontractor.teamMember, function(member) {
                            $scope.available.push(member);
                        });
                    }
                });
                _.each($scope.invitePeople.consultants, function(consultant){
                    if (consultant._id) {
                        $scope.available.push(consultant._id);
                        _.each(consultant.teamMember, function(member) {
                            $scope.available.push(member);
                        });
                    }
                });
                $scope.available = _.uniq($scope.available, '_id');

                if (_.findIndex($scope.invitePeople.builders, function(item) {
                    if (item._id) {
                        return item._id._id == $scope.currentUser._id;
                    }}) != -1) {
                    $scope.currentUser.type = 'builder';
                } else if (_.findIndex($scope.invitePeople.architects, function(item) {
                    if (item._id) {return item._id._id == $scope.currentUser._id;}
                    }) != -1) {
                    $scope.currentUser.type = 'architect';
                } else if (_.findIndex($scope.invitePeople.clients, function(item){
                    if (item._id) {return item._id._id == $scope.currentUser._id;}
                    }) != -1) {
                    $scope.currentUser.type = 'client';
                } else if (_.findIndex($scope.invitePeople.subcontractors, function(item){
                    if (item._id) {return item._id._id == $scope.currentUser._id;}
                    }) != -1) {
                    $scope.currentUser.type = 'subcontractor';
                } else if (_.findIndex($scope.invitePeople.consultants, function(item){
                    if (item._id) {return item._id._id == $scope.currentUser._id;}
                    }) != -1) {
                    $scope.currentUser.type = 'consultant';
                } else {
                    _.each($scope.invitePeople.builders, function(item) {
                        if (_.findIndex(item.teamMember, function(member) {
                            return member._id == $scope.currentUser._id;
                        }) != -1) {
                            $scope.currentUser.type = 'builder';
                            return false;
                        }
                    });

                    _.each($scope.invitePeople.clients, function(item) {
                        if (_.findIndex(item.teamMember, function(member) {
                            return member._id == $scope.currentUser._id;
                        }) != -1) {
                            $scope.currentUser.type = 'client';
                            return false;
                        }
                    });

                    _.each($scope.invitePeople.architects, function(item) {
                        if (_.findIndex(item.teamMember, function(member) {
                            return member._id == $scope.currentUser._id;
                        }) != -1) {
                            $scope.currentUser.type = 'architect';
                            return false;
                        }
                    });

                    _.each($scope.invitePeople.subcontractors, function(item) {
                        if (_.findIndex(item.teamMember, function(member) {
                            return member._id == $scope.currentUser._id;
                        }) != -1) {
                            $scope.currentUser.type = 'subcontractor';
                            return false;
                        }
                    });

                    _.each($scope.invitePeople.consultants, function(item) {
                        if (_.findIndex(item.teamMember, function(member) {
                            return member._id == $scope.currentUser._id;
                        }) != -1) {
                            $scope.currentUser.type = 'consultant';
                            return false;
                        }
                    });
                }

                if ($scope.builderPackage.projectManager.type == 'architect') {
                    switch ($scope.currentUser.type) {
                        case 'client': 
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}, 
                                {value: 'addConsultant', text: 'Consultant'}
                            ];
                            break;
                        case 'builder':
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}, 
                                {value: 'addSubcontractor', text: 'Subcontractor'}, 
                                {value: 'addConsultant', text: 'Consultant'}
                            ];
                            break;
                        case 'architect':
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}, 
                                {value: 'addClient', text: 'Client'}, 
                                {value: 'addBuilder', text: 'Builder'}, 
                                {value: 'addConsultant', text: 'Consultant'}
                            ];
                            if ($scope.invitePeople.clients.length > 0) {
                                if ($scope.invitePeople.clients[0].hasSelect) {
                                    _.remove($scope.availableUserType, function(item) {
                                        return item.value == 'addClient';
                                    });
                                }
                            }
                            if ($scope.invitePeople.builders.length > 0) {
                                if ($scope.invitePeople.builders[0].hasSelect) {
                                    _.remove($scope.availableUserType, function(item) {
                                        return item.value == 'addBuilder';
                                    });
                                }
                            }
                            break;
                        case 'subcontractor':
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}
                            ];
                            break;
                        case 'consultant':
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}
                            ];
                            break;
                        default: 
                            break;
                    }
                } else if ($scope.builderPackage.projectManager.type == 'builder') {
                    switch ($scope.currentUser.type) {
                        case 'client': 
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}, 
                                {value: 'addConsultant', text: 'Consultant'}
                            ];
                            break;
                        case 'builder':
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}, 
                                {value: 'addClient', text: 'Client'}, 
                                {value: 'addArchitect', text: 'Architect'}, 
                                {value: 'addSubcontractor', text: 'Subcontractor'}, 
                                {value: 'addConsultant', text: 'Consultant'}
                            ];
                            if ($scope.invitePeople.clients.length > 0) {
                                if ($scope.invitePeople.clients[0].hasSelect) {
                                    _.remove($scope.availableUserType, function(item) {
                                        return item.value == 'addClient';
                                    });
                                }
                            }
                            if ($scope.invitePeople.architects.length > 0) {
                                if ($scope.invitePeople.architects[0].hasSelect) {
                                    _.remove($scope.availableUserType, function(item) {
                                        return item.value == 'addArchitect';
                                    });
                                }
                            }
                            break;
                        case 'architect':
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}, 
                                {value: 'addConsultant', text: 'Consultant'}
                            ];
                            break;
                        case 'subcontractor':
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}
                            ];
                            break;
                        case 'consultant':
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}
                            ];
                            break;
                        default: 
                            break;
                    }
                } else {
                    switch ($scope.currentUser.type) {
                        case 'client': 
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}, 
                                {value: 'addBuilder', text: 'Builder'}, 
                                {value: 'addArchitect', text: 'Architect'}, 
                                {value: 'addConsultant', text: 'Consultant'}
                            ];
                            if ($scope.invitePeople.builders.length > 0) {
                                if ($scope.invitePeople.builders[0].hasSelect) {
                                    _.remove($scope.availableUserType, function(item) {
                                        return item.value == 'addBuilder';
                                    });
                                }
                            }
                            if ($scope.invitePeople.architects.length > 0) {
                                if ($scope.invitePeople.architects[0].hasSelect) {
                                    _.remove($scope.availableUserType, function(item) {
                                        return item.value == 'addArchitect';
                                    });
                                }
                            }
                            break;
                        case 'builder':
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}, 
                                {value: 'addSubcontractor', text: 'Subcontractor'}, 
                                {value: 'addConsultant', text: 'Consultant'}
                            ];
                            break;
                        case 'architect':
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}, 
                                {value: 'addConsultant', text: 'Consultant'}
                            ];
                            break;
                        case 'subcontractor':
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}
                            ];
                            break;
                        case 'consultant':
                            $scope.availableUserType = [
                                {value: 'addTeamMember', text: 'Team'}
                            ];
                            break;
                        default: 
                            break;
                    }
                }

                switch ($scope.currentUser.type) {
                    case 'builder':
                        notificationService.get().$promise.then(function(res){
                            var builders = [];
                            _.each($scope.invitePeople.builders, function(builder) {
                                if (builder._id) {
                                    if (builder._id._id == $scope.currentUser._id || _.findIndex(builder.teamMember, function(item){ return item._id == $scope.currentUser._id;}) != -1) {
                                        builders.push(builder._id);
                                        _.each(builder.teamMember, function(member) {
                                            builders.push(member);
                                        });
                                    }

                                    if (builder._id._id == $scope.currentUser._id) {
                                        $scope.currentUser.isLeader = true;
                                    } else {
                                        $scope.currentUser.isLeader = false;
                                    }
                                }
                            });
                            _.each(builders, function(builder) {
                                builder.unreadMessagesNumber = 0;
                                _.each(res, function(item) {
                                    if (item.fromUser._id.toString() == builder._id.toString() && item.referenceTo == 'people-chat') {
                                        builder.unreadMessagesNumber++;
                                    } else if (item.fromUser._id.toString() == builder._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                        builder.unreadMessagesNumber++;
                                    }
                                })
                            });
                            $scope.invitePeople.builders = builders;
                            $scope.currentTeamMembers = builders;
                            $scope.currentTeamMembers = _.uniq($scope.currentTeamMembers, '_id');
                            _.remove($scope.currentTeamMembers, {_id: $scope.currentUser._id});

                            $scope.teamMembersCanInvite = [];
                            _.each($scope.availableTeamMember, function(member, index) {
                                if (_.findIndex($scope.currentTeamMembers, {_id: member._id}) == -1) {
                                    $scope.teamMembersCanInvite.push(member);
                                }
                            });

                            _.each($scope.invitePeople.clients, function(client) {
                                if (client._id) {
                                    client.unreadMessagesNumber = 0;
                                    _.each(res, function(item) {
                                        if (item.fromUser._id.toString() == client._id._id.toString() && item.referenceTo == 'people-chat') {
                                            client.unreadMessagesNumber++;
                                        } else if (item.fromUser._id.toString() == client._id._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                            client.unreadMessagesNumber++;
                                        }
                                    });
                                }
                            });

                            _.each($scope.invitePeople.architects, function(architect) {
                                if (architect._id) {
                                    architect.unreadMessagesNumber = 0;
                                    _.each(res, function(item) {
                                        if (item.fromUser._id.toString() == architect._id._id.toString() && item.referenceTo == 'people-chat') {
                                            architect.unreadMessagesNumber++;
                                        } else if (item.fromUser._id.toString() == architect._id._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                            architect.unreadMessagesNumber++;
                                        }
                                    });
                                }
                            });

                            _.each($scope.invitePeople.subcontractors, function(subcontractor) {
                                subcontractor.unreadMessagesNumber = 0;
                                _.each(res, function(item) {
                                    if (subcontractor._id) {
                                        if (subcontractor._id.toString() == item.fromUser._id.toString() && item.referenceTo == 'people-chat') {
                                            subcontractor.unreadMessagesNumber++;
                                        } else if (item.fromUser._id.toString() == subcontractor._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                            subcontractor.unreadMessagesNumber++;
                                        }
                                    }
                                });
                            });

                            _.each($scope.invitePeople.consultants, function(consultant) {
                                consultant.unreadMessagesNumber = 0;
                                _.each(res, function(item) {
                                    if (consultant._id) {
                                        if (consultant._id.toString() == item.fromUser._id.toString() && item.referenceTo == 'people-chat') {
                                            consultant.unreadMessagesNumber++;
                                        } else if (item.fromUser._id.toString() == consultant._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                            consultant.unreadMessagesNumber++;
                                        }
                                    }
                                });
                            });
                        });
                        break;

                    case 'architect':
                        notificationService.get().$promise.then(function(res){
                            var architects = [];
                            _.each($scope.invitePeople.architects, function(architect) {
                                if (architect._id) {
                                    if (architect._id._id == $scope.currentUser._id || _.findIndex(architect.teamMember, function(item){ return item._id == $scope.currentUser._id;}) != -1) {
                                        architects.push(architect._id);
                                        _.each(architect.teamMember, function(member) {
                                            architects.push(member);
                                        });
                                    }

                                    if (architect._id._id == $scope.currentUser._id) {
                                        $scope.currentUser.isLeader = true;
                                    } else {
                                        $scope.currentUser.isLeader = false;
                                    }
                                }
                            });
                            _.each(architects, function(architect) {
                                architect.unreadMessagesNumber = 0;
                                _.each(res, function(item) {
                                    if (item.fromUser._id.toString() == architect._id.toString() && item.referenceTo == 'people-chat') {
                                        architect.unreadMessagesNumber++;
                                    }  else if (item.fromUser._id.toString() == architect._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                        architect.unreadMessagesNumber++;
                                    }
                                });
                            });

                            $scope.invitePeople.architects = architects;
                            $scope.currentTeamMembers = architects;
                            $scope.currentTeamMembers = _.uniq($scope.currentTeamMembers, '_id');
                            _.remove($scope.currentTeamMembers, {_id: $scope.currentUser._id});

                            $scope.teamMembersCanInvite = [];
                            _.each($scope.availableTeamMember, function(member, index) {
                                if (_.findIndex($scope.currentTeamMembers, {_id: member._id}) == -1) {
                                    $scope.teamMembersCanInvite.push(member);
                                }
                            });

                            _.each($scope.invitePeople.builders, function(builder) {
                                if (builder._id) {
                                    builder.unreadMessagesNumber = 0;
                                    _.each(res, function(item) {
                                        if (item.fromUser._id.toString() == builder._id._id.toString() && item.referenceTo == 'people-chat') {
                                            builder.unreadMessagesNumber++;
                                        } else if (item.fromUser._id.toString() == builder._id._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                            builder.unreadMessagesNumber++;
                                        }
                                    });
                                }
                            });

                            _.each($scope.invitePeople.clients, function(client) {
                                if (client._id) {
                                    client.unreadMessagesNumber = 0;
                                    _.each(res, function(item) {
                                        if (item.fromUser._id.toString() == client._id._id.toString() && item.referenceTo == 'people-chat') {
                                            client.unreadMessagesNumber++;
                                        } else if (item.fromUser._id.toString() == client._id._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                            client.unreadMessagesNumber++;
                                        }
                                    });
                                }
                            });

                            _.each($scope.invitePeople.consultants, function(consultant) {
                                consultant.unreadMessagesNumber = 0;
                                _.each(res, function(item) {
                                    if (consultant._id) {
                                        if (consultant._id.toString() == item.fromUser._id.toString() && item.referenceTo == 'people-chat') {
                                            consultant.unreadMessagesNumber++;
                                        } else if (item.fromUser._id.toString() == consultant._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                            consultant.unreadMessagesNumber++;
                                        }
                                    }
                                });
                            });
                        });
                        break;

                    case 'client':
                        notificationService.get().$promise.then(function(res){
                            var clients = [];
                            _.each($scope.invitePeople.clients, function(client) {
                                if (client._id) {
                                    if (client._id._id == $scope.currentUser._id || _.findIndex(client.teamMember, function(item){ return item._id == $scope.currentUser._id;}) != -1) {
                                        clients.push(client._id);
                                        _.each(client.teamMember, function(member) {
                                            clients.push(member);
                                        });
                                    }

                                    if (client._id._id == $scope.currentUser._id) {
                                        $scope.currentUser.isLeader = true;
                                    } else {
                                        $scope.currentUser.isLeader = false;
                                    }
                                }
                            });
                            _.each(clients, function(client) {
                                client.unreadMessagesNumber = 0;
                                _.each(res, function(item) {
                                    if (item.fromUser._id.toString() == client._id.toString() && item.referenceTo == 'people-chat') {
                                        client.unreadMessagesNumber++;
                                    } else if (item.fromUser._id.toString() == client._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                        client.unreadMessagesNumber++;
                                    }
                                });
                            });
                            $scope.invitePeople.clients = clients;
                            $scope.currentTeamMembers = clients;
                            $scope.currentTeamMembers = _.uniq($scope.currentTeamMembers, '_id');
                            _.remove($scope.currentTeamMembers, {_id: $scope.currentUser._id});

                            $scope.teamMembersCanInvite = [];
                            _.each($scope.availableTeamMember, function(member, index) {
                                if (_.findIndex($scope.currentTeamMembers, {_id: member._id}) == -1) {
                                    $scope.teamMembersCanInvite.push(member);
                                }
                            });

                            _.each($scope.invitePeople.architects, function(architect) {
                                if (architect._id) {
                                    architect.unreadMessagesNumber = 0;
                                    _.each(res, function(item) {
                                        if (item.fromUser._id.toString() == architect._id._id.toString() && item.referenceTo == 'people-chat') {
                                            architect.unreadMessagesNumber++;
                                        } else if (item.fromUser._id.toString() == architect._id._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                            architect.unreadMessagesNumber++;
                                        }
                                    });
                                }
                            });

                            _.each($scope.invitePeople.builders, function(builder) {
                                if (builder._id) {
                                    builder.unreadMessagesNumber = 0;
                                    _.each(res, function(item) {
                                        if (item.fromUser._id.toString() == builder._id._id.toString() && item.referenceTo == 'people-chat') {
                                            builder.unreadMessagesNumber++;
                                        } else if (item.fromUser._id.toString() == builder._id._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                            builder.unreadMessagesNumber++;
                                        }
                                    });
                                }
                            });

                            _.each($scope.invitePeople.consultants, function(consultant) {
                                if (consultant._id) {
                                    consultant.unreadMessagesNumber = 0;
                                    _.each(res, function(item) {
                                        if (consultant._id.toString() == item.fromUser._id.toString() && item.referenceTo == 'people-chat') {
                                            consultant.unreadMessagesNumber++;
                                        } else if (item.fromUser._id.toString() == consultant._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                            consultant.unreadMessagesNumber++;
                                        }
                                    });
                                }
                            });
                        });
                        break;

                    case 'subcontractor':
                        notificationService.get().$promise.then(function(res){
                            var subcontractors = [];
                            $scope.inviterTypeText = 'BUILDER';
                            _.each($scope.invitePeople.subcontractors, function(subcontractor) {
                                if (subcontractor._id) {
                                    if (subcontractor._id._id == $scope.currentUser._id || _.findIndex(subcontractor.teamMember, function(item){ return item._id == $scope.currentUser._id;}) != -1) {
                                        subcontractors.push(subcontractor._id);
                                        _.each(subcontractor.teamMember, function(member) {
                                            subcontractors.push(member);
                                        });
                                    }

                                    $scope.invitePeople.inviter = subcontractor.inviter;

                                    if (subcontractor._id._id == $scope.currentUser._id) {
                                        $scope.currentUser.isLeader = true;
                                        return false;
                                    } else {
                                        $scope.currentUser.isLeader = false;
                                    }
                                }
                            });
                            _.each(subcontractors, function(subcontractor) {
                                subcontractor.unreadMessagesNumber = 0;
                                _.each(res, function(item) {
                                    if (subcontractor._id.toString() == item.fromUser._id.toString() && item.referenceTo == 'people-chat') {
                                        subcontractor.unreadMessagesNumber++;
                                    } else if (item.fromUser._id.toString() == subcontractor._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                        subcontractor.unreadMessagesNumber++;
                                    }
                                });
                            });

                            $scope.invitePeople.subcontractors = subcontractors;
                            $scope.invitePeople.inviter.unreadMessagesNumber = 0;
                            _.each(res, function(item) {
                                if ($scope.invitePeople.inviter._id.toString() == item.fromUser._id.toString() && item.referenceTo == 'people-chat') {
                                    $scope.invitePeople.inviter.unreadMessagesNumber++;
                                } else if (item.fromUser._id.toString() == $scope.invitePeople.inviter._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                    $scope.invitePeople.inviter.unreadMessagesNumber++;
                                }
                            });
                            $scope.currentTeamMembers = subcontractors;
                            $scope.currentTeamMembers = _.uniq($scope.currentTeamMembers, '_id');
                            _.remove($scope.currentTeamMembers, {_id: $scope.currentUser._id});

                            $scope.teamMembersCanInvite = [];
                            _.each($scope.availableTeamMember, function(member, index) {
                                if (_.findIndex($scope.currentTeamMembers, {_id: member._id}) == -1) {
                                    $scope.teamMembersCanInvite.push(member);
                                }
                            });
                        });
                        break;
                    case 'consultant':
                        notificationService.get().$promise.then(function(res){
                            $scope.inviterTypeText = 'INVITER';
                            var consultants = [];
                            _.each($scope.invitePeople.consultants, function(consultant) {
                                if (consultant._id) {
                                    if (consultant.inviterType == 'builder') {
                                        $scope.inviterTypeText = "BUILDER";
                                    } else if (consultant.inviterType == 'client') {
                                        $scope.inviterTypeText = "CLIENT";
                                    } else if (consultant.inviterType == 'architect') {
                                        $scope.inviterTypeText = "ARCHITECT";
                                    }

                                    if (consultant._id._id == $scope.currentUser._id) {
                                        $scope.currentUser.isLeader = true;
                                    } else {
                                        $scope.currentUser.isLeader = false;
                                    }
                                    $scope.invitePeople.inviter = consultant.inviter;
                                    $scope.invitePeople.inviter.unreadMessagesNumber = 0;
                                    _.each(res, function(item) {
                                        if ($scope.invitePeople.inviter._id.toString() == item.fromUser._id.toString() && item.referenceTo == 'people-chat') {
                                            $scope.invitePeople.inviter.unreadMessagesNumber++;
                                        } else if (item.fromUser._id.toString() == $scope.invitePeople.inviter._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                            $scope.invitePeople.inviter.unreadMessagesNumber++;
                                        }
                                    });

                                    if (consultant._id._id == $scope.currentUser._id || _.findIndex(consultant.teamMember, function(item){ return item._id == $scope.currentUser._id;}) != -1) {
                                        consultants.push(consultant._id);
                                        if (consultant.teamMember.length > 0) {
                                            _.each(consultant.teamMember, function(member) {
                                                consultants.push(member);
                                            });
                                        }
                                        return false;
                                    }
                                }
                            });
                            _.each(consultants, function(consultant) {
                                consultant.unreadMessagesNumber = 0;
                                _.each(res, function(item) {
                                    if (consultant._id.toString() == item.fromUser._id.toString() && item.referenceTo == 'people-chat') {
                                        consultant.unreadMessagesNumber++;
                                    }  else if (item.fromUser._id.toString() == consultant._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                        consultant.unreadMessagesNumber++;
                                    }
                                });
                            });
                            
                            // $scope.invitePeople.consultants = consultants;
                            $scope.currentTeamMembers = consultants;
                            $scope.currentTeamMembers = _.uniq($scope.currentTeamMembers, '_id');
                            _.remove($scope.currentTeamMembers, {_id: $scope.currentUser._id});

                            $scope.teamMembersCanInvite = [];
                            _.each($scope.availableTeamMember, function(member, index) {
                                if (_.findIndex($scope.currentTeamMembers, {_id: member._id}) == -1) {
                                    $scope.teamMembersCanInvite.push(member);
                                }
                            });
                        });
                        break;
                    default:
                        break;
                }
            });
        });
    };

    $scope.selectPeople = function(user, type) {
        user.type = type;        
        peopleChatService.selectPeople(
            {id: $scope.invitePeople._id},
            {project: $scope.selectedProject._id, user: user}
        ).$promise.then(function(res){
            $state.go('peopleChat', {id: res.project, peopleChatId: res._id});
        }, function(err){
            console.log(err);
        });
    };

    $ionicModal.fromTemplateUrl('modalInviteMorePeople.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalInviteMorePeople = modal;
    });

    $scope.setInviteMorePeople = function() {
        $scope.modalInviteMorePeople.show();
        $scope.invite = {
            isTender : true,
            isInviteTeamMember: false,
            teamMember: [],
            invitees: []
        };
    };

    $scope.invitePeopleStep = 1;
    $scope.getChangeTypeValue = function(type) {
        $scope.invitePeopleStep = 2;
        if (type == 'addTeamMember' || type == 'addClient') {
            $scope.invite.isTender = false;
            if (type == 'addTeamMember') {
                $scope.invite.isInviteTeamMember = true;
            } else {
                $scope.invite.isInviteTeamMember = false;
            }
        } else {
            $scope.invite.isTender = true;
            $scope.invite.isInviteTeamMember = false;
        }
    };

    $scope.addInvitee = function(invitee) {
        if (invitee && invitee != '') {
            $scope.invite.invitees.push({email: invitee});
            $scope.invite.email = null;
        }
    };
    $scope.removeInvitee = function(index) {
        $scope.invite.invitees.splice(index, 1);
    };

    $scope.inviteTeamMember = function(member, index) {
        $scope.invite.teamMember.push(member);
        $scope.teamMembersCanInvite.splice(index,1);
        member.canRevoke = true;
    };
    $scope.revokeTeamMember = function(member, index) {
        $scope.teamMembersCanInvite.push(member);
        $scope.invite.teamMember.splice(index, 1);
        member.canRevoke = false;
    };

    $scope.inviteMorePeople = function(form) {
        $scope.submitted = true;
        if (form.$valid) {
            $scope.invite.inviterType = $scope.currentUser.type;
            if ($scope.invite.type == 'addTeamMember') {
                switch ($scope.currentUser.type) {
                    case 'builder':
                        $scope.invite.type = 'addBuilder';
                        break;
                    case 'client':
                        $scope.invite.type = 'addClient';
                        break;
                    case 'architect':
                        $scope.invite.type = 'addArchitect';
                        break;
                    case 'subcontractor':
                        $scope.invite.type = 'addSubcontractor';
                        break;
                    case 'consultant':
                        $scope.invite.type = 'addConsultant';
                        break;
                    default:
                        break;
                }
                peopleService.update({id: $scope.selectedProject._id},$scope.invite).$promise.then(function(res){
                    getAvailableUser({_id: $scope.selectedProject._id});
                    $scope.submitted = false;
                    $scope.modalInviteMorePeople.hide();
                }, function(res){
                    console.log(res);
                });
            } else {
                peopleService.update({id: $scope.selectedProject._id},$scope.invite).$promise.then(function(res){
                    getAvailableUser({_id: $scope.selectedProject._id});
                    $scope.submitted = false;
                    $scope.modalInviteMorePeople.hide();
                }, function(res){
                    console.log(res);
                });
            }
        }
    };

    function getAvailableAddedToNewBoard(projectId) {
        $scope.newBoardPeople = [];
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
                            _.each(board.builders[0].teamMember, function(member) {
                                $scope.availableInvite.push(member);
                                $scope.newBoardPeople.push(member);
                            });
                        } else {
                            _.each(board.clients[0].teamMember, function(member) {
                                $scope.availableInvite.push(member);
                                $scope.newBoardPeople.push(member);
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
                        _.each(board.architects[0].teamMember, function(member) {
                            $scope.availableInvite.push(member);
                            $scope.newBoardPeople.push(member);
                        });
                    } else if ($scope.currentUser.type == 'subcontractor') {
                        _.each(board.subcontractors, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    $scope.newBoardPeople.push(item.inviter);
                                    _.each(item.teamMember, function(member) {
                                        $scope.availableInvite.push(member);
                                        $scope.newBoardPeople.push(member);
                                    });
                                }
                            }
                        });
                    } else if ($scope.currentUser.type == 'consultant') {
                        _.each(board.consultants, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    $scope.newBoardPeople.push(item.inviter);
                                    _.each(item.teamMember, function(member) {
                                        $scope.availableInvite.push(member);
                                        $scope.newBoardPeople.push(member);
                                    });
                                }
                            }
                        });
                    }
                } else if ($scope.builderPackage.projectManager.type == 'builder') {
                    if ($scope.currentUser.type == 'builder') {
                        _.each(board.builders[0].teamMember, function(member) {
                            $scope.availableInvite.push(member);
                            $scope.newBoardPeople.push(member);
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
                        if ($scope.currentUser.type == "client") {
                            _.each(board.clients[0].teamMember, function(member) {
                                $scope.availableInvite.push(member);
                                $scope.newBoardPeople.push(member);
                            });
                        } else {
                            _.each(board.architects[0].teamMember, function(member) {
                                $scope.availableInvite.push(member);
                                $scope.newBoardPeople.push(member);
                            });
                        }
                    } else if ($scope.currentUser.type == 'subcontractor') {
                        _.each(board.subcontractors, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    $scope.newBoardPeople.push(item.inviter);
                                    _.each(item.teamMember, function(member) {
                                        $scope.availableInvite.push(member);
                                        $scope.newBoardPeople.push(member);
                                    });
                                }
                            }
                        });
                    } else if ($scope.currentUser.type == 'consultant') {
                        _.each(board.consultants, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    $scope.newBoardPeople.push(item.inviter);
                                    _.each(item.teamMember, function(member) {
                                        $scope.availableInvite.push(member);
                                        $scope.newBoardPeople.push(member);
                                    });
                                }
                            }
                        });
                    }
                } else {
                    if ($scope.currentUser.type == 'client') {
                        _.each(board.clients[0].teamMember, function(member) {
                            $scope.availableInvite.push(member);
                            $scope.newBoardPeople.push(member);
                        });
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
                            _.each(board.builders[0].teamMember, function(member) {
                                $scope.availableInvite.push(member);
                                $scope.newBoardPeople.push(member);
                            });
                        } else {
                            _.each(board.architects[0].teamMember, function(member) {
                                $scope.availableInvite.push(member);
                                $scope.newBoardPeople.push(member);
                            });
                        }
                    } else if ($scope.currentUser.type == 'subcontractor') {
                        _.each(board.subcontractors, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    $scope.newBoardPeople.push(item.inviter);
                                    _.each(item.teamMember, function(member) {
                                        $scope.availableInvite.push(member);
                                        $scope.newBoardPeople.push(member);
                                    });
                                }
                            }
                        });
                    } else if ($scope.currentUser.type == 'consultant') {
                        _.each(board.consultants, function(item) {
                            if (item._id && item.hasSelect) {
                                if (item._id._id == $scope.currentUser._id) {
                                    $scope.availableInvite.push(item.inviter);
                                    $scope.newBoardPeople.push(item.inviter);
                                    _.each(item.teamMember, function(member) {
                                        $scope.availableInvite.push(member);
                                        $scope.newBoardPeople.push(member);
                                    });
                                }
                            }
                        });
                    }
                }
                $scope.newBoardPeople = _.uniq($scope.newBoardPeople, '_id');
                _.remove($scope.newBoardPeople, {_id: $scope.currentUser._id});
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

    authService.getCurrentUser().$promise.then(function(user){
        $rootScope.user = $scope.user = user;
        $scope.projects = user.projects;
        $scope.projects = _.uniq($scope.projects, '_id');
        $rootScope.isLeader = (user.team.role == 'leader');
        authService.getCurrentTeam().$promise.then(function(team){
            $rootScope.currentTeam = $scope.currentTeam = team;
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
        $ionicLoading.show();
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
        taskService.myTask({id : project._id}).$promise.then(function(tasks) {
            $scope.tasks = tasks;
            var dueToday = new Date();
            var dueTomorrow = new Date();
            dueTomorrow.setDate(dueTomorrow.getDate() +1); 
            _.each($scope.tasks, function(task) {
                var endDate = new Date(task.dateEnd);
                task.dueDateToday = (endDate.setHours(0,0,0,0) == dueToday.setHours(0,0,0,0)) ? true : false;
                if (dueTomorrow.setHours(0,0,0,0) == endDate.setHours(0,0,0,0)) {
                    task.dueDateTomorrow = true;
                }
                else {
                    task.dueDateTomorrow = false;
                }
            });
        });
        messageService.myThread({id : project._id}).$promise.then(function(threads) {
            $scope.threads = [];
            _.each(threads, function(thread) {
                _.each(thread.messages, function(message, key) {
                    if (_.indexOf(message.mentions, $scope.currentUser._id) != -1) {
                        if (thread.people) {
                            $scope.threads.push({_id: thread._id,project: thread.project, user: message.user.name, type: 'people', message: message.text, messageId: message._id, owner: thread.from});                
                        } else if (thread.type == 'board') {
                            $scope.threads.push({_id: thread._id,project: thread.project, user: message.user.name, type: 'board', message: message.text, messageId: message._id});                
                        }
                    }
                });
            });
        });
        getAvailableUser(project);
        $ionicLoading.hide();
    };

    $scope.goToThreadDetail = function(thread) {
        if (thread.type == "people") {
            $state.go('peopleChat', {id:thread.project, peopleChatId: thread._id});
        } else if (thread.type == "board") {
            $state.go("boardDetail", {boardId: thread._id});
        }
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
    };
    $scope.createNewBoard = function(form) {
        $scope.submitted = true;
        if (form.$valid) {
            $ionicLoading.show();
            boardService.createBoard({id: $scope.selectedProject._id}, $scope.board).$promise.then(function(res){
                boardService.getBoards({id: $scope.selectedProject._id}).$promise.then(function(res) {
                    filterInBoardPackage(res);
                });
                $scope.modalCreateBoard.hide();
                $scope.submitted = false;
                $scope.board.name = null;
                $scope.board.invitees = [];
                $ionicLoading.hide();
            }, function(err){
                console.log(err);
                $ionicLoading.hide();
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
    $scope.submitted = true;
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

  $scope.invitePeopleOrCreateNewBoard = function(){
    if ($scope.selectedProject._id && $scope.currentPackage.name == "BOARDS") {
        $scope.modalCreateBoard.show();
        $scope.setNewBoard();
    } else if ($scope.selectedProject._id && $scope.currentPackage.name == "PEOPLE") {
        $scope.setInviteMorePeople();
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

  $scope.goToNotificationPage = function() {
    $state.go('notifications');
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

        case 'invite-more-people':
        $scope.modalInviteMorePeople.hide();
        break;

        case 'board':
        $scope.modalCreateBoard.hide();
        break;

      default:
      break;
    }
  };
});
