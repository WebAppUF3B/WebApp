'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', '$state', 'Authentication',
  function($scope, $http, $location, Users, $state, Authentication) {
    $scope.user = Authentication.user;
    $scope.authToken = Authentication.authToken;
    Authentication.loading = true;
    $scope.error = null;
    $scope.success = null;
    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };

    // Run when the page loads
    const init = function() {
      $http.get(window.location.origin + '/api/profile/', $scope.header)
        .then((result) => {
          $scope.copiedUser = result.data;
          Authentication.loading = false;
        })
        .catch((err) => {
          $scope.error = 'Unable to retrieve user.';
          Authentication.loading = false;
        });
    };

    // When you click the calendar, the date panel appears
    $scope.toggleBirthdayFocus = function() {
      $scope.focus = !$scope.focus;
      if ($scope.focus) $('#birthday').focus();
      else $('#birthday').blur();
    };

    $('#birthday').focus(() => {
      $scope.focus = true;
    });

    // Update a user profile
    $scope.updateUserProfile = function(isValid) {
      Authentication.loading = true;
      $scope.success = $scope.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'Please fill in all fields.';
        Authentication.loading = false;
        return false;
      }

      $scope.$broadcast('show-errors-reset', 'userForm');

      $http.put(window.location.origin + '/api/profile/', $scope.copiedUser, $scope.header)
        .then((result) => {
          $scope.success = true;
          const resultedUser = result.data.user;
          $scope.user.birthday = resultedUser.birthday;
          $scope.user.firstName = resultedUser.firstName;
          $scope.user.lastName = resultedUser.lastName;
          $scope.user.address = resultedUser.address;
          $scope.user.position = resultedUser.position;
          $scope.user.gender = resultedUser.gender;
          localStorage.setItem('user', JSON.stringify($scope.user));
          Authentication.loading = false;
        })
        .catch((err) => {
          $scope.error = 'There was an error updating your profile, please contact the admin.';
          Authentication.loading = false;
        });
    };
    init();
  }
]);
