'use strict';

/**
 * @ngdoc overview
 * @name realtalkApp
 * @description
 * # realtalkApp
 *
 * Main module of the application.
 */
angular.module('realtalkApp', [
  'ngRoute',
  'ngResource',
  'ui.gravatar'
  ])
// Config the gravatar defaults
.config(['gravatarServiceProvider', function(gravatarServiceProvider){
  gravatarServiceProvider.defaults = {
    "default": 'retro',
    "rating": 'r'
  };
}])
// Routes
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/home.html',
    controller: 'HomeCtrl',
    controllerAs: 'home'
  })
  .when('/signin', {
    templateUrl: 'views/sign.html',
    controller: 'SignInCtrl',
    controllerAs: 'sign'
  })
  .when('/signup', {
    templateUrl: 'views/sign.html',
    controller: 'SignUpCtrl',
    controllerAs: 'sign'
  })
  .when('/signout', {
    redirectTo: '/signin'
  })
  .when('/talk', {
    templateUrl: 'views/talk.html',
    controller: 'TalkCtrl',
    protected: true
  })
  .when('/settings', {
    templateUrl: 'views/settings.html',
    controller: 'SettingsCtrl',
    controllerAs: 'settings',
    protected: true
  })
  .when('/find', {
    templateUrl: 'views/find.html',
    controller: 'FindCtrl',
    controllerAs: 'find',
    protected: true
  })
.otherwise({
    redirectTo: '/'
  });
}])
// Any 401 should redirect to the login page
.config(['$routeProvider', 
    '$locationProvider', 
    '$httpProvider', 
    function ($routeProvider, $locationProvider, $httpProvider) {
      var interceptor = ['$location', '$q', function($location, $q) {
        function success(response) {
            return response;
        }

        function error(response) {

            if(response.status === 401) {
                $location.path('/signin');
                return $q.reject(response);
            }
            else {
                return $q.reject(response);
            }
        }

        return function(promise) {
            return promise.then(success, error);
        };
    }];

    $httpProvider.responseInterceptors.push(interceptor);
}])
// Protect routes
.run(function ($rootScope, $location, Auth) {
  $rootScope.$on('$routeChangeStart', function (event, next, current) {
    // Check if route is protected and user not logged in
    if (next.protected && !Auth.isSignedIn()) {
      // If not allowed, direct to signin
      $location.path('/signin');
    }
  });
});
'use strict';

var baseUsr = 'https://realtalk.jit.su/api'

/**
 * @ngdoc service
 * @name realtalkApp.me
 * @description
 * # me
 * Factory in the realtalkApp.
 */
angular.module('realtalkApp')
  .factory('Me', ['$resource', function ($resource) {
    return $resource(baseUsr + '/me', {}, 
      {'query': {isArray: false}}
    );
  }])
/**
 * @ngdoc service
 * @name realtalkApp.new
 * @description
 * # new
 * Factory in the realtalkApp.
 */
  .factory('New', ['$resource', function ($resource) {
    return $resource(baseUsr + '/new/:username');
  }])
/**
 * @ngdoc service
 * @name realtalkApp.contacts
 * @description
 * # contacts
 * Factory in the realtalkApp.
 */
  .factory('Contacts', ['$resource', function ($resource) {
    return $resource(baseUsr + '/contacts/:contacts', {}, 
      {'query': {isArray: true}}
    );
  }])
/**
 * @ngdoc service
 * @name realtalkApp.Users
 * @description
 * # Users
 * Get info about other users
 */
  .factory('Users', ['$resource', function ($resource) {
    return $resource(baseUsr + '/users/:users');
  }])
/**
 * @ngdoc service
 * @name realtalkApp.SignIn
 * @description
 * # SignIn
 * Factory in the realtalkApp.
 */
  .factory('SignIn', ['$resource', function ($resource) {
    return $resource(baseUsr + '/signin');
  }]);
'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.auth
 * @description
 * # auth
 * Factory in the realtalkApp.
 */
angular.module('realtalkApp')
  .factory('Auth', ['$http', '$location', 'Base64', 'Session', 'New', 'SignIn', function ($http, $location, Base64, Session, New, SignIn) {
    // Callback after sign in/up 
    var header = '',
        buildHeader = function (username, password) {
          header = 'Basic ' + Base64.encode(username + ':' + password);
        },
        localSignIn = function(username, password) {
            // Save info to session
            Session.create(username);
            // Update the header var
            buildHeader(username, password);
            // set the auth header
            $http.defaults.headers.common['Authorization'] = header;
        },
        
        auth = {
          signup: function (username, password) {
            var user = new New({
              username: username,
              password: password
            });
            
            user.$save({}, 
              function (res) {
                if (res.success) {
                  localSignIn(username, password);
                  // Move back to home
                  $location.path('/');
                }
            });
          },
          // Set Session if authorized
          signin: function (username, password) {
            localSignIn(username, password);
            
            SignIn.get({}, function (res) {
              if (res) {
                $location.path('/');
              } else {
                auth.signout();
              }
            });
          },
          signout: function () {
            document.execCommand("ClearAuthenticationCache");
            $http.defaults.headers.common['Authorization'] = '';
            header = '';
            Session.destroy();
          },
          isSignedIn: function () {
            return Session.isloggedin();
          },
          // Expose the headers function for passport
          getHeader: function () {return header;}
        };
    
    return auth;
  }]);

'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.Socket
 * @description
 * # Socket
 * Socket.io wrapper service
 */
