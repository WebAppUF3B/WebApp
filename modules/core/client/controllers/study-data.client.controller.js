angular.module('core').controller('StudyDataController', ['$scope','$http','NgTableParams', '$location', '$state', '$stateParams',
  function($scope, $http, NgTableParams, $location, $state, $stateParams) {
    const init = function() {
      $('section.ng-scope').css('margin-top', '0px');
      $('section.ng-scope').css('margin-bottom', '0px');

      $scope.studyId = $stateParams.studyId;
      $scope.studySessions = null;
      $scope.error = null;
      $scope.filters = {};
      $scope.filters.completed = '';

      $scope.getAllSessionsByStudyId()
        .then((results) => {
          $scope.studySessions = results.data.sessions;
          $scope.study = results.data.study;

          // Parse date and mark as completed
          $scope.studySessions.forEach((session) => {
            date = new Date(session.startTime);
            session.date = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            session.time = `${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

            // Check for completion
            session.participants.forEach((participant) => {
              if (participant.attended) {
                session.completed = true;
              }
            });
          });

          $scope.myStudySessions = new NgTableParams({
            count: 10,
            sorting: {
              startTime: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.studySessions // select data
          });
        })
        .catch((err) => {
          console.log(err);
        });
    };

    $scope.getAllSessionsByStudyId = function() {
      return $http.get(window.location.origin + '/api/studySessions/' + $scope.studyId);
    };

    $scope.refreshTable = function() {
      $scope.myStudySessions = new NgTableParams({
        count: 10,
        sorting: {
          startTime: 'asc'
        },
        filter: $scope.filters
      }, {
        counts: [], // hides page sizes
        dataset: $scope.studySessions // select data
      });
    };

    init();
  }]);
