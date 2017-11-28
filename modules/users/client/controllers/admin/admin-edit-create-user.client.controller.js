'use strict';

angular.module('users.adminEdit').controller('AdminEditCreateController', ['$scope', '$rootScope', 'NgTableParams', '$http', '$state', '$stateParams', '$document', 'Authentication',
  function($scope, $rootScope, NgTableParams, $http, $state, $stateParams, $document, Authentication) {
    /* Get all the listings, then bind it to the scope */
    Authentication.loading = true;
    $scope.currentUser = {};

    $scope.user = Authentication.user;
    $scope.authToken = Authentication.authToken;
    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
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

    // Runs when the page loads
    $scope.init = function() {
      if ($state.current.name === 'edit-user') {

        $scope.state = 'edit';
        $scope.pass = $stateParams.UserId;

        $scope.getUser()
        .then((results) => {
          //console.log(results); //THIS LINE IS CURSED! IT RETURNS A 400 FROM AN ENTIRELY DIFFERENT CONTROLLER
          $scope.currentUser.firstName = results.data.firstName;
          $scope.currentUser.lastName = results.data.lastName;
          $scope.currentUser.email = results.data.email;
          $scope.currentUser.birthday = results.data.birthday;
          $scope.currentUser.address = results.data.address;
          $scope.currentUser.gender = results.data.gender;
          $scope.currentUser.role = results.data.role;
          $scope.currentUser.position = results.data.position;
          Authentication.loading = false;
        })
        .catch((err) => {
          Authentication.loading = false;
          console.log(err);
        });
      } else {
        Authentication.loading = false;
      }
    };

    // Click submit button
    $scope.submit = function(isValid) {
      Authentication.loading = true;
      $scope.error = null;
      if ($scope.state === 'edit') {
        console.log('edit');
        $scope.update(isValid);
      } else {
        console.log('create');
        $scope.create(isValid);
      }
    };

    // Get user if editing
    $scope.getUser = function() {
      return $http.get(window.location.origin + '/api/admin/editUser/' + $stateParams.userId, $scope.header)
      .then((results) => {
        Authentication.loading = false;

        return results;
      })
      .catch((err) => {
        Authentication.loading = false;

        return err;
      });
    };

    // Create user
    $scope.create = function(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'Please fill in all required fields.';
        Authentication.loading = false;
        return false;
      }
      $scope.currentUser.birthday = $('#birthday').val();

      $http.post('/api/admin/createUser', $scope.currentUser, $scope.header).success((response) => {
        // If successful we assign the response to the global user model
        // And redirect to the previous or home page
        $state.go('manage-users', { 'edit-user': response._id });
      }).error((response) => {
        $scope.error = response.message;
        Authentication.loading = false;
      });
    };

    // Update user
    $scope.update = function(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'Please fill in all required fields.';
        Authentication.loading = false;
        return false;
      }
      $scope.currentUser.birthday = $('#birthday').val();
      $http.put('/api/admin/editUser/' + $stateParams.userId, $scope.currentUser, $scope.header).success((response) => {
        $state.go('manage-users');
      }).error((response) => {
        $scope.error = response.message;
        Authentication.loading = false;
      });
    };
    $scope.init();
  }
]);
