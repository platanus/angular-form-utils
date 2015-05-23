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
