'use strict';

// TODO consider replacing $http requests with factory (sessions.client.service.js)
angular.module('core').controller('ResearcherPortalController', ['$scope','$http','NgTableParams', '$rootScope',
  function($scope, $http, NgTableParams, $rootScope) {

    // Prevent race conditions
    let alreadyClicked = false;

    // Called after page loads
    $scope.init = function(){
      $scope.myStudies = {};
      $scope.myStudies.data = [];
      $scope.upcomingSessions = {};
      $scope.upcomingSessions.data = [];
      $scope.pastSessions = {};
      $scope.pastSessions.data = [];

      // TODO Assign user
      $scope.user = $rootScope.getMockUser();

      $scope.studies.getUserStudies($scope.user._id)
        .then((results) => {
          // Assign results to myStudies.data
          $scope.myStudies.data = results.data;

          // Update satisfied value of each study
          $scope.myStudies.data.forEach((study) => {
            console.log(study);
            if(study.currentNumber > study.satisfactoryNumber){
              study.satisfied = true;
            }
          });

          $scope.myStudies = new NgTableParams({
            count: 10,
            sorting: {
              title: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.myStudies.data // select data
          });

        })
        .catch((err) => {
          console.log(err);
        });

      $scope.sessions.getUserSessions($scope.user._id)
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.allSessions = results.data;

          // Populate date and time fields for each sessions
          const today = new Date();
          let date;
          $scope.allSessions.forEach((session) => {
            date = new Date(session.sessionTime);
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
            count: 10,
            sorting: {
              sessionTime: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.upcomingSessions.data // select data
          });

          $scope.pastSessions = new NgTableParams({
            count: 10,
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
    $scope.cancelClose = function(){
      if(!alreadyClicked){
        $('#cancelModal').modal('hide');
      }
    }

    $scope.studyDetails = function(study, index) {
      $scope.currentStudy = study;
      $scope.currentIndex = index;
      $scope.error = false;
      $('#studyModal').modal('show');
    };

    // Cancel session and remove from table
    $scope.confirmCancel = function(){
      if(!alreadyClicked) {
        alreadyClicked = true;
        const cancellor = $scope.user;
        cancellor.date = $scope.currentSession.date;
        cancellor.time = $scope.currentSession.time;
        $scope.sessions.cancel($scope.currentSession._id, cancellor)
          .then(() => {
            console.log("Made it!");
            // Refetch sessions
            $scope.init();
            $('#cancelModal').modal('hide');
            alreadyClicked = false;
          })
          .catch((err) => {
            $scope.error = true;
            console.log(err);
            alreadyClicked = false;
          });
      }
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
        return $.ajax({
          url: window.location.origin + '/api/sessions/',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newSession)
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
        return $.ajax({
          url: window.location.origin + '/api/sessions/' + id, newSession,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newSession)
        });
      },

      cancel: function(id, cancellor) {
        return $.ajax({
          url: window.location.origin + '/api/sessions/' + id,
          type: 'DELETE',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(cancellor)
        });
      }
    };

    // Declare methods that can be used to access session data
    $scope.studies = {
      getAll: function() {
        return $http.get(window.location.origin + '/api/studies/')
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      getUserStudies: function(userId) {
        return $http.get(window.location.origin + '/api/studies/user/' + userId)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      create: function(newStudy) {
        return $.ajax({
          url: window.location.origin + '/api/studies/',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newStudy)
        });
      },

      get: function(id) {
        return $http.get(window.location.origin + '/api/studies/' + id)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      update: function(id, newStudy) {
        return $.ajax({
          url: window.location.origin + '/api/studies/' + id, newStudy,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newStudy)
        });
      },

      delete: function(id, cancellor) {
        return $.ajax({
          url: window.location.origin + '/api/studies/' + id,
          type: 'DELETE',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(cancellor)
        });
      }
    };

    // Run our init function
    $scope.init();
  }
]);
