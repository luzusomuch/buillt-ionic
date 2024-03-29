// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('buiiltApp', [
  'ionic',
  'ngCordova',
  'ui.utils',
  'ui.router',
  'ngAnimate',
  'ngSanitize',
  'ngResource',
  'angular-loading-bar',
  'cgNotify',
  'restangular',
  'btford.socket-io',
  'angular-filepicker',
  "ion-datetime-picker"
  ])
// .constant('API_URL', 'http://localhost:9000/')
.constant('API_URL', 'https://buiilt.com.au/')


.config(function($ionicConfigProvider,$stateProvider, $urlRouterProvider, $locationProvider, $urlRouterProvider, $httpProvider, $sceDelegateProvider, filepickerProvider){
  $urlRouterProvider.otherwise('/signin');
  $httpProvider.interceptors.push('authInterceptor');
  filepickerProvider.setKey('AM6Wn3DzwRimryydBnsj7z');
})
.factory('authInterceptor', function ($q, $location) {
  return {
    // Add authorization token to headers
    request: function (config) {
      config.headers = config.headers || {};
      if (window.localStorage.getItem('token')) {
        config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('token');
      }
      return config;
    },
    // Intercept 401s and redirect you to login
    responseError: function (response) {
      if (response.status === 401) {
        $location.path('/#/signin');
        // remove any stale tokens
        window.localStorage.removeItem('token');
        return $q.reject(response);
      }
      else {
        return $q.reject(response);
      }
    }
  };
})
.run(function ($ionicLoading, $ionicScrollDelegate, $rootScope, authService, $location,$state, $ionicPlatform, $ionicTabsDelegate) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs).
    // The reason we default this to hidden is that native apps don't usually show an accessory bar, at
    // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
    // useful especially with forms, though we would prefer giving the user a little more room
    // to interact with the app.
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.hide();
    }
  });
   
  // if (window.localStorage.getItem('token')) {
  //   userService.get({isMobile: true}).$promise.then(function(currentUser){
  //     $rootScope.currentUser = currentUser;  
  //   });
  // }

  $rootScope.roles = ["builders", "clients", "architects", "subcontractors", "consultants"];

  $rootScope.safeApply = function (fn) {
    var phase = $rootScope.$$phase;
    if (phase === '$apply' || phase === '$digest') {
      if (fn && (typeof (fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $rootScope.checkPrivilageInProjectMember = function(people, currentUser) {
    var allow = false;
    _.each($rootScope.roles, function(role) {
      _.each(people[role], function(tender) {
        if (tender.tenderers[0]._id && tender.tenderers[0]._id._id.toString()===currentUser._id.toString()) {
          allow = !tender.archive;
          return false;
        } else {
          var index = _.findIndex(tender.tenderers[0].teamMember, function(member) {
              return member._id.toString()===currentUser._id;
          });
          if (index !== -1 && (!tender.tenderers[0].archivedTeamMembers || (tender.tenderers[0].archivedTeamMembers && tender.tenderers[0].archivedTeamMembers.indexOf(currentUser._id) === -1))) {
              allow = true;
              return false;
          }
        }
      });
      if (allow) {
        return false;
      }
    });
    return allow;
  };

  $rootScope.getProjectMembers = function(people, currentUser) {
    var membersList = [];
    _.each($rootScope.roles, function(role) {
      _.each(people[role], function(tender){
        if (tender.hasSelect) {
          var isLeader = (_.findIndex(tender.tenderers, function(tenderer) {
            if (tenderer._id) {
              return tenderer._id._id.toString() === currentUser._id.toString();
            }
          }) !== -1) ? true : false;
          if (!isLeader) {
            _.each(tender.tenderers, function(tenderer) {
              var memberIndex = _.findIndex(tenderer.teamMember, function(member) {
                return member._id.toString() === currentUser._id.toString();
              });
              if (memberIndex !== -1) {
                _.each(tenderer.teamMember, function(member) {
                  member.select = false;
                  membersList.push(member);
                });
              }
            });
            if (tender.tenderers[0]._id) {
              tender.tenderers[0]._id.select = false;
              membersList.push(tender.tenderers[0]._id);
            } else {
              membersList.push({email: tender.tenderers[0].email, name: tender.tenderers[0].name, phoneNumber: tender.tenderers[0].phoneNumber, select: false});
            }
          } else {
            _.each(tender.tenderers, function(tenderer) {
              if (tenderer._id._id.toString() === currentUser._id.toString()) {
                _.each(tenderer.teamMember, function(member) {
                  member.select = false;
                  membersList.push(member);
                });
              }
            });
          }
        }
      });
    });
    return membersList;
  };

  $rootScope.$on('$stateChangeStart', function (event,toState, toParams, next) {
    $rootScope.currentState = toState;
    authService.isLoggedInAsync(function (loggedIn) {
      if (!loggedIn) {
        $location.path('/signin');
      }
      if (!toState.authenticate && loggedIn) {
        $location.path('/dashboard');
      }
    });
  });
});
