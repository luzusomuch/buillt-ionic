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
  'btford.socket-io'
  ])
.constant('API_URL', 'http://localhost:9000/')
// .constant('API_URL', 'http://www.buiilt.com.au/')

.config(function($ionicConfigProvider,$stateProvider, $urlRouterProvider, $locationProvider, $urlRouterProvider, $httpProvider, $sceDelegateProvider){
  $urlRouterProvider.otherwise('/signin');
  $httpProvider.interceptors.push('authInterceptor');
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.views.maxCache(0);
  // cfpLoadingBarProvider.includeSpinner = true;
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
        $location.path('/login');
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
.run(function ($rootScope,notificationService,userService, authService, $location,projectService,$state, $ionicPlatform, $ionicTabsDelegate) {
    // cfpLoadingBar.start();

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
        // Set the statusbar to use the default style, tweak this to
        // remove the status bar on iOS or change it to use white instead of dark colors.
        StatusBar.styleDefault();
      }
    });
     
    if (window.localStorage.getItem('token')) {
      userService.get().$promise.then(function(currentUser){
        $rootScope.currentUser = currentUser;  
      });
    }

    $rootScope.deviceWidth = $(window).width();
    // $rootScope.currentProject = {};
    $rootScope.currentProjectId = '';
    $rootScope.authService = authService;
    $rootScope.currentTeam = {};
    $rootScope.hasHeader = true;
    $rootScope.hasFooter = true;
    $rootScope.currentResource = [];
    $rootScope.hasResourceType = false;

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
      $rootScope.isShowAddIcon = false;
      $rootScope.isInMessageTab = false;
      $rootScope.isInTaskTab = false;
      $rootScope.currentState = toState;

      $rootScope.currentSelectResource = $rootScope.currentResource;

      if ($rootScope.currentProjectId != '') {
        projectService.get({id: $rootScope.currentProjectId}).$promise.then(function(data){
          $rootScope.selectProject = data;
        });
      } else {
        $rootScope.selectProject = {};
      }

      if (toState.name == 'dashboard') {
        notificationService.getTotalForIos().$promise
        .then(function(res) {
          if (res.length > 0)
            $rootScope.totalNotification = res.length;
          });
      }
        authService.isLoggedInAsync(function (loggedIn) {
          if (loggedIn) {
            
          }
          if (toState.authenticate && !loggedIn) {
            // $location.path('/signin');
            $state.go('signin');
          } else if (!toState.authenticate && loggedIn) {
            $state.go('dashboard')
          }
        });
      if (toState.noHeader) {
        $rootScope.hasHeader = false;
      }

      if (toState.noFooter) {
        $rootScope.hasFooter = false;
      }

      if (toState.hasCurrentProject) {
        
        if (!$rootScope.currentProject || toParams.id !== $rootScope.currentProject._id) {
          projectService.get({id: toParams.id}).$promise
            .then(function (data) {
              if (data._id) {
                $rootScope.currentProject = data;

              } else {
                $rootScope.currentProject = null;
                $state.go('dashboard');
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
