'use strict';

/**
 * @ngdoc directive
 * @name realtalkApp.directive:nav
 * @description
 * # nav
 */
 
angular.module('realtalkApp')
  .directive('nav', ['Auth', 'Session', function (Auth, Session) {
    return {
      templateUrl: 'views/templates/nav.html',
      restrict: 'E',
      controller: function () {
        this.auth = Auth.isSignedIn();
        this.username = Session.username;
      },
      controllerAs: 'nav'
    };
  }]);