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
      console.log(id);
      let user = {
        firstName: $scope.user.firstName,
        lastName: $scope.user.lastName,
        _id: id
      };
      //$scope.user.update(id, user);
      Users.update(user);
      $scope.$broadcast('show-errors-reset', 'userForm');
      $scope.success = true;
      //Authentication.user = response;
      $http.get(window.location.origin + '/api/profile/' + id);
    };
  }
]);
