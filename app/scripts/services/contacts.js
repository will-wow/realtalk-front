'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.contacts
 * @description
 * # contacts
 * Factory in the realtalkApp.
 */
angular.module('realtalkApp')
  .factory('Contacts', ['$resource', function ($resource) {
    return $resource('https://realtalk-c9-whenther.c9.io/api/contacts/:contacts', {}, 
      {'query': {isArray: false}}
    );
  }]);
