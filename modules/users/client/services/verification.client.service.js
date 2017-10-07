'use strict';

// Users service used for verifying user
/* Kyle's factory
angular.module('users').factory('User', ['$resource',
  function ($resource) {
    // TODO update code here to verify in backend (need to add backend function too)
    return $resource('api/users/verify/:user_.id', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
*/

angular.module('users').factory('User', function($resource) {
  return $resource('/api/users/:id', { id: '_id' }, {
    update: {
      method: 'PUT'
    }
  });
});
