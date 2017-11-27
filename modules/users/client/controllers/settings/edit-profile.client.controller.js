'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', '$state', 'Authentication',
  function($scope, $http, $location, Users, $state, Authentication) {
    const user = Authentication.user;
    console.log('user before', user);
    $scope.user = Authentication.user;
    $scope.authToken = Authentication.authToken;
    $scope.loading = Authentication.loading;
    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };
    $scope.copiedUser = $.extend({}, Authentication.user);

    $scope.toggleBirthdayFocus = function() {
      $scope.focus = !$scope.focus;
      if ($scope.focus) $('#birthday').focus();
      else $('#birthday').blur();
    };

    $('#birthday').focus(() => {
      $scope.focus = true;
    });

    // Update a user profile
    console.log('View here', $scope.copiedUser);
    $scope.updateUserProfile = function(isValid) {
      console.log('stuff', $scope.copiedUser);
      $scope.success = $scope.error = null;

      console.log('user birthday? ', $scope.copiedUser.birthday);
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }
      //var user = new Users($scope.copiedUser);
      const id = $scope.copiedUser._id;
      console.log(id);

      // let user = {
      //   firstName: $scope.copiedUser.firstName,
      //   lastName: $scope.copiedUser.lastName,
      //   gender: $scope.copiedUser.gender,
      //   _id: id
      // };
      // $scope.copiedUser.update;
      //$scope.copiedUser.update(id, user);
      //Users.update();
      $scope.$broadcast('show-errors-reset', 'userForm');
      $scope.success = true;
      //Authentication.user = response;
      //$http.get(window.location.origin + '/api/profile/' + id);
      $http.put(window.location.origin + '/api/profile/', $scope.copiedUser, $scope.header)
        .then((result) => {
          console.log('result in client controller:\n', result.data.user);
          const resultedUser = result.data.user;
          user.birthday = resultedUser.birthday;
          user.firstName = resultedUser.firstName;
          user.lastName = resultedUser.lastName;
          user.address = resultedUser.address;
          user.position = resultedUser.position;
          user.gender = resultedUser.gender;
          console.log('user after', user);
          alert('Profile updated successfully');
          $state.go('authentication.signin');
        });
    };
  }
]);
