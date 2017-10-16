'use strict';

// TODO consider replacing $http requests with controller (sessions.client.service.js)
angular.module('core').controller('ParticipantPortalController', ['$scope','$http','NgTableParams',
  function($scope, $http, NgTableParams) {

    // Called after page loads
    function init(){
      $scope.upcomingSessions = {};

      // TODO Get all sessions for this user
      $scope.sessions.getAll()
        .then((results) => {
          // TODO separate upcomingSessions and pastSessions (also might want to break these sessions up in the backend)
          // TODO get study info for each session (probably want to grab extra info while in backend) - Check out JOIN for mongo
          // TODO get date/time field seperate (also might want to add two fields in backend)
          // Assign results to upcomingSessions.data
          $scope.upcomingSessions.data = results.data;
          console.log($scope.upcomingSessions.data);
          $scope.upcomingSessions = new NgTableParams({
            count: 5,
            sorting: {
              Time: 'desc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.upcomingSessions.data // select data
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }

    // Declare methods that can be used to access session data
    $scope.sessions = {
      getAll: function() {
        return $http.get(window.location.origin + '/api/sessions/')
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      getUserSessions: function(userId) {
        return $http.get(window.location.origin + '/api/sessions/user/' + userId)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      create: function(newSession) {
        return $http.post(window.location.origin + '/api/sessions/', newSession)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      get: function(id) {
        return $http.get(window.location.origin + '/api/sessions/' + id)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      update: function(id, newSession) {
        return $http.put(window.location.origin + '/api/sessions/' + id, newSession)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      delete: function(id) {
        return $http.delete(window.location.origin + '/api/sessions/' + id)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      }
    };

    // Run our init function
    init();
  }
]);
