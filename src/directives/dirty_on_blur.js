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
