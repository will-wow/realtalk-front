'use strict';

describe('Controller: AppctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('realtalkApp'));

  var AppctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AppctrlCtrl = $controller('AppctrlCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
