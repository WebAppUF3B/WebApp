'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window', '$injector',
  function($window) {

    const user = JSON.parse(localStorage.getItem('user'));
    const authToken = JSON.parse(localStorage.getItem('authToken'));

    const logout = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    };

    return {
      user: user,
      authToken: authToken,
      logout: logout
    };
  }
]);
