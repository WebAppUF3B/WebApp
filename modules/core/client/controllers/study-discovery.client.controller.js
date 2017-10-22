'use strict';

// TODO consider replacing $http requests with factory
angular.module('core').controller('StudyDiscoveryController', ['$scope','$http','NgTableParams', '$rootScope',
  function($scope, $http, NgTableParams, $rootScope) {

    // Prevent race conditions
    const alreadyClicked = false;

    // Called after page loads
    $scope.init = function() {
      $scope.allStudies = {};
      $scope.allStudies.data = [];

      // TODO Assign user
      $scope.user = $rootScope.getMockUser();

      // TODO filter these based on study criteria and use profile
      $scope.studies.getAll()
        .then((results) => {

          // Update satisfied value of each study
          results.data.forEach((study) => {
            if (!study.removed) {
              // Store in array
              $scope.allStudies.data.push(study);
            }
          });

          $scope.allStudies = new NgTableParams({
            count: 20,
            sorting: {
              title: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.allStudies.data // select data
          });

        })
        .catch((err) => {
          console.log(err);
        });
    };

    // Show details of study in modal
    $scope.studyDetails = function(study, index) {
      $scope.currentStudy = study;
      $scope.currentIndex = index;
      $scope.error = false;
      $('#studyModal').modal('show');
    };

    // Declare methods that can be used to access study data
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
