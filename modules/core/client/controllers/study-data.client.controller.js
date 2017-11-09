angular.module('core').controller('StudyDataController', ['$scope','$http','NgTableParams', '$location', '$state', '$stateParams',
  function($scope, $http, NgTableParams, $location, $state, $stateParams) {
    const init = function() {
      $('section.ng-scope').css('margin-top', '0px');
      $('section.ng-scope').css('margin-bottom', '0px');

      $scope.calculating = true;
      $scope.studyId = $stateParams.studyId;
      $scope.studySessions = null;
      $scope.error = null;
      $scope.filters = {};
      $scope.filters.completed = '';
      $scope.ages = [];
      $scope.stats = {};
      $scope.stats.display = false;
      $scope.stats.maleCount = 0;
      $scope.stats.femaleCount = 0;
      $scope.stats.otherCount = 0;
      $scope.stats.ageMean = 0;
      $scope.stats.ageMin = 100000;
      $scope.stats.ageMax = -1;

      $scope.getAllSessionsByStudyId()
        .then((results) => {
          $scope.studySessions = results.data.sessions;
          $scope.study = results.data.study;
          $scope.stats.total = $scope.study.currentNumber;

          // Parse date and mark as completed
          $scope.studySessions.forEach((session) => {
            date = new Date(session.startTime);
            session.date = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            session.time = `${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

            session.participants.forEach((participant) => {
              // Calculate age of participants
              const dob = new Date(participant.userID.birthday);
              const today = new Date();
              participant.age = Math.floor((today-dob) / (365.25 * 24 * 60 * 60 * 1000));

              // Check for completion
              if (participant.attended) {
                session.completed = true;
                $scope.stats.display = true;

                // Update age mean
                $scope.stats.ageMean += participant.age;

                // Push to age array
                $scope.ages.push(participant.age);

                // Check age mins and maxes
                if (participant.age < $scope.stats.ageMin) {
                  $scope.stats.ageMin = participant.age;
                }
                if (participant.age > $scope.stats.ageMax) {
                  $scope.stats.ageMax = participant.age;
                }

                // Update gender count
                if (participant.userID.gender === 'male') {
                  $scope.stats.maleCount ++;
                } else if (participant.userID.gender === 'female') {
                  $scope.stats.femaleCount ++;
                } else {
                  $scope.stats.otherCount ++;
                }
              }
            });
          });

          // Finish calculating stats
          $scope.stats.ageMean = $scope.stats.ageMean / $scope.stats.total;
          $scope.stats.ageRange = $scope.stats.ageMax - $scope.stats.ageMin;
          $scope.stats.malePercentage = $scope.stats.maleCount / $scope.stats.total * 100;
          $scope.stats.femalePercentage = $scope.stats.femaleCount / $scope.stats.total * 100;
          $scope.stats.otherPercentage = $scope.stats.otherCount / $scope.stats.total * 100;

          if ($scope.stats.total > 1) {
            // Calculate standard deviation
            const squareDiffs = $scope.ages.map((value) => {
              const diff = value - $scope.stats.ageMean;
              const sqr = diff * diff;
              return sqr;
            });

            let temp = 0;
            squareDiffs.forEach((value) => {
              temp += value;
            });

            $scope.stats.ageStd = Math.sqrt(temp / ($scope.stats.total - 1));
            $scope.stats.ageStd = $scope.stats.ageStd.toFixed(4);
          } else {
            $scope.stats.ageStd = 'NA';
          }

          $scope.stats.ageMean = $scope.stats.ageMean.toFixed(4);
          $scope.stats.malePercentage = $scope.stats.malePercentage.toFixed(4);
          $scope.stats.femalePercentage = $scope.stats.femalePercentage.toFixed(4);
          $scope.stats.otherPercentage = $scope.stats.otherPercentage.toFixed(4);
          $scope.calculating = false;

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

    // Show modal and populate it with session data
    $scope.sessionDetails = function(session) {
      $scope.currentSession = session;
      $('#detailModal').modal('show');
    };

    $scope.toTitleCase = function(str) {
      return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
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
