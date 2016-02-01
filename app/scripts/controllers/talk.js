'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:TalkCtrl
 * @description
 * # TalkCtrl
 * Controller of the realtalkApp
 */

 var baseUrl = window.location.hostname === 'localhost' ?
   'http://localhost:8080' :
   'https://realtalk-api.herokuapp.com';
baseUrl = 'https://realtalk-api.herokuapp.com';

angular.module('realtalkApp').controller('TalkCtrl', function($scope, Socket, Auth) {
  var scope = this,
    socket = scope.socket = Socket;

  socket.connect(baseUrl, {
    'query': 'Authorization=' + Auth.getHeader(),
    'forceNew': true
  });

  socket.on('error', function (error) {
    console.log('socket error', error);
  })

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
