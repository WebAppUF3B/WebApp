angular.module('core').controller('StudySignupController', ['$scope','$http','NgTableParams', '$location', '$state', '$stateParams', 'Authentication',
  function($scope, $http, NgTableParams, $location, $state, $stateParams, Authentication) {
    const init = function() {
      $('section.ng-scope').css('margin-top', '0px');
      $('section.ng-scope').css('margin-bottom', '0px');

      $scope.user = Authentication.user;

      $scope.authToken = Authentication.authToken;

      $scope.header = {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': $scope.authToken
        }
      };
      $scope.courses.getAll()
        .then((results) => {
          $scope.allCourses = results.data;
        });

      $scope.studyId = $stateParams.studyId;
      $scope.studySessions = null;
      $scope.study = null;
      $scope.error = null;
      $scope.currentSession = null;
      $scope.hasMonetary = false;
      $scope.hasExtraCredit = false;
      $scope.credentials = null;
      $scope.multipleParticipants = null;

      $scope.getAllSessionsByStudyId()
        .then((results) => {
          $scope.partialSessions = results.data.partialSessions;
          $scope.emptySessions = results.data.emptySessions;
          $scope.study = results.data.study;
          $scope.hasPartialSessions = $scope.partialSessions.length > 0;

          if ($scope.study.closed) $state.go('forbidden');

          $scope.study.compensationType.forEach((type) => {
            switch (type) {
              case 'monetary':
                $scope.hasMonetary = true;
                break;
              case 'extraCredit':
                $scope.hasExtraCredit = true;
                break;
            }
          });
        })
        .then(() => {
          // Populate partial table if sessions require multiple participants
          $scope.partialSessionsTable = new NgTableParams({
            count: 10,
            sorting: {
              startTime: 'desc'
            }
          }, {
            dataset: $scope.partialSessions, // select data
            counts: [], // hides page sizes
          });

          $scope.emptySessionsTable = new NgTableParams({
            count: 10,
            sorting: {
              startTime: 'desc'
            }
          }, {
            dataset: $scope.emptySessions, // select data
            counts: [], // hides page sizes
          });
        })
        .catch((err) => {
          console.log(err);
        });
    };
    $scope.getAllSessionsByStudyId = () => {
      return $http.get(`${window.location.origin}/api/studySessions/signup/${$scope.user._id}/${$scope.studyId}`, $scope.header);
    };

    $scope.studySignupModal = function(session, index) {
      $scope.currentSession = session;
      $scope.currentIndex = index;
      $scope.error = false;
      $('#studySignupModal').modal('show');
    };

    $scope.studySignup = function(valid) {
      $scope.error = null;
      if (!valid) {
        $scope.error = 'Please select a compensation type';
        return;
      }
      if ($scope.credentials.compensation === 'extraCredit' && !$scope.credentials.classCode) {
        $scope.error = 'Please select a class code';
        return;
      }

      $scope.credentials.sessionId = $scope.currentSession.id;
      $scope.credentials.study = $scope.study;
      $scope.credentials.user = {
        _id: $scope.user._id,
        firstName: $scope.user.firstName,
        lastName: $scope.user.lastName,
        email: $scope.user.email,
      };
      $scope.credentials.signupSession = {
        _id: $scope.currentSession._id,
        startTime: $scope.currentSession.startTime
      };
      $http.post(window.location.origin + '/api/studySession/signup', $scope.credentials, $scope.header)
        .then(() => {
          alert(`You are successfully signed up for ${$scope.study.title}!`);
          $('#studySignupModal').modal('hide');
          $state.go('participant-portal');
        })
        .catch((err) => {
          $scope.error = err;
        });
    };

    // Declare methods that can be used to access course data
    $scope.courses = {
      getAll: function() {
        return $http.get(window.location.origin + '/api/courses/', $scope.header)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      }
    };

    init();
  }]);
