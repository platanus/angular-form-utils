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
        '<div class="control-group" input-aware ng-class="{ \'error\': !!error }">\
          <label class="control-label" for="{{for}}"></label>\
          <div class="controls">\
            <div style="display: inline-block" ng-transclude></div>\
            <span class="help-inline"></span>\
          </div>\
        </div>',
      replace: true,
      transclude: true,
      scope: { },
      link: function(_scope, _element, _attrs) {

        var labelBlock = _element.find('label.control-label'),
            helpBlock = _element.find('.controls .help-inline');

        function renderLabel(_html) {
          labelBlock.html(_html);
          $compile(labelBlock.contents())(_scope.$parent);
        }

        function renderHelp(_html, _class) {
          helpBlock.attr('class', 'help-inline' + (_class ?  (' ' + _class) : ''));
          helpBlock.html(_html);
          $compile(helpBlock.contents())(_scope.$parent);
        }

        function withErrors() {
          return (_scope.$input.dirty && _scope.$input.errors.length > 0);
        }

        function updateHelp() {
          if(withErrors()) {
            renderHelp(_scope.$input.errors[0].tag, 'ks-error'); // just use first error for now
          } else {
            renderHelp(_scope.help || '');
          }
        }

        _scope.$watch('label', renderLabel);
        _scope.$watch('help', updateHelp);

        // Handle errors through input-aware
        _scope.$watch('$input.errors', updateHelp);

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
