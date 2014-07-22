'use strict';

describe('Directive: talkChat', function () {

  // load the directive's module
  beforeEach(module('realtalkApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<talk-chat></talk-chat>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the talkChat directive');
  }));
});
