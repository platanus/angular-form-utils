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
          <label for="{{for}}" class="control-label"></label>\
          <div class="control-content">\
            <div ng-transclude></div>\
            <div class="help-block"></div>\
          </div>\
        </div>',
      // replace: true, replacing is being deprecated in future angular releases.
      transclude: true,
      scope: { },
      link: function(_scope, _element, _attrs) {

        _element = _element.contents(); // no replacing!

        var labelBlock = angular.element(_element.children()[0]),
            contentBlock = angular.element(_element.children()[1]),
            helpBlock = angular.element(contentBlock.children()[1]);

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
            _element.addClass('has-error');
            renderHelp(_scope.$input.errors[0].tag); // just use first error for now
          } else {
            _element.removeClass('has-error');
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
