'use strict';

/**
 * @ngdoc directive
 * @name realtalkApp.directive:talkInput
 * @description
 * # talkInput
 */
angular.module('realtalkApp')
  .directive('talkInput', function () {
    return {
      template: '<input id="input" type="password" value=" " ng-keydown="input.keyHandler($event)" ng-model="input.value" ng-trim="false" autofocus>',
      restrict: 'E',
      controller: function ($element, $scope, talkChatService) {
        var scope = this,
        
        // =====================================================================
        // Input Event Handlers
        // =====================================================================
        /**
         * Add a character to a box
         */
        inputHandler = function () {
           // Decide what to do with the input in the model
          talkChatService.decideInput(scope.value);
          // Clear the input box
          scope.value = ' ';
        },
        
        /**
         * Focus on the input box
         */
        inputFocus = function (event) {
          if (talkChatService.chat.open) {
            $element.focus();
            scope.value = ' ';
          }
        };
        
        /**
         * Deal with ENTER keypress on input
         */
        scope.keyHandler = function ($event) {
          var key = $event.which;
      
          if (key === 13) {
            
            talkChatService.emptyChat('me', true);
            $event.preventDefault();
          }
        };
        
        // =====================================================================
        // Attach handlers to DOM
        // =====================================================================
        // Watch input box for change
        $scope.$watch(function() {
            return scope.value;
        }, inputHandler, true);
        
        // Listen for inputFocus event
        $scope.$on('inputFocus', inputFocus);
        
        // Add focus click handler to document
        angular.element(document).on('click', inputFocus);
        
        // Remove focus click handler from document on destroy
        // Disconnect on route change
        $scope.$on("$destroy", function() {
          $element.off('click', inputFocus);
        });
        
        // Hold the current input value
        scope.value = ' ';
      },
      controllerAs: 'input',
      replace: true
    };
  });
