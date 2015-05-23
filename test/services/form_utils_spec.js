'use strict';

describe('FormUtils service', function() {

  beforeEach(module('platanus.formutils'));

  var element, scope, form, inputs, Utils;

  beforeEach(inject(function(FormUtils, $rootScope, $compile) {
    Utils = FormUtils;

    element = angular.element(
      '<form name="form">\
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

  describe('revalidateForm', function() {

    it('should change form state to invalid if initial data is invalid', function() {
      expect(form.text1.$dirty).toEqual(false);
      Utils.forceFormDirty(form);
      expect(form.text1.$dirty).toEqual(true);
    });

  });

});

