'use strict';

angular.module('core').controller('StudyController', ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$document', 'Authentication',
  function($scope, $rootScope, $http, $state, $stateParams, $document, Authentication) {
    /* Get all the listings, then bind it to the scope */
    $scope.currentStudy = {};

    $scope.user = Authentication.user;
    $scope.authToken = Authentication.authToken;
    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };

    $document.ready(() => {
      if ($state.current.name === 'studies.edit') {
        $scope.init();
      }
    });


    $scope.init = function() {
      $scope.state = 'edit';
      $scope.pass = $stateParams.studyId;

      $scope.getStudy($scope.pass)
      .then((results) => {
        console.log(results);
        $scope.currentStudy.title = results.data.title;
        $scope.currentStudy.location = results.data.location;
        $scope.currentStudy.irb = results.data.irb;
        $scope.currentStudy.compensationType = results.data.compensationType;
        $scope.currentStudy.maxParticipants = results.data.maxParticipants;
        $scope.currentStudy.requireApproval = results.data.requireApproval;
        $scope.currentStudy.satisfactoryNumber = results.data.satisfactoryNumber;
        $scope.currentStudy.duration = results.data.duration;
        $scope.currentStudy.participantsPerSession = results.data.participantsPerSession;
        $scope.currentStudy.description = results.data.description;
        $scope.currentStudy.availability = results.data.availability;
        $scope.currentStudy.researchers = results.data.researchers;
        //TODO Add researchers (and compensationAmount?)

      })
      .catch((err) => {
        console.log(err);
      });

    };

    $scope.submit = function(isValid) {
      console.log(isValid);
      if ($scope.state === 'edit') {
        console.log('update');
        $scope.update(isValid);
      } else {
        console.log('create');
        $scope.create(isValid);
      }
    };

    $scope.getStudy = function(studyId) {
      return $http.get(window.location.origin + '/api/studies/' + studyId, $scope.header)
        .then((results) => {
          return results;
        })
        .catch((err) => {
          return err;
        });
    };

    $scope.create = function(isValid) {
      $scope.error = null;
      $('.needs-validation').removeClass('highlight-error');

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'studyForm');
        $scope.error = 'Please fill in all required fields.';
        return false;
      }

      $scope.currentStudy.researchers = [];
      $scope.currentStudy.researchers.push({ 'userID': $scope.user._id });

      $scope.currentStudy.compensationType = [];
      if ($scope.compensatemodel.length !== 0) {
        if ($scope.compensatemodel.length === 2) {
          $scope.currentStudy.compensationType.push('extraCredit');
          $scope.currentStudy.compensationType.push('monetary');
        } else {
          if ($scope.compensatemodel[0].id === 1) {
            $scope.currentStudy.compensationType.push('extraCredit');
          } else {
            $scope.currentStudy.compensationType.push('monetary');
          }
        }
      }

      $http.post('/api/studies/', $scope.currentStudy, $scope.header).success((response) => {
        // If successful we assign the response to the global user model
        // And redirect to the previous or home page
        $state.go('studies.availability', { 'studyId': response._id });
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });
    };

    $scope.update = function(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        alert('Invalid JSON');
        return false;
      }

      $scope.currentStudy.researchers = [];
      $scope.currentStudy.researchers.push({ 'userID': $scope.user._id });
      for (let x = 0; x<$scope.researchermodel.length; x++) {
        $scope.currentStudy.researchers.push({ 'userID': $scope.researchermodel[x].id });
      }

      $scope.currentStudy.compensationType = [];
      if ($scope.compensatemodel.length !== 0) {
        if ($scope.compensatemodel.length === 2) {
          $scope.currentStudy.compensationType.push('extraCredit');
          $scope.currentStudy.compensationType.push('monetary');
        } else {
          if ($scope.compensatemodel[0].id === 1) {
            $scope.currentStudy.compensationType.push('extraCredit');
          } else {
            $scope.currentStudy.compensationType.push('monetary');
          }
        }
      }

      $http.put('/api/studies/'+$scope.pass, $scope.currentStudy, $scope.header).success((response) => {
        console.log('Did the put, here is the return');
        console.log(response);
        $state.go('studies.availability-edit', { 'studyId': response._id, 'avail': $scope.currentStudy.availability, 'durate': $scope.currentStudy.duration });
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });
    };
  }
]);
