angular.module('core').controller('StudySignupController', ['$scope','$http','NgTableParams', '$location', '$state', 'Authentication',
  function($scope, $http, NgTableParams, $location, $state, Authentication) {
    const init = function() {
      $('section.ng-scope').css('margin-top', '0px');
      $('section.ng-scope').css('margin-bottom', '0px');

      $scope.courses.getAll()
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.allCourses = results.data;
        });

      const url = $location.absUrl().split('/');
      $scope.studyId = url[url.length -1];
      $scope.studySessions = null;
      $scope.study = null;
      $scope.error = null;
      $scope.currentSession = null;
      $scope.hasMonetary = false;
      $scope.hasExtraCredit = false;
      $scope.credentails = null;
      $scope.user = Authentication.user;
      console.log($scope.user);

      $scope.getAllSessionsByStudyId();
      $scope.myStudySessions = new NgTableParams({
        count: 10,
        sorting: {
          title: 'asc'
        }
      }, {
        counts: [], // hides page sizes
        dataset: $scope.studySessions // select data
      });
    };
    $scope.getAllSessionsByStudyId = function() {
      console.log($scope.user._id);
      $http.get(`${window.location.origin}/api/studySessions/signup/${$scope.user._id}/${$scope.studyId}`)
        .then((results) => {
          $scope.studySessions = results.data.sessions;
          $scope.study = results.data.study;

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
          console.log('tw get data');
          console.log('tw study\n', $scope.study);
          console.log('tw sessions\n', $scope.studySessions);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    // $scope.hoursAndMinutes = function(minutes) {
    //   const hours = Math.floor(minutes / 60);
    //   const remainderMins = Math.floor(minutes % 60);
    //   const hoursUnits = hours === 1 ? 'hour' : 'hours';
    //   const hoursStr = hours > 0 ? `${hours} ${hoursUnits}` : '';
    //
    //   const minutesUnits = remainderMins === 1 ? 'minute' : 'minutes';
    //   const minutesStr = remainderMins > 0 ? `${remainderMins} ${minutesUnits}` : '';
    //
    //   const conjunctionFunction = hoursStr && minutesStr ? ' and ' : '';
    //
    //   return `${hoursStr}${conjunctionFunction}${minutesStr}`;
    // };

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
      $scope.credentials.newSession = $scope.currentSession;

      $http.post(window.location.origin + '/api/studySession/signup', $scope.credentials)
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
        return $http.get(window.location.origin + '/api/courses/')
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
