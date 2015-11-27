angular.module('buiiltApp')
.controller('PeopleChatCtrl', function(team, currentUser, builderPackage, peopleChat, $stateParams, boardService, peopleService, notificationService, projectService,fileService, builderPackageService,contractorService,materialPackageService,staffPackageService, designService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, taskService, messageService, socket, peopleChatService) {
    $scope.currentUser = currentUser;
    $scope.team = team;
    $scope.peopleChat = peopleChat;
    getTasksAndFiles(peopleChat);
    filterMessages($scope.peopleChat);

    $ionicModal.fromTemplateUrl('modalCreateTaskInPeople.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        $scope.modalCreateTaskInPeople = modal;
    });

    $scope.createNewTaskModal = function(){
        $scope.modalCreateTaskInPeople.show();
        $scope.task = {
            assignees : $scope.peopleChat.members,
            peopleChat: $scope.peopleChat._id
        };
    };

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

    $scope.isShowInputDate = false;
    $scope.callDateInput = function(){
        $scope.isShowInputDate = true;
        $("input#dueDate").trigger('click');
    };

    function getTasksAndFiles(people) {
        fileService.getFileInPeople({id: people.people}).$promise.then(function(res){
            $scope.files = res;
            _.each($scope.files, function(file) {
                file.isOwner = false;
                if (file.peopleChat == $scope.peopleChat._id) {
                    file.isOwner = true;
                }
            });
        });
        taskService.getByPackage({id: people.people, type: 'people'}).$promise.then(function(res){
            $scope.tasks = res;
            _.each($scope.tasks, function(task){
                task.isOwner = false;
                if (task.peopleChat == $scope.peopleChat._id) {
                    task.isOwner = true;
                }
            });
        });
    };

    function filterMessages(peopleChat) {
        peopleChat.orderedMessages = [];
        for (var i = peopleChat.messages.length -1; i >= 0; i--) {
            peopleChat.orderedMessages.push(peopleChat.messages[i]);
        };
        _.each(peopleChat.orderedMessages, function(message){
            if (message.user._id == $scope.currentUser._id) {
                message.owner = true;
            }
            else {
                message.owner = false;
            }
        });
    };

    $scope.createNewTask = function(form) {
        $scope.submitted = true;
        if (form.$valid) {
            $timeout(function(){
                taskService.create({id: $scope.peopleChat.people, type: 'people'},$scope.task).$promise.then(function(res){
                    $scope.modalCreateTaskInPeople.hide();
                    $scope.submitted = false;
                    getTasksAndFiles($scope.peopleChat);
                }, function(res){
                    console.log(res);
                });
            },500);
        }
    };

    socket.on('peopleChat:new', function (peopleChat) {
        if (peopleChat._id == $scope.peopleChat._id) {
            $scope.peopleChat = peopleChat;
            filterMessages($scope.peopleChat);
        }
    });

    $scope.enterMessage = function ($event) {
        if ($event.keyCode === 13) {
            $event.preventDefault();
            $scope.sendMessage();
        } else if (($event.keyCode === 32 || $event.keyCode === 8) && $scope.showPopup) {
            $event.preventDefault();
            $scope.showPopup = false;
        } else if ($event.keyCode === 9) {
            $event.preventDefault();
            var mentionPeople = _.remove($scope.peopleChat.members, {_id: $scope.currentUser._id});
            $scope.getMentionValue(mentionPeople);
        }
    };

    $scope.message = {};

    $scope.showPopup = false;

    $scope.getMentionValue = function(mention) {
        console.log(mention);
        $scope.message.mentions = [];
        $scope.message.text = $scope.message.text.substring(0, $scope.message.text.length -1);
        $scope.message.text += (mention.type == 'team') ? mention.name : mention._id.name;  
        if (mention.type == 'team') {
            $scope.message.mentions.push(mention._id);
        } else {
            $scope.message.mentions.push(mention._id._id);
        }
        $scope.showPopup = false;
        $timeout(function(){ 
            document.getElementById("textarea1-people-chat").focus();
        },500);
    };

    $scope.$watch('message.text', function(newValue, oldValue) {
        $scope.mentionPeople = [];
        if (newValue) {
            if (newValue.slice(-1) == "@") {
                $scope.showPopup = true;   
            }
        }
    });

    $scope.sendMessage = function() {
        peopleChatService.sendMessage({id: $scope.peopleChat._id}, $scope.message).$promise.then(function(res) {
            $scope.peopleChat = res;
            filterMessages($scope.peopleChat);
            $scope.message.text = null;
            // getAllChatMessageNotificationByUserInPeople($scope.selectedChatPeople);
        }, function(err){
            console.log(err);
        });
    };
});