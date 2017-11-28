'use strict';

angular.module('users.password', ['ui.bootstrap']).config(['$uibTooltipProvider',
function($uibTooltipProvider) {
  $uibTooltipProvider.options({
    trigger: 'focus'
  });
}]);

angular.module('users.password').controller('ResetPasswordController', ['$scope', '$rootScope', 'NgTableParams', '$http', '$state', '$stateParams', '$document', 'Authentication', 'PasswordValidator',
  function($scope, $rootScope, NgTableParams, $http, $state, $stateParams, $document, Authentication, PasswordValidator) {
    /* Get all the listings, then bind it to the scope */
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    $scope.currentUser = {};
    $scope.credentials = null;

    $scope.user = Authentication.user;
    $scope.authToken = Authentication.authToken;
    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };
    let isLoggedIn = false;

    $document.ready(() => {
      if ($scope.user) {
        isLoggedIn = true;
      }

      if ($state.current.name === 'forgot-password' && isLoggedIn) {
        $state.go('reset-password-known');
      }
      if ($state.current.name === 'reset-password-known' && !isLoggedIn) {
        $state.go('forgot-password');
      }
      $scope.init();
    });


    $scope.init = function() {
      $scope.pass = $stateParams.email;
    };

    // Password change for users not logged in
    $scope.resetPassword = function(isValid) {
      $scope.error = null;

      const password = $scope.userForm.newPassword.$viewValue;
      const confirmNewPassword = $scope.userForm.confirmNewPassword.$viewValue;
      if (!isValid) {
        $scope.error = 'Please fill in all fields';
        return;
      }
      if (confirmNewPassword && password && confirmNewPassword !== password) {
        $scope.error = 'Your new passwords don\'t match';
        return;
      }
      if (!PasswordValidator.getResult(password).strong) {
        $scope.error = 'Your new password doesn\'t meet the required constraints';
      }
      $scope.credentials.token = $stateParams.token;
      return $http.post(window.location.origin + '/api/password/reset', $scope.credentials)
      .then(() => {
        alert('Your password was succesfully reset.');
        $state.go('authentication.signin');
      })
      .catch((err) => {
        $scope.error = err.data;
        return err;
      });
    };

    //password change for users logged in
    $scope.resetPasswordKnown = function(isValid) {
      $scope.error = null;

      const password = $scope.userForm.newPassword.$viewValue;
      const confirmNewPassword = $scope.userForm.confirmNewPassword.$viewValue;
      if (!isValid) {
        $scope.error = 'Please fill in all fields';
        return;
      }
      if (confirmNewPassword && password && confirmNewPassword !== password) {
        $scope.error = 'Your new passwords don\'t match';
        return;
      }
      if (!PasswordValidator.getResult(password).strong) {
        $scope.error = 'Your new password doesn\'t meet the required constraints';
      }
      $scope.credentials.userId = $scope.user._id;
      console.log($scope.credentials.userId);
      return $http.post(window.location.origin + '/api/password/change', $scope.credentials)
      .then(() => {
        alert('Your password was succesfully reset.');
        $state.go('authentication.signin');
      })
      .catch((err) => {
        $scope.error = err.data;
        return err;
      });
    };

    $scope.forgotPassword = function(isValid) {
      if (!isValid) {
        $scope.error = 'Please fill in all fields';
        return;
      }

      return $http.post(window.location.origin + '/api/password/forgot/' + $scope.credentials.email)
      .then((results) => {
        alert('We\'ve sent you an email with a link to reset your password.');
        $state.go('authentication.signin');
        return results;
      })
      .catch((err) => {
        return err;
      });
    };

  }
]);
