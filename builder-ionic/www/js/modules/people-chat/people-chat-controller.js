angular.module('buiiltApp')
.controller('PeopleChatCtrl', function(team, currentUser, builderPackage, peopleChat, $stateParams, boardService, peopleService, notificationService, projectService,fileService, builderPackageService,contractorService,materialPackageService,staffPackageService, designService,$ionicSideMenuDelegate,$timeout,$scope,$state, authService, $rootScope,$ionicTabsDelegate,notificationService, $ionicModal, taskService, messageService, socket, peopleChatService) {
    $scope.currentUser = currentUser;
    $scope.team = team;
    $scope.peopleChat = peopleChat;
    getTasksAndFiles(peopleChat);
    console.log(peopleChat);

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
            console.log($scope.files);
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
});