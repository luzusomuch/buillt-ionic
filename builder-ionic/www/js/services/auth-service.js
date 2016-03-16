angular.module('buiiltApp')
.factory('authService', function(API_URL,$location, $rootScope, $http, userService,teamService, $q,$state) {
  var currentUser = {};
  if (window.localStorage.getItem('token')) {
    currentUser = userService.get({isMobile: true});
  }
  return {
    /**
     * Authenticate user and save token
     *
     * @param  {Object}   user     - login info
     * @param  {Function} callback - optional
     * @return {Promise}
     */
    login: function(user, callback) {
      var cb = callback || angular.noop;
      var deferred = $q.defer();

      $http.post(API_URL + 'auth/local', {
        email: user.email,
        password: user.password
      })
      .success(function(data) {
        window.localStorage.setItem('token', data.token);
        currentUser = userService.get().promise.then(function(res) {
          $rootScope.currentUser = currentUser; 
          //Track Reply Sent
          mixpanel.identify($rootScope.currentUser._id);
          mixpanel.track("Sign In From Mobile");
          deferred.resolve(data);
          return cb();
        });
      })
      .error(function(err) {
        this.logout();
        deferred.reject(err);
        return cb(err);
      }.bind(this));

      return deferred.promise;
    },
    /**
     * Delete access token and user info
     *
     * @param  {Function}
     */
    logout: function() {
      window.localStorage.removeItem('token');
      currentUser = {};
      $rootScope.currentUser = {};
      window.location.href = '/#/signin';
      // $state.go('signin');
    },
    /**
     * Create a new user
     *
     * @param  {Object}   user     - user info
     * @param  {Function} callback - optional
     * @return {Promise}
     */
    createUser: function(user, callback) {
      var cb = callback || angular.noop;

      return userService.save(user,
      function(data) {
        if (data.emailVerified == true) {
          window.localStorage.setItem('token', data.token);
          userService.get().$promise.then(function(res) {
            currentUser = res;
            mixpanel.identify(res._id);
            mixpanel.people.set({
              "$first_name": res.firstName,
              "$last_name": res.lastName,
              "$created": new Date(),
              "$email": res.email
            });
            mixpanel.track("Sign Up From Mobile", {
              "first_name": res.firstName,
              "last_name": res.lastName,
              "created": new Date(),
              "email": res.email,
            }, function() {
              $state.go('dashboard')
            });
          });
        }
        return cb(user);
      },
      function(err) {
        this.logout();
        return cb(err);
      }.bind(this)).$promise;
    },

    createUserWithInvite: function(user, callback){
      var cb = callback || angular.noop;

      return userService.createUserWithInviteToken(user,
      function(data) {
        if (data.emailVerified == true) {
          window.localStorage.setItem('token', data.token);
          currentUser = userService.get();
          if (data.package.type === 'contractor') {
            $state.go('contractorRequest.sendQuote', {id:data.package.project, packageId: data.package._id});  
          }
          else if (data.package.type === 'material') {
            $state.go('materialRequest.sendQuote', {id: data.package.project, packageId: data.package._id});
          }
          else if (data.package.type === 'BuilderPackage') {
            $state.go('dashboard', {id: data.package.project});
          }
          // $state.go('team.manager')

        }
        return cb(user);
      },
      function(err) {
        this.logout();
        return cb(err);
      }.bind(this)).$promise;
    },
    /**
     * Change password
     *
     * @param  {String}   oldPassword
     * @param  {String}   newPassword
     * @param  {Function} callback    - optional
     * @return {Promise}
     */
    changePassword: function(oldPassword, newPassword, callback) {
      var cb = callback || angular.noop;

      return userService.changePassword({id: currentUser._id}, {
        oldPassword: oldPassword,
        newPassword: newPassword
      }, function(user) {
        return cb(user);
      }, function(err) {
        return cb(err);
      }).$promise;
    },

    changeEmail : function(email) {
      return userService.changeEmail({id : currentUser._id},email).$promise
    },

    // changePhoneNum: function(phoneNumber, callback) {
    //   var cb = callback || angular.noop;

    //   return userService.changePhoneNum({id: currentUser._id}, {
    //     phoneNumber: phoneNumber
    //   }, function(user) {
    //     return cb(user);
    //   }, function(err) {
    //     return cb(err);
    //   }.bind(this)).$promise;
    // },

    changeProfile: function(firstName, lastName, phoneNumber, callback) {
      var cb = callback || angular.noop;
      return userService.changeProfile({id: currentUser._id}, {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber
      }, function(user) {
        return cb(user);
      }, function(err){
        return cb(err);
      }).$promise;
    },
    /**
     * Gets all available info on authenticated user
     *
     * @return {Object} user
     */
    getCurrentUser: function() {
      return currentUser;
    },
    /**
     * Get team on authenticated user
     * @returns {*}
     */
    getCurrentTeam : function() {
      return teamService.getCurrentTeam();
    },
    getCurrentInvitation : function() {
      return teamService.getCurrentInvitation();
    },
    /**
     * Gets all available info on authenticated user in async
     *
     * @param {Function} cb
     * @returns {void}
     */
    getCurrentUserInAsync: function(cb) {
      if (currentUser.hasOwnProperty('$promise')) {
        currentUser.$promise.then(function() {
          cb(currentUser);
        }). catch (function() {
          cb(null);
        });
      } else if (currentUser.hasOwnProperty('role')) {
        cb(currentUser);
      } else {
        cb(null);
      }
    },

    /**
     * Check if a user is logged in
     *
     * @return {Boolean}
     */
    isLoggedIn: function() {
      return currentUser.hasOwnProperty('role');
    },
    /**
     * Waits for currentUser to resolve before checking if user is logged in
     */
    isLoggedInAsync: function(cb) {
      if (currentUser.hasOwnProperty('$promise')) {
        currentUser.$promise.then(function() {
          cb(true);
        }). catch (function() {
          cb(false);
        });
      } else if (currentUser.hasOwnProperty('role')) {
        cb(true);
      } else {
        cb(false);
      }
    },
    /**
     * Check if a user is an admin
     *
     * @return {Boolean}
     */
    isAdmin: function() {
      return currentUser.role === 'admin';
    },
    /**
     * Get auth token
     */
    getToken: function() {
      return window.localStorage.getItem('token');
    },

    recoverPassword: function(email, callback){
      var cb = callback || angular.noop;
      var deferred = $q.defer();

      $http.post(API_URL + 'auth/recoverPassword', {
        email: email
      })
      .success(function(data) {
        deferred.resolve(data);
        return cb();
      })
      .error(function(err) {
        deferred.reject(err);
        return cb(err);
      }.bind(this));

      return deferred.promise;
    },

    confirmResetPasswordToken: function(token, callback){
      var cb = callback || angular.noop;
      var deferred = $q.defer();

      $http.get(API_URL + 'auth/confirmPasswordResetToken/' + token)
      .success(function(data) {
        //do login
        window.localStorage.setItem('token', data.token);
        currentUser = userService.get();

        deferred.resolve(data);
        return cb();
      })
      .error(function(err) {
        deferred.reject(err);
        return cb(err);
      }.bind(this));

      return deferred.promise;
    },

    setCurrentUser: function(user){
      currentUser = user;
    },

    sendVerification: function() {
      return userService.sendVerification();
    },
    forgotPassword: function(email) {
      return userService.forgotPassword(email);
    },
    resetPassword : function(data) {
      return userService.resetPassword(data);
    },
    getResetPasswordToken : function(id) {
      return userService.getResetPasswordToken({id : id});
    }

  };
});