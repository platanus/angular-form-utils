/**
 * Form state handling made easy
 * @version v0.1.3 - 2015-05-25
 * @link https://github.com/platanus/angular-form-utils
 * @author Ignacio Baixas <ignacio@platan.us>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function(angular, undefined) {
'use strict';
angular.module('platanus.formutils', []);

angular.module('platanus.formutils')
  .directive('bsControlGroup', ['$compile', function($compile) {
    return {
      restrict: 'AE',
      controller: ['$scope', function($scope) {
        angular.extend(this, {
          setLabel: function(_contents) { $scope.label = _contents; },
          setHelp: function(_contents) { $scope.help = _contents; },
          setError: function(_contents) { $scope.error = _contents; }
        });
      }],
      template:
        '<div class="form-group" input-aware>\
          <label for="{{for}}"></label>\
          <div class="control-block" ng-transclude></div>\
          <div class="help-block"></div>\
        </div>',
      // replace: true, replacing is being deprecated in future angular releases.
      transclude: true,
      scope: { },
      link: function(_scope, _element, _attrs) {

        _element = _element.contents(); // no replacing!

        var labelBlock = angular.element(_element.children()[0]),
            helpBlock = angular.element(_element.children()[2]);

        function renderLabel(_html) {
          labelBlock.html(_html);
          $compile(labelBlock.contents())(_scope.$parent);
        }

        function renderHelp(_html, _class) {
          helpBlock.attr('class', 'help-block' + (_class ?  (' ' + _class) : ''));
          helpBlock.html(_html);
          $compile(helpBlock.contents())(_scope.$parent);
        }

        function withErrors() {
          return (_scope.$input.dirty && _scope.$input.errors.length > 0);
        }

        function updateHelp() {
          if(withErrors()) {
            _element.addClass('form-group-error');
            renderHelp(_scope.$input.errors[0].tag); // just use first error for now
          } else {
            _element.removeClass('form-group-error');
            renderHelp(_scope.help || '');
          }
        }

        _scope.$watch('label', renderLabel);
        _scope.$watch('help', updateHelp);
        _scope.$watch(function() {
          // Handle errors through input-aware
          return withErrors() ? _scope.$input.errors[0].tag : '';
        }, updateHelp);

        // The following observers are needed to allow controller to override values.

        _attrs.$observe('label', function(_value) {
          if(_value !== undefined) _scope.label = _value;
        });

        _attrs.$observe('help', function(_value) {
          if(_value !== undefined) _scope.help = _value;
        });
      }
    };
  }])
  .directive('bsCgLabel', [function() {
    return {
      restrict: 'AE',
      require: '^bsControlGroup',
      compile: function(_element) {
        var content = _element.html();

        return {
          pre: function(_scope, _element, _attrs, _group) {
            _element.remove(); // remove element contents before they get linked
            _group.setLabel(content);
          }
        };
      }
    };
  }])
  .directive('bsCgHelp', [function() {
    return {
      restrict: 'AE',
      require: '^bsControlGroup',
      compile: function(_element) {
        var content = _element.html();

        return {
          pre: function(_scope, _element, _attrs, _group) {
            _element.remove(); // remove element contents before they get linked
            _group.setHelp(content);
          }
        };
      }
    };
  }]);

angular.module('platanus.formutils')
  .directive('dirtyOnBlur', ['FormUtils', function(FormUtils) {
    return {
      restrict: 'AC',
      require: 'ngModel',
      link: function(_scope, _element, _attrs, _ctrl) {
        _element.on('blur', function() {
          _scope.$apply(function() {
            if(_ctrl.$pristine) {
              FormUtils.forceModelDirty(_ctrl);
            }
          });
        });
      }
    };
  }]);

angular.module('platanus.formutils')
  .directive('input', ['InputAwareHelper', function(helper) {
    return {
      restrict: 'E',
      require: ['?ngModel', '?^inputAware'],
      link: function(_scope, _element, _attrs, _ctrls) {
        if(!_ctrls[0]) return;

        // Make inputs
        if(_ctrls[1]) helper.link(_scope, _attrs.name, _ctrls[0], _ctrls[1]);

        // Make range handle numbers
        if(_attrs.type === 'range') {
          _ctrls[0].$parsers.push(function(_value) {
            if(_value === '') return null;
            return parseFloat(_value, 10);
          });
        }
      }
    };
  }]);

// IDEA: maybe only activate this directives using the FormUtilsConfig provider.
angular.forEach(['select', 'textarea'], function(_directive) {
  angular.module('platanus.formutils')
    .directive(_directive, ['InputAwareHelper', function(helper) {
      return {
        restrict: 'E',
        require: ['?ngModel', '?^inputAware'],
        link: function(_scope, _element, _attrs, _ctrls) {
          if(!_ctrls[0] || !_ctrls[1]) return;
          helper.link(_scope, _attrs.name, _ctrls[0], _ctrls[1]);
        }
      };
    }]);
});

angular.module('platanus.formutils')
  .directive('formFor', [function() {
    return {
      restrict: 'A',
      scope: {
        model: '=formFor'
      },
      controller: ['$scope', function($scope) {
        this.getModel = function() {
          return $scope.model;
        };
      }]
    };
  }]);

angular.module('platanus.formutils')
  .directive('inputAware', [function() {
    return {
      restrict: 'A',
      require: '?^^inputAware',
      link: function(_scope, _elem, _attr, _parent) {
        _scope.$input = {
          dirty: false,
          errors: []
        };

        _scope.$$inputAwareParent = _parent;
      },
      controller: ['$scope', function($scope) {

        var registered = [];

        function refreshScope() {
          var i = 0, dirty = false, errors = [], state, j;
          while((state = registered[i++])) {
            if(state.dirty) dirty = true;
            for(j = 0; j < state.errors.length; j++) {
              errors.push({
                name: state.name,
                tag: state.errors[j]
              });
            }
          }

          $scope.$input.dirty = dirty;
          $scope.$input.errors = errors;
        }

        angular.extend(this, {

          registerInput: function(_name) {

            var state = {
              name: _name,
              dirty: false,
              errors: []
            },
            parentState = $scope.$$inputAwareParent ?
              $scope.$$inputAwareParent.registerInput(_name) : null;

            registered.push(state);

            return {
              setDirty: function(_value) {
                if(parentState) parentState.setDirty(_value);
                state.dirty = _value;
                refreshScope();
              },

              setErrors: function(_errors) {
                if(parentState) parentState.setErrors(_errors);
                state.errors = _errors;
                refreshScope();
              },

              unregister: function() {
                if(parentState) parentState.unregister();
                for(var i = 0, l = registered.length; i < l; i++) {
                  if(registered[i] === state) {
                    registered.splice(i, 1);
                    break;
                  }
                }
              }
            };
          }

        });
      }]
    };
  }]);

angular.module('platanus.formutils')
    // Makes a control group error status bound to an internal input
  .directive('inputAwareInput', ['InputAwareHelper', function(helper) {
    return {
      restrict: 'E',
      require: ['?ngModel', '^inputAware'],
      link: function(_scope, _element, _attrs, _ctrls) {

        if(!_ctrls[1]) return;

        var model = null;
        if(_ctrls[0]) {
          model = _ctrls[0];
        } else {
          // If no model is given, look for one in the group's contents
          var input = _element.find('[ng-model]');
          // TODO: raise error on model not found
          model = input.controller('ngModel');
        }

        helper.link(_scope, (_attrs.inputAwareInput || _attrs.name), model, _ctrls[1]);
      }
    };
  }]);

angular.module('platanus.formutils')
  .directive('inputFor', ['$compile', function($compile) {
    return {
      restrict: 'A',
      scope: {
        model: '='
      },
      priority: 1000,
      terminal: true,
      require: '?^formFor',
      compile: function(_element, _attrs) {

        if(!_attrs.name) _element.attr('name', _attrs.inputFor); // force name attribute
        _element.attr('ng-model','modelAdaptor');
        _element.attr('ng-model-options','{ getterSetter: true }');
        _element.removeAttr('input-for');

        return {
          pre: angular.noop,
          post: function(_scope, _element, _attrs, _form) {

            function model() {
              if(_scope.model) return _scope.model;
              if(_form) return _form.getModel();
              throw 'Missing model declaration at form or input';
            }

            _scope.modelAdaptor = function(_value) {
              if(arguments.length === 0) {
                return model()[_attrs.inputFor];
              } else {
                model()[_attrs.inputFor] = _value;
              }
            };

            $compile(_element)(_scope);
          }
        };
      }
    };
  }]);

angular.module('platanus.formutils')
  .directive('submitValid', ['$parse', 'FormUtils', function($parse, FormUtils) {
    return {
      require: 'form',
      link: function(_scope, _elem, _attr, _ctrl) {
        var fn = $parse(_attr.submitValid),
        fnInvalid = _attr.submitInvalid && $parse(_attr.submitInvalid);

        _elem.on('submit', function(_event) {
          _scope.$apply(function() {
            FormUtils.processForm(_ctrl, function() {
              fn(_scope);
            }, fnInvalid ? function() {
              return fnInvalid(_scope);
            } : null, _event);
          });
        });
      }
    };
  }]);

(function() {

  function errorHashToArray(_errors) {
    var errors = [];
    for(var key in _errors) {
      if(_errors.hasOwnProperty(key) && _errors[key]) {
        errors.push(key);
      }
    }

    return errors;
  }

  angular.module('platanus.formutils')
    .constant('InputAwareHelper', {
      link: function(_scope, _name, _model, _monitor) {

        var state = _monitor.registerInput(_name);

        _scope.$watch(function() {
          return _model.$dirty;
        }, function(_dirty) {
          state.setDirty(_dirty);
        });

        _scope.$watch(function() {
          if(_model.$invalid) {
            return errorHashToArray(_model.$error).join(',');
          } else {
            return null;
          }
        }, function(_errors) {
          _errors = _errors ? _errors.split(',') : [];
          state.setErrors(_errors);
        });

        _scope.$on('$destroy', function() {
          state.unregister();
        });
      }
    });
})();

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

})(angular);