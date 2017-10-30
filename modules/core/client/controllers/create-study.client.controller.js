'use strict';

angular.module('core').controller('StudyController', ['$scope', '$rootScope', '$http', '$state', '$document',
  function($scope, $rootScope, $http, $state, $document) {
    /* Get all the listings, then bind it to the scope */
    console.log($rootScope.getMockUser());

    $document.ready(() => {
      $scope.request = window.location.pathname;
      $scope.pass = $scope.request.slice(14);
      //alert('document fire');
      if (window.location.pathname.includes('edit')) {
        $scope.init();
      }
    });


    $scope.init = function() {
      //alert('init called');

      $scope.getStudy($scope.pass)
      .then((results) => {
        $scope.study = results;
        console.log($scope.study);
        $scope.study.title = $scope.study.data.title;
        $scope.study.location = $scope.study.data.location;
        $scope.study.irb = $scope.study.data.irb;
        $scope.study.compensationType = $scope.study.data.compensationType;
        $scope.study.maxParticipants = $scope.study.data.maxParticipants;
        $scope.study.maxParticipantsPerSession = $scope.study.data.maxParticipantsPerSession;
        $scope.study.description = $scope.study.data.description;
        //TODO Add researchers (and compensationAmount?)

      })
      .catch((err) => {
        console.log(err);
      });

    };

    $scope.getStudy = function(studyId) {
      return $http.get(window.location.origin + '/api/studies/' + studyId)
        .then((results) => {
          return results;
        })
        .catch((err) => {
          return err;
        });
    };

    $scope.create = function(isValid) {
      //alert('Hello World');
      $scope.error = null;


      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        alert('Invalid JSON');
        return false;
      }

      $http.post('/api/studies/create', $scope.study).success((response) => {
        //alert(response);
        // If successful we assign the response to the global user model
        console.log('PV', 'Study Created!');
        // And redirect to the previous or home page
        $state.go('researcher-portal');
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });
    };

    $scope.update = function(isValid) {

      //alert($scope.study.title);

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        alert('Invalid JSON');
        return false;
      }

      $http.put('/api/studies/'+$scope.pass, $scope.study).success((response) => {
        //alert($scope.study.title+' meow');
        console.log('PV', 'Study Updated!');
        //$state.go('researcher-portal');
      }).error((response) => {
        $scope.error = response.message;
        alert(response.message);
      });
    };

    /*
    $document.ready(() => {
      alert('document fire');
      alert(window.location.pathname);
      if (window.location.pathname.includes('edit')) {
        $scope.init();
      }
    });
    */
  }
]);
