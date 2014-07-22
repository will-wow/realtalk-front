'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:TalkCtrl
 * @description
 * # TalkCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp').controller('TalkCtrl', function($scope, Socket, Auth) {
  var scope = this,
    socket = scope.socket = Socket;

  socket.connect('https://realtalk-c9-whenther.c9.io', {
    'query': 'Authorization=' + Auth.getHeader(),
    'forceNew': true
  });
  
  // Disconnect on route change
  $scope.$on("$destroy", function() {
    socket.disconnect();
  });
});
