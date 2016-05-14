'use strict';
angular.module('buiiltApp')
  .directive('spSocket', [function () {
    return {
      restrict: 'AE',
      controller:['socket','authService', function(socket, authService){
        authService.getCurrentUser().$promise
          .then(function(user) {
            socket.emit('join',user._id);
          });
      }]
    };
  }])
  .directive('scrollToBottom',[function() {
    return {
      restrict: 'AE',
      scope : {
        scrollToBottom : '='
      },
      link : function(scope,element,attrs) {
        scope.$watchCollection('scrollToBottom',function(value) {
          if (value) {
            $(element).scrollTop($(element)[0].scrollHeight);
          }
        });
      }
    }
  }])
  .directive("compareTo", function() {
    return {
      require: "ngModel",
      scope: {
        confirmPassword: "=compareTo"
      },
      link: function(scope, element, attributes, modelVal) {

        modelVal.$validators.compareTo = function(val) {
          return val == scope.confirmPassword;
        };

        scope.$watch("confirmPassword", function() {
          modelVal.$validate();
        });
      }
    };
  })
  .directive("filePickerThumbnail", function() {
    return {
      restrict: "A",
      scope: {
        url: "@"
      },
      link: function(scope, element, attrs) {
        var splitedUrl = scope.url.split("/");
        var result = "https://process.filestackapi.com/AM6Wn3DzwRimryydBnsj7z/output=format:jpg/"
        result += splitedUrl[splitedUrl.length-1];
        attrs.$set("src", result);
      }
    }
  });
