// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('buiiltApp', [
  'ionic',
  'ui.utils',
  'ui.router',
  'ngAnimate',
  'angularFileUpload',
  'ngCookies',
  'ngSanitize',
  'ngResource',
  'angular-loading-bar',
  'cgNotify',
  'restangular',
  'lumx',
  'ui.materialize',
  'contenteditable',
  '720kb.tooltips',
  'angucomplete-alt',
  'btford.socket-io'
  ])
// .constant('API_URL', 'http://localhost:9000/')
.constant('API_URL', 'http://ec2-52-25-224-160.us-west-2.compute.amazonaws.com:9000/')

.config(function($stateProvider, $urlRouterProvider, $locationProvider, $urlRouterProvider, $httpProvider, $sceDelegateProvider, cfpLoadingBarProvider){
  $urlRouterProvider.otherwise('/');
  $httpProvider.interceptors.push('authInterceptor');
  cfpLoadingBarProvider.includeSpinner = true;
})
.factory('authInterceptor', function ($q, $cookieStore, $location) {
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
        $location.path('/signin');
        // $state.go('signin');
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
.run(function ($rootScope, $cookieStore, cfpLoadingBar, authService, $location,projectService,$state) {
    cfpLoadingBar.start();
    $rootScope.currentProject = {};
    $rootScope.authService = authService;
    $rootScope.currentTeam = {};
    $rootScope.hasHeader = true;
    $rootScope.hasFooter = true;
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
    $rootScope.$on('$stateChangeStart', function (event,toState, toParams, next) {
        authService.isLoggedInAsync(function (loggedIn) {
          if (loggedIn) {

          }
          if (toState.authenticate && !loggedIn) {
            // $location.path('/signin');
            $state.go('signin');
          } else if (!toState.authenticate && loggedIn) {
            $state.go('team.manager')
          }
        });
      if (toState.noHeader) {
        $rootScope.hasHeader = false;
      }

      if (toState.noFooter) {
        $rootScope.hasFooter = false;
      }

      if (toState.canAccess) {
        authService.getCurrentTeam().$promise
          .then(function(res) {
            if (toState.canAccess.indexOf(res.type) == -1) {
              if (toState.hasCurrentProject) {
                $state.go('dashboard',{id : toParams.id })
              } else {
                $state.go('team.manager');
              }
            } else {
              // console.log('false')
            }
          });

      }

      if (toState.hasCurrentProject) {

        if (!$rootScope.currentProject || toParams.id !== $rootScope.currentProject._id) {
          projectService.get({id: toParams.id}).$promise
            .then(function (data) {
              if (data._id) {
                $rootScope.currentProject = data;

              } else {
                $rootScope.currentProject = null;
                $state.go('team.manager');
              }
            })
        }

      } else {
        $rootScope.currentProject = { };

      }
      $rootScope.hasCurrentProject=toState.hasCurrentProject;
    });

    $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams){
      $rootScope.previousState = from;
      $rootScope.previousParams = fromParams;
    });

    $rootScope.overlay = false;

  })

// .run(function($ionicPlatform) {
//   $ionicPlatform.ready(function() {
//     // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
//     // for form inputs).
//     // The reason we default this to hidden is that native apps don't usually show an accessory bar, at
//     // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
//     // useful especially with forms, though we would prefer giving the user a little more room
//     // to interact with the app.
//     if (window.cordova && window.cordova.plugins.Keyboard) {
//       cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
//       cordova.plugins.Keyboard.disableScroll(true);
//     }
//     if (window.StatusBar) {
//       // Set the statusbar to use the default style, tweak this to
//       // remove the status bar on iOS or change it to use white instead of dark colors.
//       StatusBar.styleDefault();
//     }
//   });
// });