angular.module('realtalkApp').factory('Socket', ['$rootScope', function Socket($rootScope) {
  var socket,
      hasConnected = false;
  
  return { 
    connect: function (url, options) {
      if (!hasConnected) {
        socket = io.connect(url, options);
        hasConnected = true;
      } else {
        socket.io.reconnect();
      }
    },
    on: function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    },
    disconnect: function () {
      socket.io.disconnect();
    }
  };
}]);
'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.Session
 * @description
 * # Session
 * Service in the realtalkApp.
 */
angular.module('realtalkApp').service('Session', function Session() {
  this.username = '';
  
  this.create = function(username) {
    this.username = username;
  };
  this.destroy = function() {
    this.username = null;
  };
  this.isloggedin = function () {
    return !!this.username;
  }
  return this;
});

'use strict';

/**
 * @ngdoc service
 * @name realtalkApp.Base64
 * @description
 * # Base64
 * Factory in the realtalkApp.
 * source: http://wemadeyoulook.at/en/blog/implementing-basic-http-authentication-http-requests-angular/
 */
angular.module('realtalkApp').factory('Base64', function() {
  var keyStr = 'ABCDEFGHIJKLMNOP' + 'QRSTUVWXYZabcdef' + 'ghijklmnopqrstuv' + 'wxyz0123456789+/' + '=';
  return {
    encode: function(input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        }
        else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);

      return output;
    },

    decode: function(input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
        alert("There were invalid base64 characters in the input text.\n" + "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" + "Expect errors in decoding.");
      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

      } while (i < input.length);

      return output;
    }
  };
});

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

'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp')
  .controller('HomeCtrl', function () {
  });

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

  socket.connect('https://realtalk.jit.su', {
    'query': 'Authorization=' + Auth.getHeader(),
    'forceNew': true
  });
  
  // Disconnect on route change
  $scope.$on("$destroy", function() {
    socket.disconnect();
  });
});

'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp').controller('SettingsCtrl', ['Me', function(Me) {
    var scope = this;

    scope.user = Me.query();

    scope.save = function() {
        scope.user.$save();
    };
}]);

'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:SigninCtrl
 * @description
 * # SigninCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp')
  .controller('SignInCtrl', function (Auth) {
    var scope = this;
    
    scope.head = "Sign in to start talking!";
    scope.button = "Sign In";
    
    scope.user = {
      username: '',
      password: ''
    };
    
    // Run signout when this view comes up
    Auth.signout();
    
    scope.submit = function () {
      Auth.signin(scope.user.username, scope.user.password);
    };
  });

'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:SignoutCtrl
 * @description
 * # SignoutCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp')
  .controller('SignUpCtrl', ['Auth', 'New', function (Auth, New) {
    var scope = this;
    
    scope.head = "Sign Up to start talking!";
    scope.button = "Sign Up";
    
    scope.user = {
      username: '',
      password: ''
    };
    
    scope.submit = function () {
      Auth.signup(scope.user.username, scope.user.password);
    };
    
    /*
    scope.checkName = function () {
      New.get(function(data) {
        this.posts = data.posts;
        
        ctrl.$setValidity('uniqueEmail', data.isValid);
      });
    };
    */
  }]);

'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:AppctrlCtrl
 * @description
 * # AppctrlCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp')
  .controller('AppCtrl', ['Session', function (Session) {
    this.username = Session.username;
  }]);

'use strict';

/**
 * @ngdoc function
 * @name realtalkApp.controller:FindCtrl
 * @description
 * # FindCtrl
 * Controller of the realtalkApp
 */
angular.module('realtalkApp')
  .controller('FindCtrl', ['Users', 'Contacts', function (Users, Contacts) {
    var scope = this,
        contact;
    
    // Holds user list
    scope.users = {};
    
    // User filter
    scope.filter = '';
    
    scope.findUsers = function () {
      scope.users = Users.query({users: scope.filter});
    };
    
    scope.addUser = function (username) {
      contact = new Contacts({contact: username});
      
      contact.$save({},
        function (res) {
          scope.findUsers();
        }
      );
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name realtalkApp.directive:nav
 * @description
 * # nav
 */
 
angular.module('realtalkApp')
  .directive('nav', ['Auth', 'Session', function (Auth, Session) {
    return {
      templateUrl: 'views/templates/nav.html',
      restrict: 'E',
      controller: function () {
        this.auth = Auth.isSignedIn();
        this.username = Session.username;
      },
      controllerAs: 'nav'
    };
  }]);
'use strict';

/**
 * @ngdoc directive
 * @name realtalkApp.directive:nav
 * @description
 * # nav
 */
angular.module('realtalkApp')
  .directive('homenav', ['Auth', function (Auth) {
    return {
      templateUrl: 'views/templates/homenav.html',
      restrict: 'E',
      controller: function () {
        this.auth = Auth.isSignedIn();
      },
      controllerAs: 'nav'
    };
  }]);
'use strict';

/**
 * @ngdoc directive
 * @name realtalkApp.directive:footer
 * @description
 * # footer
 */
 /*
angular.module('realtalkApp.directives')
  .directive('footer', ['services', function (services) {
    return {
      templateUrl: 'views/templates/footer.html',
      restrict: 'E',
      controller: function () {
        
      },
      controllerAs: 'nav'
    };
  }]);
  */
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
        scope.call = function (username) {
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
          console.log('userlist');
          var i = 0;
          
          for (i; i<scope.contacts.length; i++) {
            // If the contact is in the userlist
            scope.contacts[i].online = (userlist.indexOf(scope.contacts[i].username) !== -1);
          }
        });
        // update availability on userin
        socket.on('userIn', function (username) {
          console.log('userIn: ' + username);
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
          console.log('userOut: ' + username);
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
            $element.val(' ');
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
        
        // Hold the current scope value
        scope.value = ' ';
        
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
      },
      controllerAs: 'input',
      replace: true
    };
  });

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
