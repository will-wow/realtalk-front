'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.auth
 * @description
 * # auth
 * Factory in the realtalkApp.
 */
angular.module('realtalkApp')
  .factory('Auth', ['$http', '$location', '$q', 'Base64', 'Session', 'New', 'SignIn', function ($http, $location, $q, Base64, Session, New, SignIn) {
    // Callback after sign in/up
    var header = '',
        buildHeader = function (username, password) {
          header = 'Basic ' + Base64.encode(username + ':' + password);
        },
        localSignIn = function(username, password) {
            // Save info to session
            Session.create(username);
            // Update the header var
            buildHeader(username, password);
            // set the auth header
            $http.defaults.headers.common.Authorization = header;
        },

        auth = {
          signup: function (username, password) {
            var user = new New({
              username: username,
              password: password
            });

            // user.$save always resolves, even when it fails.
            var signupDeferred = $q.defer();

            user.$save({},
              function (res) {
                if (res.success) {
                  localSignIn(username, password);
                  signupDeferred.resolve();
                  // Move back to home
                  $location.path('/');
                } else {
                  signupDeferred.reject();
                }
            });

            return signupDeferred.promise;
          },
          // Set Session if authorized
          signin: function (username, password) {
            localSignIn(username, password);

            return SignIn.get({}, function (res) {
              if (res) {
                $location.path('/');
              } else {
                auth.signout();
              }
            }).$promise;
          },
          signout: function () {
            document.execCommand("ClearAuthenticationCache");
            $http.defaults.headers.common.Authorization = '';
            header = '';
            Session.destroy();
          },
          isSignedIn: function () {
            return Session.isloggedin();
          },
          // Expose the headers function for passport
          getHeader: function () {return header;}
        };

    return auth;
  }]);
