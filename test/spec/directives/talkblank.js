'use strict';

describe('Directive: talkBlank', function () {

  // load the directive's module
  beforeEach(module('realtalkApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<talk-blank></talk-blank>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the talkBlank directive');
  }));
});
