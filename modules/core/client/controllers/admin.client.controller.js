'use strict';

angular.module('core').controller('AdminPortalController', ['$scope', '$http', 'NgTableParams',
  function($scope, $http, NgTableParams) {
    const init = () => {
      $scope.admin.getWaitingUsers()
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.allUsers = results.data;
          console.log(results.data);
          $scope.approvalTable = new NgTableParams({
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

    $scope.approveUser = function() {
      console.log("Approved!");
      init();
    };

    $scope.denyUser = function() {
      console.log("Approved!");
      init();
    };

    // Declare methods that can be used to access session data
    $scope.admin = {
      getWaitingUsers: function() {
        return $http.get(window.location.origin + '/api/admin/approval')
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },

      approve: function(id) {
        return $.ajax({
          url: window.location.origin + '/api/admin/approval/' + id,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json'
        });
      },

      deny: function(id) {
        return $.ajax({
          url: window.location.origin + '/api/admin/approval/' + id,
          type: 'DELETE',
          contentType: 'application/json',
          dataType: 'json',
        });
      }
    };

    init();
  }
]);
