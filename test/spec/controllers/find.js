'use strict';

describe('Controller: FindCtrl', function () {

  // load the controller's module
  beforeEach(module('realtalkApp'));

  var FindCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FindCtrl = $controller('FindCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
