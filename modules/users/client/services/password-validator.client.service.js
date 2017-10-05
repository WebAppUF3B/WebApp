'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    const owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        return owaspPasswordStrengthTest.test(password);
      },
      getPopoverMsg: function () {
        return 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
      }
    };
  }
]);
