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
