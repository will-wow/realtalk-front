'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:FindCtrl
 * @description
 * # FindCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp')
  .controller('FindCtrl', ['Users', 'Contacts', function (Users, Contacts) {
    var scope = this,
        contact;
    
    // Holds user list
    scope.users = {};
    
    // User filter
    scope.filter = '';
    
    scope.findUsers = function () {
      scope.users = Users.query({users: scope.filter});
    };
    
    scope.addUser = function (username) {
      contact = new Contacts({contact: username});
      
      contact.$save({},
        function (res) {
          scope.findUsers();
        }
      );
    };
  }]);
