'use strict';

// TODO consider replacing $http requests with factory
angular.module('core').controller('ResearcherPortalController', ['$scope','$http','NgTableParams', '$rootScope', "Authentication",
  function($scope, $http, NgTableParams, $rootScope, Authentication) {

    // Prevent race conditions
    let alreadyClicked = false;

    $scope.user = Authentication.user;
    $scope.authToken = Authentication.authToken;
    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };

    // Called after page loads
    $scope.init = function() {
      $scope.filters = {};
      $scope.allStudies = [];
      $scope.myStudies = {};
      $scope.upcomingSessions = {};
      $scope.upcomingSessions.data = [];
      $scope.pastSessions = {};
      $scope.pastSessions.data = [];
      $scope.awaitingCompensation = {};
      $scope.awaitingCompensation.data = [];
      $scope.compensated = {};
      $scope.compensated.data = [];

      $scope.studies.getUserStudies($scope.user._id)
        .then((results) => {

          // Update satisfied value of each study
          results.data.forEach((study) => {
            // Initialize to 0
            study.satisfied = 0;

            // If study is closed make it -1 (bottom of list)
            if (study.closed) {
              study.satisfied = -1;
            } else {
              if (study.satisfactoryNumber) {
                // If the number has been met, mark green
                if (study.currentNumber >= study.satisfactoryNumber) {
                  study.satisfied = 1;
                }
              } else {
                study.satisfactoryNumber ='NA';
              }
            }

            // Initialize enrolled number to 0
            study.enrolledNumber = 0;

            // Store in array
            $scope.allStudies.push(study);
          });
        })
        .then(() => {
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
                session.time = `${date.getHours() === 0 ? 12 : (date.getHours() > 12 ? date.getHours() - 12 : date.getHours())}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

                // Place session in correct array
                if (session.participants.length !== 0) {
                  if (date >= today) {
                    $scope.upcomingSessions.data.push(session);

                    // Calculate enrolled number for each studyId
                    $scope.allStudies.forEach((study) => {
                      if (study._id === session.studyID._id) {
                        study.enrolledNumber ++;
                      }
                    });
                  } else {
                    $scope.pastSessions.data.push(session);
                  }
                }

                // Populate table with users awaiting compensationType
                session.participants.forEach((participant) => {
                  if (participant.attended && participant.compensationType === 'monetary') {
                    const temp = participant;
                    temp.studyID = session.studyID;
                    temp.session = session._id;

                    if (!participant.compensationGiven) {
                      // Go to awaitin compensation table
                      $scope.awaitingCompensation.data.push(temp);
                    } else {
                      // Foramt date and go to compensated table
                      date = new Date(participant.compensationDate);
                      participant.date = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

                      $scope.compensated.data.push(temp);
                    }
                  }
                });
              });

              $scope.myStudies = new NgTableParams({
                count: 10,
                sorting: {
                  title: 'asc'
                }
              }, {
                counts: [], // hides page sizes
                dataset: $scope.allStudies // select data
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

              $scope.awaitingCompensation = new NgTableParams({
                count: 10,
                sorting: {
                  'userID.lastName': 'desc'
                }
              }, {
                counts: [], // hides page sizes
                dataset: $scope.awaitingCompensation.data // select data
              });

              $scope.compensated = new NgTableParams({
                count: 10,
                sorting: {
                  'compensationDate': 'desc'
                }
              }, {
                counts: [], // hides page sizes
                dataset: $scope.compensated.data // select data
              });

            });
        })
        .catch((err) => {
          console.log(err);
        });
    };

    $scope.refreshTable = function() {
      $scope.myStudies = new NgTableParams({
        count: 10,
        sorting: {
          title: 'asc'
        },
        filter: $scope.filters
      }, {
        counts: [], // hides page sizes
        dataset: $scope.allStudies // select data
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
    $scope.compensationDetails = function(participant, table) {
      $scope.currentParticipant = participant;
      $scope.currentTable = table;
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
    $scope.reopenStudyClose = function() {
      if (!alreadyClicked) {
        $('#reopenStudyModal').modal('hide');
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

    // Reopen study in backend
    $scope.confirmReopenStudy = function() {
      if (!alreadyClicked) {
        alreadyClicked = true;
        $scope.studies.reopen($scope.currentStudy._id)
          .then(() => {
            // Refetch sessions
            $scope.init();
            $('#reopenStudyModal').modal('hide');
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
            console.log('error deleting session', err);
            alreadyClicked = false;
            $scope.init();
            $('#cancelModal').modal('hide');
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
      getUserSessions: function(userId) {
        return $http.get(window.location.origin + '/api/sessions/user/' + userId, $scope.header);
      },
      cancel: function(id, cancellor) {
        return $.ajax({
          url: window.location.origin + '/api/sessions/' + id,
          type: 'DELETE',
          headers: { 'x-access-token': $scope.authToken },
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(cancellor)
        });
      },

      attend: function(id, change) {
        return $http.put(window.location.origin + '/api/sessions/attend/' + id, change, $scope.header);
      },

      compensate: function(id, user) {
        return $http.put(window.location.origin + '/api/sessions/compensate/' + id, user, $scope.header);
      }
    };

    // Declare methods that can be used to access session data
    $scope.studies = {
      getUserStudies: function(userId) {
        return $http.get(window.location.origin + '/api/studies/user/' + userId, $scope.header);
      },
      close: function(id, cancellor) {
        return $http.put(window.location.origin + '/api/studies/close/' + id, cancellor, $scope.header);
      },

      reopen: function(id) {
        return $http.put(window.location.origin + '/api/studies/reopen/' + id, {}, $scope.header);
      }
    };

    // Run our init function
    $scope.init();
  }
]);
