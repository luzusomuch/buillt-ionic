angular.module('buiiltApp')
.controller('PeopleCtrl', function(team, currentUser, builderPackage, $stateParams, boardService, peopleService, notificationService, projectService,fileService, builderPackageService,contractorService,materialPackageService,staffPackageService, designService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, taskService, messageService, socket, peopleChatService) {
    $scope.currentUser = currentUser;
    $scope.team = team;
    $scope.builderPackage = builderPackage;

    if ($scope.team._id) {
        $scope.availableTeamMember = $scope.team.leader;
        _.each($scope.team.member, function(member) {
            if (member._id && member.status == 'Active') {
                $scope.availableTeamMember.push(member._id);
            }
        });
        _.remove($scope.availableTeamMember, {_id: $scope.currentUser._id});
    }

    function getAvailableUser() {
        peopleService.getInvitePeople({id: $stateParams.id}).$promise.then(function(res){
            $scope.invitePeople = res;
            $scope.currentUser.hasSelect = false;
            $scope.availableUserType = [];
            $scope.currentTeamMembers = [];
            $scope.available = [];
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
                            console.log(architect);
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
                            consultant.unreadMessagesNumber = 0;
                            _.each(res, function(item) {
                                if (consultant._id.toString() == item.fromUser._id.toString() && item.referenceTo == 'people-chat') {
                                    consultant.unreadMessagesNumber++;
                                } else if (item.fromUser._id.toString() == consultant._id.toString() && item.referenceTo == 'people-chat-without-mention') {
                                    consultant.unreadMessagesNumber++;
                                }
                            });
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
    };

    getAvailableUser();

    $scope.selectPeople = function(user, type) {
        user.type = type;        
        peopleChatService.selectPeople(
            {id: $scope.invitePeople._id},
            {project: $stateParams.id, user: user}
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

    $scope.closeModal = function() {
        $scope.modalInviteMorePeople.hide();
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
                peopleService.update({id: $stateParams.id},$scope.invite).$promise.then(function(res){
                    getAvailableUser();
                    $scope.submitted = false;
                    $scope.closeModal();
                }, function(res){
                    console.log(res);
                });
            } else {
                peopleService.update({id: $stateParams.id},$scope.invite).$promise.then(function(res){
                    getAvailableUser();
                    $scope.submitted = false;
                    $scope.closeModal();
                }, function(res){
                    console.log(res);
                });
            }
        }
    };

});
