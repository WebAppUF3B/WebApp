'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();
      // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      delete $scope.credentials.confirm;

      $http.post('/api/auth/signup', $scope.credentials).success((response) => {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go('authentication.email-sent');
      }).error((response) => {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success((response) => {
        // If successful we assign the response to the global user model
        console.log(response);
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go('participant-portal', $state.previous.params);
      }).error((response) => {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirectTo=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
    const myDate = new Date();
    $scope.maxDate = new Date(
        myDate.getFullYear(),
        myDate.getMonth(),
        myDate.getDate()
      );
    $scope.minDate = new Date(
        myDate.getFullYear() - 127,
        myDate.getMonth(),
        myDate.getDate()
    );
    $scope.validateConfirmPassword = (confirmation) => {
      const password = $scope.userForm.password.$viewValue;
      if (confirmation && password && confirmation !== password) {
        $scope.userForm.confirm.$setValidity('goodConfirm', false);
        return;
      }
      $scope.userForm.confirm.$setValidity('goodConfirm', true);
    }
  }
]);
