'use strict';

angular.module('users.adminEdit').controller('AdminManageUsersController', ['$scope', '$http', 'NgTableParams', '$state', '$stateParams', 'Authentication',
  function($scope, $http, NgTableParams, $state, $stateParams, Authentication) {

    Authentication.loading = true;

    $scope.user = Authentication.user;
    $scope.authToken = Authentication.authToken;
    $scope.header = {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': $scope.authToken
      }
    };

    $scope.toTitleCase = function(str) {
      if (!str) return;

      return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };

    // Show modal and populate it with session data
    $scope.userDetails = function(user) {
      $scope.currentUser = user;
      $('#detailModal').modal('show');
    };

    $scope.filters = {};
    $('section.ng-scope').css('margin-top', '0px');
    $('section.ng-scope').css('margin-bottom', '0px');

    const init = () => {
      $scope.currentUser = {};

      $scope.admin.getAllUsers()
      .then((results) => {
        $scope.allUsers = results.data;
        $scope.allUsersTable = new NgTableParams({
          count: 10,
          sorting: {
            lastName: 'asc'
          }
        }, {
          counts: [], // hides page sizes
          dataset: $scope.allUsers // select data
        });
        Authentication.loading = false;
      })
      .catch((err) => {
        Authentication.loading = false;
        console.log(err);
      });
    };

    $scope.search = function() {
      $scope.searchQuery = $scope.searchText;
    };

    // Toggle filter area open or closed
    $scope.expandFilters = function() {
      $('.filter-area').slideToggle();
    };

    // Check and see if any filters are applied
    $scope.checkFilters = function() {
      if ($scope.filters.role) {
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

    // Reloads ng-table
    $scope.reloadTable = function() {
      Authentication.loading = true;
      $scope.allUsersTable = new NgTableParams({
        count: 10,
        sorting: {
          title: 'asc'
        },
        filter: $scope.filters
      }, {
        counts: [], // hides page sizes
        dataset: $scope.allUsers // select data
      });
      Authentication.loading = false;
    };

    // Declare methods that can be used to access administrative data
    $scope.admin = {
      // Populates table with users
      getAllUsers: function() {
        return $http.get(window.location.origin + '/api/admin/getAllUsers', $scope.header)
        .then((results) => {
          return results;
        })
        .catch((err) => {
          return err;
        });
      }
    };

    init();
  }
]);
