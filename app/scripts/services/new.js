'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.new
 * @description
 * # new
 * Factory in the realtalkApp.
 */
angular.module('realtalkApp')
  .factory('New', ['$resource', function ($resource) {
    return $resource('https://realtalk-c9-whenther.c9.io/api/new/:username');
  }]);