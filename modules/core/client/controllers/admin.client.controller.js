'use strict';

angular.module('core').controller('AdminPortalController', ['$scope', '$http', 'NgTableParams',
  function($scope, $http, NgTableParams) {
    const init = () => {
      $scope.admin.getWaitingUsers()
        .then((results) => {
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

    $scope.approvalDetails = function(user, index) {
      $scope.currentUser = user;
      $scope.currentIndex = index;
      $scope.error = false;
      $('#approvalModal').modal('show');
    };

    $scope.approveUser = function() {
      console.log('Approved!');
      console.log($scope.currentUser._id);
      return $http.put(window.location.origin + '/api/admin/approval/' + $scope.currentUser._id);
      //init();
    };

    $scope.denyUser = function() {
      console.log('DENIED!');
      console.log($scope.currentUser._id);
      return $http.delete(window.location.origin + '/api/admin/approval/' + $scope.currentUser._id);
    };

    // Declare methods that can be used to access administrative data
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
        console.log('eyyyyyyyy');
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
