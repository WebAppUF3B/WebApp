'use strict';

// TODO consider replacing $http requests with factory
angular.module('core').controller('StudyDiscoveryController', ['$scope','$http','NgTableParams', '$rootScope',
  function($scope, $http, NgTableParams, $rootScope) {

    // Prevent race conditions
    const alreadyClicked = false;

    // Called after page loads
    $scope.init = function() {
      $('section.ng-scope').css('margin-top', '0px');
      $('section.ng-scope').css('margin-bottom', '0px');

      $scope.allStudies = [];
      $scope.filters = {};

      // TODO Assign user
      $scope.user = $rootScope.getMockUser();

      // TODO filter these based on study criteria and use profile
      $scope.studies.getAll()
        .then((results) => {

          // Update satisfied value of each study
          results.data.forEach((study) => {
            if (!study.removed) {
              // Store in array
              $scope.allStudies.push(study);
            }
          });

          $scope.studyTable = new NgTableParams({
            count: 10,
            sorting: {
              title: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.allStudies // select data
          });

        })
        .catch((err) => {
          console.log(err);
        });
    };

    // Toggle filter area open or closed
    $scope.expandFilters = function() {
      $('.filter-area').slideToggle();
    };

    // Check and see if any filters are applied
    $scope.checkFilters = function() {
      if ($scope.filters.compensationType) {
        $('.clear-filters-btn').show();
      } else {
        $('.clear-filters-btn').hide();
      }
      $scope.reloadTable();
    };

    // Remove table filters
    $scope.clearFilters = function() {
      $scope.filters = '';
      $('.clear-filters-btn').hide();
      $scope.reloadTable();
    };

    // Search table
    $scope.search = function() {
      $scope.searchQuery = $scope.searchText;
    };

    // Search on 'enter' press
    $("#search").keypress((e) => {
      if (e.keyCode === 13) {
        $('#search-btn').click();
      }
    });

    $scope.reloadTable = function() {
      $scope.studyTable = new NgTableParams({
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
