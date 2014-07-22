'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.talk
 * @description
 * # talk
 * Factory in the realtalkApp.
 */
angular.module('realtalkApp')
  .factory('talkChatService', ['Socket', 'talkInputService', function (Socket, talkInputService) {
    // =====================================================================
    // Variables
    // =====================================================================
    var socket = Socket,
        // The max length of a text string
        MAX_LENGTH = 50,
        chat = {
          open: false,
          // The user being chatted with
          chattingWith: null,
          // The user's chat string
          meTxt: '',
          // The other user's chat string
          otherTxt: ''
        },
    
        // =====================================================================
        // Chat Helpers
        // =====================================================================
        /**
         * Return the name of a userTxt variable
         * @param: {String} userType - Either "me" or "other"
         */
        txtRef = function(userType) {
          return userType + 'Txt';
        },
        /**
         * Add input to a chat box
         * @param: {String} input - The input to add
         * @param: {String} userType - Either "me" or "other"
         */
        writeInput = function(userType, input) {
          // Don't update if not chatting
          if (!chat.chattingWith) return;
    
          // Get the name of the referenced txt variable
          var textRef = txtRef(userType),
            // The current text
            text = chat[textRef],
            // The length of the current text + input
            textLength;
    
          // Append new characters
          text = text + input;
          // Get new length
          textLength = text.length;
          // Cut to MAX_LENGTH
          if (textLength > MAX_LENGTH) {
            text = text.substring(textLength - this._MAX_LENGTH, textLength);
          }
    
          // Set new text
          chat[textRef] = text;
        },
        /**
         * Remove a character from a box
         * @param: {String} userType - Either "me" or "other"
         */
        removeChar = function(userType) {
          // Don't update if not chatting
          if (!chat.chattingWith) return;
    
          var textRef = txtRef(userType),
            // The current text
            text = chat[textRef];
          // Remove one char from the text
          chat[textRef] = text.substring(0, text.length - 1);
        },
        /**
         * Empty a chat String
         * @param: {String} userType - Either "me" or "other"
         */
        emptyChat = function(userType, emit) {
          chat[txtRef(userType)] = '';
          
          // Emit the clear event if requested
          if (emit) {
            socket.emit('clear');
          }
        },
        /**
         * Decide what to do with an input String (that starts with a space)
         * @param: {String} userType - Either "me" or "other"
         */
        decideInput = function(input) {
          // Don't update if not chatting
          if (!chat.chattingWith) return;
    
          if (input) {
            // User typed a string
            // Remove the first character, which is there to handle backspace
            input = input.substring(1, input.length);
            // Type the string into the #me box
            writeInput('me', input);
            // Send it to the server
            socket.emit('input', input);
          }
          else {
            // User hit backspace
            removeChar('me');
            socket.emit('back');
          }
        },
        
        // =====================================================================
        // Text in handlers
        // =====================================================================
        /**
         * Add a character to the #other box
         * @param {String} text - The text to write
         */
        textInHandler = function (text) {
          writeInput('other', text);
        },
        /**
         * Remove a char from the #other box
         */
        removeHandler = function () {
          removeChar('other');
        },
        /**
         * Clear the #other box
         */
        clearHandler = function () {
          emptyChat('other');
        },
        
        // =====================================================================
        // Private Chat Start/End Handler
        // =====================================================================
        setChat = function (open, chattingWith) {
          chat.open = open;
          chat.chattingWith = chattingWith;
        },
        
        // =====================================================================
        // Public Chat Start/End Handlers
        // =====================================================================
        /**
         * End a chat
         * @param {boolean} dontSetSizes=false - If true, don't run setSizes
         */
        chatEnd = function (dontSetSizes) {
          setChat(false, null);
        },
        /**
         * Start a chat
         * @param {boolean} dontSetSizes=false - If true, don't run setSizes
         */
        chatStart = function (chattingWith) {
          setChat(true, chattingWith);
          talkInputService.focus();
        };
    
    // =========================================================================
    // Socket events
    // =========================================================================
    
    // Receive text
    socket.on('input', textInHandler);
    // Receive backspace
    socket.on('back', removeHandler);
    // Receive clearbox
    socket.on('clear', clearHandler);
      
    // =========================================================================
    // Return Public
    // =========================================================================
    return {
      chat: chat,
      chatStart: chatStart,
      chatEnd: chatEnd,
      decideInput: decideInput,
      emptyChat: emptyChat
    };
  }])
  
  
