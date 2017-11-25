'use strict';

// TODO consider replacing $http requests with factory
angular.module('core').controller('StudyDiscoveryController', ['$scope','$http','NgTableParams', 'Authentication',
  function($scope, $http, NgTableParams, Authentication) {

    // Called after page loads
    $scope.init = function() {
      $('section.ng-scope').css('margin-top', '0px');
      $('section.ng-scope').css('margin-bottom', '0px');

      $scope.allStudies = [];
      $scope.filters = {};

      $scope.user = Authentication.user;
      console.log($scope.user);

      $scope.authToken = Authentication.authToken;
      console.log($scope.authToken);

      $scope.header = {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': $scope.authToken
        }
      };
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
        return $http.get(window.location.origin + '/api/studies/', $scope.header)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },
    };

    // Run our init function
    $scope.init();
  }
]);
