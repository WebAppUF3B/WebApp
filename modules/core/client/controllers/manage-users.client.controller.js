'use strict';

angular.module('core').controller('AdminManageUsersController', ['$scope', '$http', 'NgTableParams', '$state', '$stateParams', 'Authentication',
  function($scope, $http, NgTableParams, $state, $stateParams, Authentication) {

    $scope.user = Authentication.user;
    console.log('tw user', $scope.user);

    $scope.authToken = Authentication.authToken;
    console.log('tw auth token', $scope.authToken);

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

      })
      .catch((err) => {
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

    $scope.reloadTable = function() {
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
    };

    // Declare methods that can be used to access administrative data
    //////
    $scope.admin = {
      getAllUsers: function() {
        return $http.get(window.location.origin + '/api/admin/getAllUsers', $scope.header)
        .then((results) => {
          //return results;
          $scope.allUsers = results.data;
          $scope.AllUsersTable = new NgTableParams({
            count: 10,
            sorting: {
              lastName: 'asc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.allUsers // select data
          });
        })
        .catch((err) => {
          return err;
        });
      },
      getAllUsers: function() {
        return $http.get(window.location.origin + '/api/admin/getAllUsers', $scope.header)
        .then((results) => {
          return results;
        })
        .catch((err) => {
          return err;
        });
      },
      getWaitingUsers: function() {
        return $http.get(window.location.origin + '/api/admin/approval', $scope.header)
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },
      editUser: function(fromForm) {
        console.log('hi + ');
        console.log(fromForm);
      }
    };

    init();
  }
]);
