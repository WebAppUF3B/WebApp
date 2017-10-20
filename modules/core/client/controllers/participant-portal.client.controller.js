'use strict';

// TODO consider replacing $http requests with controller (sessions.client.service.js)
angular.module('core').controller('ParticipantPortalController', ['$scope','$http','NgTableParams', '$rootScope',
  function($scope, $http, NgTableParams, $rootScope) {

    // Called after page loads
    $scope.init = function(){
      $scope.upcomingSessions = {};
      $scope.upcomingSessions.data = [];
      $scope.pastSessions = {};
      $scope.pastSessions.data = [];

      // TODO Assign user
      $scope.user = $rootScope.getMockUser();

      // TODO Get all sessions for this USER (find user details)
      // TODO Resize table columns and possibly hide column on mobile
      $scope.sessions.getUserSessions($scope.user._id)
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
    $scope.sessionDetails = function(session, currentTable, index){
      $scope.currentSession = session;
      $scope.currentIndex = index;
      $scope.currentTable = currentTable;
      $scope.error = false;
      $('#detailModal').modal('show');
    }

    // Open cancel modal
    $scope.cancelOpen = function(){
      $('#detailModal').modal('hide');
      $('#cancelModal').modal('show');
    }

    // Cancel session and remove from table
    $scope.confirmCancel = function(){
      let cancellor = $scope.user;
      cancellor.date = $scope.currentSession.date;
      cancellor.time = $scope.currentSession.time
      $scope.sessions.cancel($scope.currentSession._id, cancellor)
        .then(() => {
          // Refetch sessions
          $scope.init();
          $('#cancelModal').modal('hide');
        })
        .catch((err) => {
          $scope.error = true;
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

      cancel: function(id, cancellor) {
        return $http.delete(window.location.origin + '/api/sessions/' + id, cancellor)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      }
    };

    // Run our init function
    $scope.init();
  }
]);
