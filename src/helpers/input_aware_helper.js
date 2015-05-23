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
