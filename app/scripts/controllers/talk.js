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

  //socket.connect('https://realtalk.jit.su', {
  socket.connect('http://realtalk-c9-whenther.c9.io', { 
    'query': 'Authorization=' + Auth.getHeader(),
    'forceNew': true
  });
  
  // Flag for if the offCanvas slide is on
  scope.offCanvasStatus = false;
  
  scope.offCanvasToggle = function () {
    scope.offCanvasStatus = !scope.offCanvasStatus;
  };
  
  // The canvas class
  scope.offCanvasClass = function () {
    var style;
    
    if (scope.offCanvasStatus) {
      style = "slid";
    } else {
      style = "not-slid";
    }
    
    return style;
  };
  
  
  // Disconnect on route change
  $scope.$on("$destroy", function() {
    socket.disconnect();
  });
});
