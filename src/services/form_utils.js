angular.module('platanus.formutils')
  // The FormUtils service contains various
  .factory('FormUtils', ['FormUtilsConfig', function(config) {

    var utils = {
      // forces a model to its dirty status
      forceModelDirty: function(_model) {
        if(_model.$setDirty) {
          _model.$setDirty(true); // angular 1.3+
        } else {
          _model.$setViewValue(_model.$viewValue);
        }
      },
      // forces an entire form to its dirty status, this triggers validations on pristine fields
      forceFormDirty: function(_form) {
        angular.forEach(_form, function(_value) {
          if(_value && _value.$pristine) {
            utils.forceModelDirty(_value);
          }
        });
      },
      // provides a default behaviour for processing forms
      processForm: function(_form, _success, _invalid, _event) {
        utils.forceFormDirty(_form);
        // TODO: handle async validations!
        _invalid = _invalid || config.invalidHandler;
        if(_form.$valid || (_invalid && _invalid(_form, _event) !== false)) {
          _success(_form, _event);
        }
      },
      // sets a model value as if was set by the user
      setModelAsUser: function(_model, _value) {
        _model.$setViewValue(_value);
        if(_model.$setDirty) _model.$setDirty(true); // angular 1.3+
        _model.$render();
      },
      // fills a form fields as if were set by the user
      fillFormAsUser: function(_form, _data) {
        angular.forEach(_data, function(v, k) {
          var model = _form[k];
          if(model && model.$setViewValue) utils.setModelAsUser(model, v);
        });
      }
    };

    return utils;
  }])
  // The FormUtils provider allows configuring some form utils global behaviors
  .provider('FormUtilsConfig', [function() {

    var config = {};

    return {
      $get: ['$injector', function($injector) {
        if(config.invalidHandler) {
          // the invalid handler is passed through the injector
          var handler = config.invalidHandler;
          config.invalidHandler = function(_form, _event) {
            return $injector.invoke(handler, null, { $form: _form, $event: _event });
          };
        }
        return config;
      }],

      // Sets the global invalid form submit handler
      setInvalidHandler: function(_handler) {
        config.invalidHandler = _handler;
      }
    };
  }]);