/**
 * @ngdoc talkMsgService
 * @name realtalkApp.talk
 * @description
 * # talk
 * Talk Message Service
 */
  .factory('talkMsgService', ['Socket', 'talkChatService', function (Socket, talkChatService) {
        // =====================================================================
        // Variables
        // =====================================================================
    var socket = Socket,
        types = {
          UNAVAILABLE: true,
          CALL: false,
          RING: false,
          HUNGUP: true,
          ERR: true,
          CLOSED: true
        },
        message = {
          // State of the message popup
          open: false,
          // The message info
          header: '',
          text: '',
          yesBtn: {
            value: '',
            onClick: ''
          },
          noBtn: {
            value: '',
            onClick: ''
          },
          // Message type
          type: types.UNAVAILABLE
        },
        
        // =====================================================================
        // Socket event handlers
        // =====================================================================
        /**
         * Handle a hang-up from the user
         */
        hangUpHandler = function () {
          // Send hangup event
          socket.emit('hangup', talkChatService.chattingWith);
          // End Chat
          talkChatService.chatEnd();
          // Close message
          clearMessage();
        },
        /**
         * Handle a hang-up from the other user 
         */
        hungUpHandler = function (username) {
          // Show a chatend message if the current message is replaceable
          if (message.type) {
            // Bring up hungup event
            setMessage(
              true,
              types.HUNGUP,
              username + " has left the chat.",
              "You can choose someone else to chat with.",
              // Add OK button that closes the message
              new Btn("OK", clearMessage),
              // No CANCEL msg
              new Btn(" "));
          }
          // End Chat either way
          talkChatService.chatEnd();
        },
        /**
         * Handle a ring event 
         */
        ringHandler = function (username) {
          // if the current message is replaceable, accept the ring
          if (message.type) {
            setMessage(
              true,
              types.RING,
              username + ' wants to chat!',
              '',
              // Click Chat to start chat
              new Btn('Chat', function() {
                socket.emit('pickup', username);
              }),
              // Click Busy to ignore
              new Btn('Busy', function() {
                socket.emit('unavailable', username);
                clearMessage();
              }));
          // If the current message is not replaceable
          } else {
            // Respond with unavailable
            socket.emit('unavailable', username);
          }
        },
      
        cancelRingHandler = function () {
          clearMessage();
        },
        /**
         * Handle a pick-up event
         */
        startChatHandler = function (username) {
          clearMessage();
          talkChatService.chatStart(username);
        },
        /**
         * Handle an event where the other user was unavailable
         */
        unavailableHandler = function (username) {
          setMessage(
            true, 
            types.UNAVAILABLE,
            username + ' was unavailable.', 
            '', 
            new Btn('OK', function() {
              clearMessage();
            })
          );
        },
        
        // =====================================================================
        // Public Functions
        // =====================================================================
        Btn = function (value, onClick) {
          this.value = value || ' ';
          this.onClick = onClick;
        }, 
        
        setMessage = function(open, type, header, text, yesBtn, noBtn) {
          // Update model
          message.open    = open    || false;
          message.type    = type    || types.CLOSED;
          message.header  = header  || ' ';
          message.text    = text    || ' ';
          message.yesBtn  = yesBtn  || new Btn();
          message.noBtn   = noBtn   || new Btn();
        },
        
        clearMessage = function () {
          setMessage();
        };
        
        // =====================================================================
        // Set up socket listeners
        // =====================================================================
        
        //Ring
        socket.on('ring', ringHandler);
        //Cancel Ring
        socket.on('cancelRing', cancelRingHandler);
        //unavailable
        socket.on('unavailable', unavailableHandler);
        //startchat
        socket.on('startchat', startChatHandler);
        //endchat
        socket.on('hungup', hungUpHandler);
    
    // =====================================================================
    // Return Public Functions
    // =====================================================================   
    return {
      message: message,
      types: types,
      Btn: Btn,
      setMessage: setMessage,
      clearMessage: clearMessage,
      hangUpHandler: hangUpHandler
    };
  }])
/**
 * @ngdoc talkMsgService
 * @name realtalkApp.talk
 * @description
 * # talk
 * Talk Message Service
 */
  .factory('talkInputService', ['$rootScope', function ($rootScope) {
    
    // =====================================================================
    // Return Public Data
    // =====================================================================   
    return {
      focus: function () {
        $rootScope.$broadcast('inputFocus');
      }
    };
  }]);
