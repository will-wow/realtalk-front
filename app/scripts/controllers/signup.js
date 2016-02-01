'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:SignoutCtrl
 * @description
 * # SignoutCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp')
  .controller('SignUpCtrl', ['Auth', 'New', function (Auth, New) {
    var scope = this;

    scope.head = "Sign Up to start talking!";
    scope.button = "Sign Up";

    scope.user = {
      username: '',
      password: ''
    };

    scope.submit = function () {
      scope.error = undefined;

      Auth.signup(scope.user.username, scope.user.password)
        .catch(function (error) {
          scope.error = 'Sorry, there was a problem creating your account. Try another username?';
        });
    };

    /*
    scope.checkName = function () {
      New.get(function(data) {
        this.posts = data.posts;

        ctrl.$setValidity('uniqueEmail', data.isValid);
      });
    };
    */
  }]);
