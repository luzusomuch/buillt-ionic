angular.module('buiiltApp')
.factory('userService', function($resource,API_URL) {
  return $resource(API_URL + 'users/:id/:action', {
    id: '@uuid'
  },
  {
    get: {
      method: 'GET',
      params: {
        id: 'me'
      }
    },
    getAll : {
      method: 'GET',
      isArray : true,
      params : {
        action : 'all'
      }
    },
    sendVerification : {
      method : 'POST',
      params : {
        action : 'send-verification'
      }
    },
    forgotPassword : {
      method : 'POST',
      params : {
        action : 'forgot-password'
      }
    },
    resetPassword : {
      method : 'POST',
      params : {
        action : 'reset-password'
      }
    },
    getResetPasswordToken : {
      method : 'GET',
      params : {
        action : 'reset-password'
      }
    },
    getTheBestProviders: { method: 'GET', params: { id: 'theBestProviders'}, isArray: true },
    gets:{method:'GET', params: {action: ''}, isArray: true},
    delete: {method:'DELETE', params: {id: 'id', action: ''}},
    changePassword: { method: 'PUT', params: {id: 'id', action: 'password'}},
    changeEmail: { method: 'PUT', params: {id: 'id', action: 'email'}},
    // changePhoneNum: { method: 'PUT', params: {id: 'id', action: 'phone'}},
    changeProfile: { method: 'PUT', params: {id: 'id', action: 'change-profile'}},
    createUserWithInviteToken: {method: 'POST', params: {action: 'invite-token'}}
  });
});