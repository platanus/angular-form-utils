'use strict';

describe('input-aware element', function() {

  var setInputValue = function(element, value) {
    element.val(value);
    element.triggerHandler('change');
  };

  beforeEach(module('platanus.formutils'));

  var element, scope, form, inputs, Utils;

  beforeEach(inject(function(FormUtils, $rootScope, $compile) {
    Utils = FormUtils;

    element = angular.element(
      '<form name="form" input-aware>\
        <input type="text" name="text1" required="" ng-model="inputs.text1">\
      </form>'
    );

    scope = $rootScope.$new();
    $compile(element)(scope);

    inputs = scope.inputs = {
      text1: ''
    };
    scope.$digest();

    form = scope.form;
  }));

  it('should provide contained input-aware-input state as scope properties', function() {
    expect(scope.$input.errors).toEqual([ { name: 'text1', tag: 'required' } ]);
    expect(scope.$input.dirty).toEqual(false);
    setInputValue(element.find('input'), 'other');
    expect(scope.$input.dirty).toEqual(true);
  });

});

