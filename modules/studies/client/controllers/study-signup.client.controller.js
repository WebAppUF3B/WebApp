angular.module('studies').controller('StudySignupController', ['$scope','$http', '$location', '$state', '$stateParams', 'Authentication', 'NgTableParams',
  function($scope, $http, $location, $state, $stateParams, Authentication, NgTableParams) {
    Authentication.loading = true;
    $scope.user = Authentication.user;

    $scope.authToken = Authentication.authToken;

    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };

    $scope.studyId = $stateParams.studyId;
    $scope.studySessions = null;
    $scope.study = null;
    $scope.error = null;
    $scope.currentSession = null;
    $scope.hasMonetary = false;
    $scope.hasExtraCredit = false;
    $scope.credentials = {};
    $scope.multipleParticipants = null;
    $scope.allCourses = null;
    //upon starting up page
    const init = function() {
      $('section.ng-scope').css('margin-top', '0px');
      $('section.ng-scope').css('margin-bottom', '0px');
      //get all course
      $scope.courses.getAll()
        .then((results) => {
          $scope.allCourses = results.data;
        });
      //get all sessions in study
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

          // Populate partial table if sessions require multiple participants
          $scope.partialSessionsTable = new NgTableParams({
            count: 10,
            sorting: {
              startTime: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.partialSessions // select data
          });

          $scope.emptySessionsTable = new NgTableParams({
            count: 10,
            sorting: {
              startTime: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.emptySessions // select data
          });
          Authentication.loading = false;
        })
        .catch((err) => {
          Authentication.loading = false;
          console.log(err);
        });
    };

    $scope.getAllSessionsByStudyId = () => {
      return $http.get(`${window.location.origin}/api/studySessions/signup/${$scope.user._id}/${$scope.studyId}`, $scope.header);
    };
    //controller for signup modal
    $scope.studySignupModal = function(session, index) {
      $scope.currentSession = session;
      $scope.currentIndex = index;
      $scope.error = false;
      $('#studySignupModal').modal('show');
    };
    //parsing information and push information to backend
    $scope.studySignup = function() {
      Authentication.loading = true;
      $scope.error = null;
      if ($scope.credentials.compensation && $scope.credentials.compensation === 'extraCredit' && !$scope.credentials.classCode) {
        $scope.error = 'Please select a class code';
        Authentication.loading = false;
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
          $scope.error = 'There was a problem signing up for this session. Please contact an admin.';
          Authentication.loading = false;
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
