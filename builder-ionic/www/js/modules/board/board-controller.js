angular.module('buiiltApp')
.controller('BoardCtrl', function(currentUser, $stateParams, boardService, peopleService, notificationService, projectService,fileService, builderPackageService,contractorService,materialPackageService,staffPackageService, designService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, taskService, messageService, socket) {
    boardService.getBoardIOS({id: $stateParams.boardId}).$promise.then(function(res) {
        $scope.board = res;
        getTasksAndFilesByBoard(res);
        getAvailable(res);
        filterMessages(res);
        socket.emit('join', res._id);
    });

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
                        $scope.available.push(invitee._id);
                    }
                });
            }
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
        boardService.sendMessage({id: $scope.board._id}, $scope.message).$promise.then(function(res) {
            $scope.board = res;
            $scope.message.text = null;
            $scope.message.mentions = [];
            filterMessages($scope.board);
        }, function(err){
            console.log(err);
        });
    };
    
});
