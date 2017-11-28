'use strict';

// TODO consider replacing $http requests with factory (sessions.client.service.js)
angular.module('core').controller('ParticipantPortalController', ['$scope','$http','$state', 'Authentication', 'NgTableParams',
  function($scope, $http, $state, Authentication, NgTableParams) {

    // Loading page
    Authentication.loading = true;

    // Called after page loads
    $scope.init = function() {
      $('section.ng-scope').css('margin-top', '0px');
      $('section.ng-scope').css('margin-bottom', '0px');

      $scope.upcomingSessions = {};
      $scope.upcomingSessions.data = [];
      $scope.pastSessions = {};
      $scope.pastSessions.data = [];

      $scope.user = Authentication.user;
      $scope.authToken = Authentication.authToken;
      $scope.header = {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': $scope.authToken
        }
      };

      // Retrieve all the users sessions
      $scope.sessions.getUserSessions($scope.user._id)
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.allSessions = results.data;
          console.log($scope.allSessions);

          // Populate date and time fields for each sessions
          const today = new Date();
          let date;
          $scope.allSessions.forEach((session) => {
            date = new Date(session.startTime);
            session.date = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            session.time = `${date.getHours() === 0 ? 12 : (date.getHours() > 12 ? date.getHours() - 12 : date.getHours())}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

            // Place session in correct array
            if (date >= today) {
              // Highlight sessions if approval is pending
              if (session.studyID.requireApproval) {
                session.participants.forEach((participant) => {
                  if (participant.userID._id == Authentication.user._id) {
                    if (!participant.approved) {
                      console.log('Not approved');
                      session.needsApproval = true;
                    } else {
                      console.log('Approved')
                      session.needsApproval = false;
                    }
                  }
                });
              }
              $scope.upcomingSessions.data.push(session);
            } else {
              // Highlight sessions based on whether you attended or not
              session.participants.forEach((participant) => {
                if (participant.userID._id == Authentication.user._id) {
                  if (participant.attended) {
                    session.completed = true;
                  } else {
                    session.completed = false;
                  }
                }
              });
              $scope.pastSessions.data.push(session);
            }
          });

          // Upcoming sessions table settings
          $scope.upcomingSessions = new NgTableParams({
            count: 5,
            sorting: {
              startTime: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.upcomingSessions.data // select data
          });

          // Past sessions table settings
          $scope.pastSessions = new NgTableParams({
            count: 5,
            sorting: {
              startTime: 'desc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.pastSessions.data // select data
          });

          // Done loading
          Authentication.loading = false;
        })
        .catch((err) => {
          console.log(err);
          Authentication.loading = false;
        });
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

    // Cancel session and remove from table
    $scope.confirmCancel = function() {
      if (!Authentication.loading) {
        Authentication.loading = true;
        const cancellor = $scope.user;
        cancellor.date = $scope.currentSession.date;
        cancellor.time = $scope.currentSession.time;
        $scope.sessions.cancel($scope.currentSession._id, cancellor)
          .then(() => {
            // Refetch sessions
            $('#cancelModal').modal('hide');
            $scope.init();
          })
          .catch((err) => {
            $scope.error = true;
            console.log('error deleting session', err);
            $('#cancelModal').modal('hide');
            $scope.init();
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
          contentType: 'application/json',
          headers: { 'x-access-token': $scope.authToken },
          dataType: 'json',
          data: JSON.stringify(cancellor)
        });
      }
    };

    // Run our init function
    $scope.init();
  }
]);
