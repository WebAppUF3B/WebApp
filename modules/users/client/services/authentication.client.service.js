'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    const auth = {
      user: $window.user
    };

    return auth;
  }
]);
