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
        _element.attr('name', _attrs.inputFor || _attrs.name);
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
              if(typeof _value === 'undefined') {
                return model()[_attrs.inputFor || _attrs.name];
              } else {
                model()[_attrs.inputFor || _attrs.name] = _value;
              }
            };

            $compile(_element)(_scope);
          }
        };
      }
    };
  }]);
