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