'use strict';

describe('Service: talk', function () {

  // load the service's module
  beforeEach(module('realtalkApp'));

  // instantiate service
  var talk;
  beforeEach(inject(function (_talk_) {
    talk = _talk_;
  }));

  it('should do something', function () {
    expect(!!talk).toBe(true);
  });

});
