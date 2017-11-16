/*~*/
'use strict';

angular.module('core').controller('AdminPortalController', ['$scope', '$http', 'NgTableParams', '$state', '$stateParams',
  function($scope, $http, NgTableParams, $state, $stateParams) {
    const init = () => {
      //console.log($stateParams.userId);
      $scope.currentUser = {};

      $scope.getUser()
      .then((results) => {
        console.log(results);
        $scope.currentUser.firstName = results.data.firstName;
        $scope.currentUser.lastName = results.data.lastName;
        $scope.currentUser.email = results.data.email;
        $scope.currentUser.birthday = results.data.birthday;
        $scope.currentUser.address = results.data.address;
        $scope.currentUser.gender = results.data.gender;
        $scope.currentUser.role = results.data.role;
      })
      .catch((err) => {
        console.log(err);
      });

      $scope.editUser = function(fromForm) {
        console.log($scope.currentUser);
        $http.put('/api/admin/editUser/' + $stateParams.userId, $scope.currentUser).success((response) => {
          $state.go('manage-users');
        }).error((response) => {
          $scope.error = response.message;
          alert(response.message);
        });
      };

      $scope.admin.getWaitingUsers()
        .then((results) => {
          $scope.allUsers = results.data;
          //console.log(results.data);
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
      $scope.admin.getAllUsers()
      .then((results) => {
        $scope.allUsers = results.data;
        //console.log(results.data);
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
    $scope.approvalDetails = function(user, index) {
      $scope.currentUser = user;
      $scope.currentIndex = index;
      $scope.error = false;
      $('#approvalModal').modal('show');
    };

    $scope.manageUser = function(user, index) {
      $state.go('manage-user', { 'userId': user._id });

    };

    $scope.approveUser = function() {
      //console.log('Approved!');
      //console.log($scope.currentUser._id);
      return $http.put(window.location.origin + '/api/admin/approval/' + $scope.currentUser._id);
    };
    $scope.getUser = function() {
      //console.log($stateParams.userId);
      return $http.get(window.location.origin + '/api/admin/editUser/' + $stateParams.userId)
      .then((results) => {
        return results;
      })
      .catch((err) => {
        return err;
      });
    };
    $scope.denyUser = function() {
      //console.log('DENIED!');
      //console.log($scope.currentUser._id);
      return $http.delete(window.location.origin + '/api/admin/approval/' + $scope.currentUser._id);
    };

    // Declare methods that can be used to access administrative data
    //////
    $scope.admin = {
      getAllUsers: function() {
        return $http.get(window.location.origin + '/api/admin/getAllUsers')
        .then((results) => {
          //return results;
          $scope.allUsers = results.data;
          console.log(results.data);
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
      //////
      getAllUsers: function() {
        return $http.get(window.location.origin + '/api/admin/getAllUsers')
        .then((results) => {
          return results;
        })
        .catch((err) => {
          return err;
        });
      },
      getWaitingUsers: function() {
        return $http.get(window.location.origin + '/api/admin/approval')
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
      },

      approve: function(id) {
        //console.log('eyyyyyyyy');
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
