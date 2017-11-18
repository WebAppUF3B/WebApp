'use strict';

angular.module('core').controller('AdminEditCreateController', ['$scope', '$rootScope', 'NgTableParams', '$http', '$state', '$stateParams', '$document', 'Authentication',
  function($scope, $rootScope, NgTableParams, $http, $state, $stateParams, $document, Authentication) {
    /* Get all the listings, then bind it to the scope */
    $scope.currentUser = {};

    $scope.user = Authentication.user;
    console.log('tw user', $scope.user);

    $scope.authToken = Authentication.authToken;
    console.log('tw auth token', $scope.authToken);

    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };

    $document.ready(() => {
      if ($state.current.name === 'edit-user') {
        $scope.init();
      }
    });


    $scope.init = function() {
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
      })
      .catch((err) => {
        console.log(err);
      });

    };

    $scope.submit = function(isValid) {
      $scope.error = null;
      console.log(isValid);
      if ($scope.state === 'edit') {
        console.log('edit');
        $scope.update(isValid);
      } else {
        console.log('create');
        $scope.create(isValid);
      }
    };

    $scope.getUser = function() {
      //console.log($stateParams.userId);
      return $http.get(window.location.origin + '/api/admin/editUser/' + $stateParams.userId, $scope.header)
      .then((results) => {
        return results;
      })
      .catch((err) => {
        return err;
      });
    };
// gonna be create user eventually
    $scope.create = function(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'Please fill in all required fields.';
        return false;
      }

      $http.post('/api/admin/createUser', $scope.currentUser, $scope.header).success((response) => {
        // If successful we assign the response to the global user model
        // And redirect to the previous or home page
        console.log(response._id);
        $state.go('studies.availability', { 'studyId': response._id });
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });
    };


    $scope.update = function(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.error = 'Please fill in all required fields.';
        return false;
      }

      console.log($scope.currentUser);
      $http.put('/api/admin/editUser/' + $stateParams.userId, $scope.currentUser, $scope.header).success((response) => {
        $state.go('manage-users');
      }).error((response) => {
        $scope.error = response.message;
      });
    };

  }
]);
