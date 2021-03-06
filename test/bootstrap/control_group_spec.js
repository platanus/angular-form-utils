'use strict';

describe('bs-control-group element', function() {

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
        <bs-control-group label="{{ label }}" help="Some help">\
          <input type="text" name="text1" required="" ng-model="inputs.text1">\
        </bs-control-group>\
      </form>'
    );


    scope = $rootScope.$new();
    $compile(element)(scope);

    scope.label = 'Text 1';
    inputs = scope.inputs = {
      text1: ''
    };
    scope.$digest();

    element = element.find('bs-control-group').contents();
    form = scope.form;
  }));

  it('should add class has-error if there are validation errors and input is dirty', function() {
    expect(element.hasClass('has-error')).toBeFalsy(); // not dirty and invalid
    setInputValue(element.find('input'), 'hello');
    expect(element.hasClass('has-error')).toBeFalsy(); // dirty but valid
    setInputValue(element.find('input'), '');
    expect(element.hasClass('has-error')).toBeTruthy(); // dirty and invalid
  });

  it('should properly set the label value', function() {
    var labelBlock = angular.element(element.children()[0]);
    expect(labelBlock[0].tagName).toEqual('LABEL');
    expect(labelBlock.text()).toEqual('Text 1');
  });

  it('should properly set the help block value', function() {
    var contentBlock = angular.element(element.children()[1]),
        helpBlock = angular.element(contentBlock.children()[1]);

    expect(helpBlock[0].tagName).toEqual('DIV');
    expect(helpBlock.hasClass('help-block')).toBeTruthy();
    expect(helpBlock.text()).toEqual('Some help');
  });

});

