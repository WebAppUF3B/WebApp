'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function($scope, $http, $location, Users, Authentication) {
    $scope.user = $.extend({}, Authentication.user);
    // Update a user profile
    console.log('View here', $scope.user);
    $scope.updateUserProfile = function(isValid) {
      $scope.success = $scope.error = null;
      $scope.user.birthday = $('#birthday').val();
      console.log('user birthday? ', $scope.user.birthday);
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }
      //var user = new Users($scope.user);
      const id = $scope.user._id;
      console.log(id);

      // let user = {
      //   firstName: $scope.user.firstName,
      //   lastName: $scope.user.lastName,
      //   gender: $scope.user.gender,
      //   _id: id
      // };
      // $scope.user.update;
      //$scope.user.update(id, user);
      //Users.update();
      $scope.$broadcast('show-errors-reset', 'userForm');
      $scope.success = true;
      //Authentication.user = response;
      //$http.get(window.location.origin + '/api/profile/' + id);
      $http.put(window.location.origin + '/api/profile/', $scope.user)
        .then((result) => {
          console.log('result in client controller:\n', result.data.user);
          Authentication.user = result.data.user;
        });
    };
  }
]);
