'use strict';

describe('input-for attribute', function() {

  var setInputValue = function(element, value) {
    element.val(value);
    element.triggerHandler('change');
  };

  beforeEach(module('platanus.formutils'));

  var element, scope, inputs, Utils;

  beforeEach(inject(function(FormUtils, $rootScope, $compile) {
    Utils = FormUtils;

    element = angular.element(
      '<form form-for="inputs" input-aware>\
        <input type="text" input-for="text1" required=""/>\
      </form>'
    );

    scope = $rootScope.$new();
    $compile(element)(scope);

    inputs = scope.inputs = {
      text1: ''
    };
    scope.$digest();
  }));

  it('should use name attribute to map to the form-for model property', function() {
    setInputValue(element.find('input'), 'foo');
    expect(inputs.text1).toEqual('foo');
  });

  it('should correctly interface with input-aware', function() {
    expect(scope.$input.errors.length).toEqual(1);
  });

});
