'use strict';

/**
 * @ngdoc directive
 * @name realtalkApp.directive:talkChat
 * @description
 * # talkChat
 */
angular.module('realtalkApp')
  .directive('talkChat', function () {
    return {
      templateUrl: 'views/templates/talkchat.html',
      restrict: 'E',
      controller: function ($scope, talkChatService, talkMsgService) {
        var scope = this;
        
        scope.chat = talkChatService.chat;
        scope.quit = talkMsgService.hangUpHandler;
        scope.width = function () {
          if (talkChatService.chat.open) {
            if (talkMsgService.message.open) {
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
          talkChatService.chatEnd();
        });
      },
      controllerAs: 'chat'
    };
  });
