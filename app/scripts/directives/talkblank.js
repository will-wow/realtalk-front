'use strict';

/**
 * @ngdoc directive
 * @name realtalkApp.directive:talkBlank
 * @description
 * # talkBlank
 */
angular.module('realtalkApp')
  .directive('talkBlank', function () {
    return {
      templateUrl: 'views/templates/talkblank.html',
      restrict: 'E',
      controller: function (talkMsgService, talkChatService) {
        this.width = function () {
          if (talkMsgService.message.open || talkChatService.chat.open) {
            return ('zero-width');
          }
        };
      },
      controllerAs: 'blank'
    };
  });
