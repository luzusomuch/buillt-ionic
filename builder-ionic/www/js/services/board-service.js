angular.module('buiiltApp')
.factory('boardService', function($rootScope, $q, $resource, API_URL) {
    return $resource(API_URL + 'api/boards/:id/:action',{id: '@_id'},
        {
            getBoards: {
                method: 'get',
                isArray: true
            },
            createBoard: {
                method: 'POST',
            },
            invitePeople: {
                method: 'put'
            },
            getInvitePeople: {
                method: 'get',
                params: {
                    action: 'get-invite-people'
                }
            },
            sendMessage: {
                method: 'post',
                params: {
                    action: 'send-message'
                }
            },
            getBoardIOS: {
                method: 'get',
                params: {
                    action: 'get-board-ios'
                }
            }
        });
});