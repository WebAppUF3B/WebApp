'use strict';

// TODO consider replacing $http requests with factory
angular.module('core').controller('ResearcherPortalController', ['$scope','$http','NgTableParams', '$rootScope', "Authentication",
  function($scope, $http, NgTableParams, $rootScope, Authentication) {

    // Prevent race conditions
    let alreadyClicked = false;

    // Called after page loads
    $scope.init = function() {
      $scope.myStudies = {};
      $scope.myStudies.data = [];
      $scope.upcomingSessions = {};
      $scope.upcomingSessions.data = [];
      $scope.pastSessions = {};
      $scope.pastSessions.data = [];
      $scope.compensation = {};
      $scope.compensation.data = [];

      $scope.user = Authentication.user;
      console.log($scope.user);

      $scope.studies.getUserStudies($scope.user._id)
        .then((results) => {

          // Update satisfied value of each study
          results.data.forEach((study) => {
            if (!study.removed) {
              if (study.currentNumber > study.satisfactoryNumber) {
                study.satisfied = true;
              }
              // Store in array
              $scope.myStudies.data.push(study);
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
            date = new Date(session.startTime);
            session.date = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            session.time = `${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

            // Place session in correct array
            if (session.participants.length !== 0) {
              if (date >= today) {
                $scope.upcomingSessions.data.push(session);
              } else {
                $scope.pastSessions.data.push(session);
              }
            }

            // Populate table with users awaiting compensationType
            session.participants.forEach((participant) => {
              if (participant.attended && participant.compensationType === 'monetary' && !participant.compensationGiven) {
                const temp = participant;
                temp.studyID = session.studyID;
                temp.session = session._id;
                $scope.compensation.data.push(temp);
              }
            });
          });

          $scope.upcomingSessions = new NgTableParams({
            count: 10,
            sorting: {
              startTime: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.upcomingSessions.data // select data
          });

          $scope.pastSessions = new NgTableParams({
            count: 10,
            sorting: {
              startTime: 'desc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.pastSessions.data // select data
          });

          $scope.compensation = new NgTableParams({
            count: 10,
            sorting: {
              'userID.lastName': 'desc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.compensation.data // select data
          });

        })
        .catch((err) => {
          console.log(err);
        });
    };

    // Show modal and populate it with study details
    $scope.studyDetails = function(study, index) {
      $scope.currentStudy = study;
      $scope.currentIndex = index;
      $scope.error = false;
      $('#studyModal').modal('show');
    };

    // Show modal and populate it with compensation data
    $scope.compensationDetails = function(participant, index) {
      $scope.currentParticipant = participant;
      $scope.currentIndex = index;
      $scope.error = false;
      $('#compensationModal').modal('show');
    };

    // Show modal and populate it with session data
    $scope.sessionDetails = function(session, currentTable, index) {
      $scope.currentSession = session;
      $scope.currentIndex = index;
      $scope.currentTable = currentTable;
      $scope.error = false;
      $('#detailModal').modal('show');
    };

    // Close cancel modal
    $scope.cancelClose = function() {
      if (!alreadyClicked) {
        $('#cancelModal').modal('hide');
      }
    };

    // Close closeStudy modal
    $scope.closeStudyClose = function() {
      if (!alreadyClicked) {
        $('#closeStudyModal').modal('hide');
      }
    };

    // Close closeStudy modal
    $scope.removeStudyClose = function() {
      if (!alreadyClicked) {
        $('#removeStudyModal').modal('hide');
      }
    };

    // Close study in backend
    $scope.confirmCloseStudy = function() {
      if (!alreadyClicked) {
        alreadyClicked = true;
        const cancellor = $scope.user;
        $scope.studies.close($scope.currentStudy._id, cancellor)
          .then(() => {
            // Refetch sessions
            $scope.init();
            $('#closeStudyModal').modal('hide');
            alreadyClicked = false;
          })
          .catch((err) => {
            $scope.error = true;
            console.log(err);
            alreadyClicked = false;
          });
      }
    };

    // Remove study in backend
    $scope.confirmRemoveStudy = function() {
      if (!alreadyClicked) {
        alreadyClicked = true;
        $scope.studies.remove($scope.currentStudy._id)
          .then(() => {
            // Refetch sessions
            $scope.init();
            $('#removeStudyModal').modal('hide');
            alreadyClicked = false;
          })
          .catch((err) => {
            $scope.error = true;
            console.log(err);
            alreadyClicked = false;
          });
      }
    };

    // Cancel session and remove from table
    $scope.confirmCancel = function() {
      if (!alreadyClicked) {
        alreadyClicked = true;
        const cancellor = $scope.user;
        cancellor.date = $scope.currentSession.date;
        cancellor.time = $scope.currentSession.time;
        $scope.sessions.cancel($scope.currentSession._id, cancellor)
          .then(() => {
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
    };

    // Change attendance value of participant
    $scope.changeAttendance = function(participant) {
      const change = { 'userID': participant.userID._id, 'attended': participant.attended };
      $scope.sessions.attend($scope.currentSession._id, change)
        .then(() => {
          // Refetch sessions
          alreadyClicked = false;
        })
        .catch((err) => {
          $scope.error = true;
          console.log(err);
          alreadyClicked = false;
        });
    };

    // Mark participant as compensated
    $scope.markCompensated = function() {
      if (!alreadyClicked) {
        alreadyClicked = true;
        const user = { 'userID': $scope.currentParticipant.userID._id };
        $scope.sessions.compensate($scope.currentParticipant.session, user)
          .then((response) => {
            // Refetch sessions
            $scope.init();
            $('#compensationModal').modal('hide');
            alreadyClicked = false;
          })
          .catch((err) => {
            $scope.error = true;
            console.log(err);
            alreadyClicked = false;
          });
      }
    };

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
      },

      attend: function(id, change) {
        return $.ajax({
          url: window.location.origin + '/api/sessions/attend/' + id,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(change)
        });
      },

      compensate: function(id, user) {
        return $.ajax({
          url: window.location.origin + '/api/sessions/compensate/' + id,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(user)
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

      close: function(id, cancellor) {
        return $.ajax({
          url: window.location.origin + '/api/studies/close/' + id,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(cancellor)
        });
      },

      remove: function(id) {
        return $.ajax({
          url: window.location.origin + '/api/studies/remove/' + id,
          type: 'PUT'
        });
      }
    };

    // Run our init function
    $scope.init();
  }
]);
