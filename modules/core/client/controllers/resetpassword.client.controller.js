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

angular.module('core').controller('ResetPasswordController', ['$scope', '$rootScope', 'NgTableParams', '$http', '$state', '$stateParams', '$document', 'Authentication', 'PasswordValidator',
  function($scope, $rootScope, NgTableParams, $http, $state, $stateParams, $document, Authentication, PasswordValidator) {
    /* Get all the listings, then bind it to the scope */
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    $scope.currentUser = {};
    $scope.credentials = null;

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
      $scope.init();
    });


    $scope.init = function() {
      $scope.pass = $stateParams.email;
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

    $scope.resetPassword = function(isValid) {
      if (!isValid) {
        return;
      }
      console.log($scope.credentials.confirmNewPassword);
      $scope.credentials.token = $stateParams.token;
      //$scope.credentials.confirmNewPassword
      return $http.post(window.location.origin + '/api/password/reset', $scope.credentials)
      .then((results) => {
        $state.go(authentication.signin);
      })
      .catch((err) => {
        console.log(err);
        return err;
      });
    };


    $scope.forgotPassword = function() {
      //console.log($stateParams.userId);
      return $http.get(window.location.origin + '/api/password/forgotPassword/' + $stateParams.email, $scope.header)
      .then((results) => {
        return results;
      })
      .catch((err) => {
        return err;
      });
    };

    $scope.validateConfirmPassword = (confirmNewPassword) => {
      const password = $scope.userForm.newPassword.$viewValue;
      if (confirmNewPassword && password && confirmNewPassword !== password) {
        $scope.userForm.confirmNewPassword.$setValidity('goodConfirm', false);
        return;
      }
      $scope.userForm.confirmNewPassword.$setValidity('goodConfirm', true);
      console.log('match');

    };

  }
]);
