'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.Session
 * @description
 * # Session
 * Service in the realtalkApp.
 */
angular.module('realtalkApp').service('Session', function Session() {
  this.username = '';
  
  this.create = function(username) {
    this.username = username;
  };
  this.destroy = function() {
    this.username = null;
  };
  this.isloggedin = function () {
    return !!this.username;
  }
  return this;
});
