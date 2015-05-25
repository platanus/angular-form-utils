'use strict';

describe('extended input element', function() {

  var setInputValue = function(element, value) {
    element.val(value);
    element.triggerHandler('change');
  };

  beforeEach(module('platanus.formutils'));

  var element, scope, form, inputs, Utils;

  beforeEach(inject(function(FormUtils, $rootScope, $compile) {
    Utils = FormUtils;

    element = angular.element(
      '<form form-for="inputs" name="form">\
        <input type="range" min="1" max="30" input-for="number1" required=""/>\
      </form>'
    );

    scope = $rootScope.$new();
    $compile(element)(scope);

    inputs = scope.inputs = {
      number1: 10
    };

    scope.$digest();
    form = scope.form;
  }));

  it('should properly parse range as number', function() {
    setInputValue(element.find('input'), '20');
    expect(typeof inputs.number1).toEqual('number');
    setInputValue(element.find('input'), '40');
    expect(inputs.number1).toEqual(30);
  });

});
