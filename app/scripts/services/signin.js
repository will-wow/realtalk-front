'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.SignIn
 * @description
 * # SignIn
 * Factory in the realtalkApp.
 */
angular.module('realtalkApp')
  .factory('SignIn', ['$resource', function ($resource) {
    return $resource('https://realtalk-c9-whenther.c9.io/api/signin');
  }]);