'use strict';

// TODO consider replacing $http requests with controller (sessions.client.service.js)
angular.module('core').controller('ParticipantPortalController', ['$scope','$http','NgTableParams',
  function($scope, $http, NgTableParams) {

    // Called after page loads
    function init(){
      $scope.upcomingSessions = {};
      $scope.upcomingSessions.data = $scope.sessions.getAll();
      console.log($scope.upcomingSessions.data);
      // $scope.sessions.getAll()
      //   .then((err, sessions) => {
      //     $scope.upcomingSessions.data = sessions;
      //     console.log($scope.upcomingSessions.data);
      //   });

      $scope.upcomingSessions = new NgTableParams({
        sorting: {
          Time: 'desc'
        }
      }, {
        dataset: $scope.upcomingSessions.data
      });
    }

    // Declare methods that can be used to access session data
    $scope.sessions = {
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

    // Run our init function
    init();
  }
]);
