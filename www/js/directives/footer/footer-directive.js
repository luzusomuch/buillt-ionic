'use strict';

angular.module('buiiltApp')
        .directive('builtFooter', function() {
          return {
            restrict: 'E',
            templateUrl: 'js/directives/footer/footer.html'
          };
        });