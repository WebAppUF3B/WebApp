'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function($scope, $http, $location, Users, Authentication) {
    const user = Authentication.user;
    console.log('user before', user);
    $scope.copiedUser = $.extend({}, Authentication.user);
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
      $http.put(window.location.origin + '/api/profile/', $scope.copiedUser)
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
        });
    };
  }
]);
