angular.module('core').factory('Sessions', ['$http',
  function($http) {
    const methods = {
      getAll: function() {
        return $http.get(window.location.origin + '/api/sessions/');
      },

      getUserSessions: function(userId) {
        return $http.get(window.location.origin + '/api/sessions/user/' + userId);
      },

      create: function(newSession) {
        return $http.post(window.location.origin + '/api/sessions/', newSession);
      },

      get: function(id) {
        return $http.get(window.location.origin + '/api/sessions/' + id);
      },

      update: function(id, newSession) {
        return $http.put(window.location.origin + '/api/sessions/' + id, newSession);
      },

      delete: function(id) {
        return $http.delete(window.location.origin + '/api/sessions/' + id);
      }
    };

    return methods;
  }
]);
