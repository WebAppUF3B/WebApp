'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', '$state', 'Authentication',
  function($scope, $http, $location, Users, $state, Authentication) {
    $scope.user = Authentication.user;
    $scope.authToken = Authentication.authToken;
    $scope.loading = Authentication.loading;
    $scope.error = null;
    $scope.success = null;
    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };

    const init = function() {
      $http.get(window.location.origin + '/api/profile/', $scope.header)
        .then((result) => {
          $scope.copiedUser = result.data;
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

    // Update a user profile
    $scope.updateUserProfile = function(isValid) {
      $scope.success = $scope.error = null;

      console.log('user birthday? ', $scope.copiedUser.birthday);
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'Please fill in all fields.';
        return false;
      }

      $scope.$broadcast('show-errors-reset', 'userForm');

      $http.put(window.location.origin + '/api/profile/', $scope.copiedUser, $scope.header)
        .then((result) => {
          $scope.success = true;
          console.log('result in client controller:\n', result.data.user);
          const resultedUser = result.data.user;
          $scope.user.birthday = resultedUser.birthday;
          $scope.user.firstName = resultedUser.firstName;
          $scope.user.lastName = resultedUser.lastName;
          $scope.user.address = resultedUser.address;
          $scope.user.position = resultedUser.position;
          $scope.user.gender = resultedUser.gender;
          localStorage.setItem('user', JSON.stringify($scope.user));
        })
        .catch((err) => {
          $scope.error = 'There was an error updating your profile, please contact the admin.';
        });
    };
    init();
  }
]);
