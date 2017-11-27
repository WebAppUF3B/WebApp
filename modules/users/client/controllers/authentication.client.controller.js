'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();
    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    function init() {
      $scope.credentials = {};
      $scope.focus = false;
      if ($scope.authentication.user) {
        if ($scope.authentication.user.role === 'participant') {
          $state.go('participant-portal');
        } else if ($scope.authentication.user. role === 'researcher') {
          $state.go('researcher-portal');
        } else if ($scope.authentication.user. role === 'faculty') {
          $state.go('faculty-portal');
        } else if ($scope.authentication.user. role === 'admin') {
          $state.go('admin-portal');
        }
      }
    }
    init();

    $scope.signup = function(isValid) {
      $scope.error = null;
      $scope.credentials.birthday = $('#birthday').val();

      console.log($scope.credentials);

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'All fields are required.';
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

    $scope.facultySignup = function(isValid) {
      $scope.error = null;
      $scope.credentials.birthday = $('#birthday').val();
      $scope.credentials.position = 'Faculty';

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'All fields are required.';
        return false;
      }
      delete $scope.credentials.confirm;

      $http.post('/api/auth/signup/faculty', $scope.credentials).success((response) => {
        $scope.authentication.user = response;

        $state.go('authentication.email-sent');
      }).error((response) => {
        $scope.error = response.message;
      });
    };

    $scope.researcherSignup = function(isValid) {
      $scope.error = null;
      $scope.credentials.birthday = $('#birthday').val();

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'All fields are required.';
        return false;
      }
      delete $scope.credentials.confirm;

      $http.post('/api/auth/signup/researcher', $scope.credentials).success((response) => {
        $scope.authentication.user = response;

        $state.go('authentication.email-sent');
      }).error((response) => {
        $scope.error = response.message;
      });
    };

    $scope.toggleBirthdayFocus = function() {
      $scope.focus = !$scope.focus;
      if ($scope.focus) $('#birthday').focus();
      else $('#birthday').blur();
    };

    $('#birthday').focus(() => {
      $scope.focus = true;
    });

    $scope.signin = function(isValid) {
      $scope.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'Please enter your username and password.';
        return false;
      }

      $scope.credentials.email = $scope.credentials.email.toLowerCase();

      $http.post('/api/auth/signin', $scope.credentials).success((response) => {
        localStorage.setItem('authToken', JSON.stringify(response.authToken));
        $scope.authentication.authToken = response.authToken;
        localStorage.setItem('user', JSON.stringify(response.user));
        $scope.authentication.user = response.user;
        redirect(response.user);
      }).error((response) => {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function(url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirectTo=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
    $scope.validateConfirmPassword = (confirmation) => {
      const password = $scope.userForm.password.$viewValue;
      if (confirmation && password && confirmation !== password) {
        $scope.userForm.confirm.$setValidity('goodConfirm', false);
        return;
      }
      $scope.userForm.confirm.$setValidity('goodConfirm', true);
    };
    const redirect = (response) => {
      // If successful we assign the response to the global user model
      console.log(response);
      $scope.authentication.user = response;

      let destination;
      switch ($scope.authentication.user.role) {
        case 'participant':
          destination = 'participant-portal';
          break;
        case 'faculty':
          destination = 'faculty-portal';
          break;
        case 'researcher':
          destination = 'researcher-portal';
          break;
        case 'admin':
          destination = 'admin-portal';
          break;
        default:
          $scope.error = 'Your role doesn\'t exist, what did you do?';
          break;
      }

      // And redirect to the previous or home page
      if (!$scope.error) $state.go(destination, $state.previous.params);
    };
  }
]);
