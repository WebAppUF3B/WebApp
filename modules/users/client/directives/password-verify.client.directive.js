'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        scope.$watch(() => {
          let combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, (value) => {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              const origin = scope.passwordVerify;
              return origin === password;
            };
          }
        });
      }
    };
  }]);
