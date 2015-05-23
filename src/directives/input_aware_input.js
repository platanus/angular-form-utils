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

// IDEA: maybe only activate this directives using the FormUtilsConfig provider.
angular.forEach(['input', 'select', 'textarea'], function(_directive) {
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
