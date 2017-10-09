'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    const owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;
    owaspPasswordStrengthTest.config({
      allowPassphrases       : false,
      maxLength              : 128,
      minLength              : 8,
      minPhraseLength        : 20,
      minOptionalTestsToPass : 4,
    });

    return {
      getResult: function (password) {
        return owaspPasswordStrengthTest.test(password);
      },
      getPopoverMsg: function () {
        return 'Please enter a password with at least 8 characters and at least one number, lowercase, uppercase, and special character.';
      }
    };
  }
]);
