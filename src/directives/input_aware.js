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
