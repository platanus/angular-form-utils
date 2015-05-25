'use strict';

describe('input-for attribute', function() {

  var setInputValue = function(element, value) {
    element.val(value);
    element.triggerHandler('change');
  };

  beforeEach(module('platanus.formutils'));

  var element, scope, form, inputs, Utils;

  beforeEach(inject(function(FormUtils, $rootScope, $compile) {
    Utils = FormUtils;

    element = angular.element(
      '<form form-for="inputs" name="form" input-aware>\
        <input type="text" input-for="text1" required=""/>\
      </form>'
    );

    scope = $rootScope.$new();
    $compile(element)(scope);

    inputs = scope.inputs = {
      text1: 'foo'
    };

    scope.$digest();
    form = scope.form;
  }));

  it('should use name attribute to map to the form-for model property', function() {
    setInputValue(element.find('input'), 'foo');
    expect(inputs.text1).toEqual('foo');
    setInputValue(element.find('input'), '');
  });

  it('should properly handle undefined values when handling invalid input', function() {
    setInputValue(element.find('input'), '');
    expect(inputs.text1).toEqual(undefined);
  });

  it('should correctly interface with input-aware', function() {
    setInputValue(element.find('input'), '');
    expect(scope.$input.errors.length).toEqual(1);
  });

  it('should properly assign model in form model', function() {
    expect(form.text1).toBeDefined();
  });

});
