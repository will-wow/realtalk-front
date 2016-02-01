'use strict';

/**
 * @ngdoc directive
 * @name realtalkApp.directive:contacts
 * @description
 * # contacts
 */
angular.module('realtalkApp')
  .directive('contacts', function () {
    return {
      templateUrl: 'views/templates/contacts.html',
      restrict: 'E',
      controller: function (Contacts, Socket, talkMsgService) {
        var scope = this,
            socket = Socket;

        //======================================================================
        // Scope
        //======================================================================
        scope.filter = '';
        scope.contacts = [];

        // Get all contacts
        scope.getContacts = function () {
          scope.contacts = Contacts.query();
          scope.contacts.$promise.then(function () {
            socket.emit('userlist');
          });
        };

        // Call a contact
        scope.call = function (contact) {
          var username;

          if (contact.online) {
            username = contact.username;

            // Emit the call event
            socket.emit('call', username);
            // set the message
            talkMsgService.setMessage(
              true,
              talkMsgService.types.CALL,
              'Calling ' + username + '...', 'You may cancel this call.',
              // No OK button
              new talkMsgService.Btn(),
              // Call Cancel button
              new talkMsgService.Btn('Cancel', function () {
                // Cancel the call
                socket.emit('cancelRing', username);
                // Close the message
                talkMsgService.clearMessage();
              }));
          }
        };

        // Set a contat's online state as a class
        scope.onlineClass = function (contact) {
          var className = '';

          if (contact.online) {
            className = 'online';
          } else {
            className = 'offline';
          }

          return className;
        };

        //======================================================================
        // Set up contacts
        //======================================================================
        scope.getContacts();

        // update availability on userlist
        socket.on('userlist', function (userlist) {
          var i = 0;

          for (i; i<scope.contacts.length; i++) {
            // If the contact is in the userlist
            scope.contacts[i].online = (userlist.indexOf(scope.contacts[i].username) !== -1);
          }
        });
        // update availability on userin
        socket.on('userIn', function (username) {
          var i = 0;

          for (i; i<scope.contacts.length; i++) {
            // If the contact is in the userlist
            if (scope.contacts[i].username === username) {
              scope.contacts[i].online = true;
            }
          }
        });
        // update availability on userin
        socket.on('userOut', function (username) {
          var i = 0;

          for (i; i<scope.contacts.length; i++) {
            // If the contact is in the userlist
            if (scope.contacts[i].username === username) {
              scope.contacts[i].online = false;
            }
          }
        });

      },
      controllerAs: 'contacts'
    };
  });
