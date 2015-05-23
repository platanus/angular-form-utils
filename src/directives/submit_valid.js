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
