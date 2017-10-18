'use strict';

// TODO consider replacing $http requests with controller (sessions.client.service.js)
angular.module('core').controller('ParticipantPortalController', ['$scope','$http','NgTableParams',
  function($scope, $http, NgTableParams) {

    // Called after page loads
    function init(){
      $scope.upcomingSessions = {};
      $scope.upcomingSessions.data = [];
      $scope.pastSessions = {};
      $scope.pastSessions.data = [];

      // TODO Get all sessions for this USER (find user details)
      // TODO Resize table columns and possibly hide column on mobile
      $scope.sessions.getAll()
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.allSessions = results.data;

          // Populate date and time fields for each sessions
          const today = new Date();
          $scope.allSessions.forEach((session) => {
            let date = new Date(session.sessionTime);
            session.date = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            session.time = `${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()} ${date.getHours() >= 12 ? "PM" : "AM"}`

            // Place session in correct array
            if(date >= today){
              $scope.upcomingSessions.data.push(session);
            } else{
              $scope.pastSessions.data.push(session);
            }
          });

          $scope.upcomingSessions = new NgTableParams({
            count: 5,
            sorting: {
              sessionTime: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.upcomingSessions.data // select data
          });

          $scope.pastSessions = new NgTableParams({
            count: 5,
            sorting: {
              sessionTime: 'desc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.pastSessions.data // select data
          });

        })
        .catch((err) => {
          console.log(err);
        });
    }

    // Show modal and populate it with session data
    $scope.sessionDetails = function(session){
      $scope.currentSession = session;
      $('#detailModal').modal('show');


    }

    // Remove session from DB and notify all users associated with it by email
    $scope.cancelSession = function(session){
      // Also remove entry from table
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
