'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function(isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      //var user = new Users($scope.user);
      let id = $scope.user._id;
      let user = {
        firstName: $scope.user.firstName,
        lastName: $scope.user.lastName,
        email: $scope.user.email
      };

      Users.update(id, user).then(function(response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
        //$state.go();
      }, function(response) {
        $scope.error = response.data.message;
      });
    };
  }
]);
