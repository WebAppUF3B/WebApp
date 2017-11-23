/*
token for reset password on new user created by admin must be generated at new user creation time
  this needs a function in authUtils

the userPolicyUtils must allow /forgot-password to be public, but reset-password to require a token

forgot password will generate a token on emailing the user and send them to a link that asks for new password

process for admin created user
  user created with fake password
  jwt generated as email is sent
  link in email will contain user id and jwt
  on reset page, jwt parsed out and verified
  if jwt is correct, new password written to database (and salted and all that)

process for forgot password
  user types in email
    200 returned regardless
  if email exists for a user, an email will be sent
    at email send time, jwt also generated
  reset password link sent to user
*/
'use strict';

angular.module('core').controller('ResetPasswordController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$document', 'Authentication',
  function($scope, $rootScope, $http, $state, $stateParams, $document, Authentication) {
    /* Get all the listings, then bind it to the scope */
    $scope.currentUser = {};

    $scope.user = Authentication.user;
    console.log('tw user', $scope.user);

    $scope.authToken = Authentication.authToken;
    console.log('tw auth token', $scope.authToken);

    $scope.isLoggedIn = 0;

    if ($scope.user !== null) {
      $scope.isLoggedIn = 1;
    }
    console.log($scope.isLoggedIn);

    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };

    $document.ready(() => {
      if ($state.current.name === 'reset-password') {
        $scope.init();
      }
    });


    $scope.init = function() {
      $scope.state = 'reset';
      $scope.pass = $stateParams.UserId;

      $scope.getUser()
      .then((results) => {
        //console.log(results);
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
      if ($scope.state === 'reset') {
        console.log('reset');
        console.log(isValid);
        //$scope.update(isValid);
      } else {
        console.log('forgot');
        console.log(isValid);
        //$scope.create(isValid);
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
/*
    $http.post(`${window.location.origin}/api/password/reset/${token}`, $scope.header)
      .catch((err) => {
        $scope.error = true;
        console.log(err);
      });

    $http.post(`${window.location.origin}/api/password/forgot/`, $scope.header)
      .catch((err) => {
        $scope.error = true;
        console.log(err);
      });
*/
  }
]);
