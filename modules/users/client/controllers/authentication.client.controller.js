'use strict';
angular.module('users.signup', ['ui.bootstrap']).config(['$uibTooltipProvider',
function($uibTooltipProvider) {
  $uibTooltipProvider.options({
    trigger: 'focus'
  });
}]);

angular.module('users.signup').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();
    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // Runs on page load
    function init() {
      Authentication.loading = true;
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
      Authentication.loading = false;
    }
    init();

    // Sign up function for participants
    $scope.signup = function(isValid) {
      Authentication.loading = true;
      $scope.error = null;
      $scope.credentials.birthday = $('#birthday').val();

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'All fields are required.';
        Authentication.loading = false;
        return false;
      }

      delete $scope.credentials.confirm;

      // Post to normal participant sign up in backend
      $http.post('/api/auth/signup', $scope.credentials).success((response) => {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        Authentication.loading = false;
        $state.go('authentication.email-sent');
      }).error((response) => {
        $scope.error = response.message;
        Authentication.loading = false;
      });
    };

    // Sign up function for faculty
    $scope.facultySignup = function(isValid) {
      Authentication.loading = true;
      $scope.error = null;
      $scope.credentials.birthday = $('#birthday').val();
      $scope.credentials.position = 'Faculty';

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'All fields are required.';
        Authentication.loading = false;
        return false;
      }
      delete $scope.credentials.confirm;

      // Post to faculty sign up in backend
      $http.post('/api/auth/signup/faculty', $scope.credentials).success((response) => {
        $scope.authentication.user = response;

        Authentication.loading = false;
        $state.go('authentication.email-sent');
      }).error((response) => {
        $scope.error = response.message;
        Authentication.loading = false;
      });
    };

    // Signup function for researcher
    $scope.researcherSignup = function(isValid) {
      Authentication.loading = true;
      $scope.error = null;
      $scope.credentials.birthday = $('#birthday').val();

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'All fields are required.';
        Authentication.loading = false;
        return false;
      }
      delete $scope.credentials.confirm;

      // Post to researcher sign up in backend
      $http.post('/api/auth/signup/researcher', $scope.credentials).success((response) => {
        $scope.authentication.user = response;

        Authentication.loading = false;
        $state.go('authentication.email-sent');
      }).error((response) => {
        $scope.error = response.message;
        Authentication.loading = false;
      });
    };

    // Clicking calendar opens birthday menu
    $scope.toggleBirthdayFocus = function() {
      $scope.focus = !$scope.focus;
      if ($scope.focus) $('#birthday').focus();
      else $('#birthday').blur();
    };

    $('#birthday').focus(() => {
      $scope.focus = true;
    });

    // Sign in for all users
    $scope.signin = function(isValid) {
      Authentication.loading = true;
      $scope.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'Please enter your username and password.';
        Authentication.loading = false;
        return false;
      }

      $scope.credentials.email = $scope.credentials.email.toLowerCase();

      // Post to backend to signin
      $http.post('/api/auth/signin', $scope.credentials).success((response) => {
        localStorage.setItem('authToken', JSON.stringify(response.authToken));
        $scope.authentication.authToken = response.authToken;
        localStorage.setItem('user', JSON.stringify(response.user));
        $scope.authentication.user = response.user;
        redirect(response.user);
      }).error((response) => {
        $scope.error = response.message;
        Authentication.loading = false;
      });
    };

    // Validate passwords match
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
