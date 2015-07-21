/* global io */
'use strict';
angular.module('buiiltApp')
  .factory('socket', [
    'socketFactory', 'authService',
    function(socketFactory, authService, API_URL) {

      // socket.io now auto-configures its connection when we ommit a connection url
      var ioSocket = io('http://ec2-52-25-224-160.us-west-2.compute.amazonaws.com:9000/', {
        // Send auth token on connection, you will need to DI the Auth service above
        query: 'token=' + authService.getToken(),
        path: '/socket.io-client'
      });

      var socket = socketFactory({
        ioSocket: ioSocket
      });

      return socket;
    }
  ]);
