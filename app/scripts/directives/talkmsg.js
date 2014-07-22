'use strict';

/**
 * @ngdoc directive
 * @name realtalkApp.directive:talkEvent
 * @description
 * # talkEvent
 */
angular.module('realtalkApp')
  .directive('talkMsg', function () {
    return {
      templateUrl: 'views/templates/talkmsg.html',
      restrict: 'E',
      controller: function ($scope, talkMsgService, talkChatService) {
        var scope = this;
        
        scope.width = function () {
          if (talkMsgService.message.open) {
            if (talkChatService.chat.open) {
              // both 
              return "col-md-6 col-md-offset-3";
            } else {
              // just one
              return "col-md-10 col-md-offset-1";
            }
          } else {
            // closed
            return "zero-width";
          }
        };
        
        // Reset on route change
        $scope.$on("$destroy", function() {
          talkMsgService.clearMessage();
        });
        
        scope.message = talkMsgService.message;
      },
      controllerAs: 'msg'
    };
  });
