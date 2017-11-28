'use strict';

angular.module('core').controller('AdminPortalController', ['$scope', '$http', 'NgTableParams', 'Authentication',
  function($scope, $http, NgTableParams, Authentication) {

    let alreadyClicked = false;

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
    const init = () => {


      $scope.admin.getWaitingUsers()
        .then((results) => {
          $scope.allUsers = results.data;
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

    $scope.toTitleCase = function(str) {
      if (!str) return;

      return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };

    $scope.approvalDetails = function(user, index) {
      $scope.currentUser = user;
      $scope.currentIndex = index;
      $scope.error = '';
      $('#approvalModal').modal('show');
    };

    $scope.approveUser = function() {
      if (!alreadyClicked) {
        $scope.error = '';
        alreadyClicked = true;
//        console.log('Approved!');
        $http.put(window.location.origin + '/api/admin/approval/' + $scope.currentUser._id, {} ,$scope.header)
          .then(() => {
            // Reinitialize table
            init();
            $('#approvalModal').modal('hide');
            alreadyClicked = false;
          })
          .catch((err) => {
            console.log(err);
            $scope.error = err;
            alreadyClicked = false;
          });
      }
    };

    $scope.denyUser = function() {
      if (!alreadyClicked) {
        $scope.error = '';
        alreadyClicked = true;
//        console.log('DENIED!');
        $http.delete(window.location.origin + '/api/admin/approval/' + $scope.currentUser._id, $scope.header)
          .then(() => {
            // Reinitialize table
            init();
            $('#approvalModal').modal('hide');
            alreadyClicked = false;
          })
          .catch((err) => {
            console.log(err);
            $scope.error = err;
            alreadyClicked = false;
          });
      }
    };

    // Declare methods that can be used to access administrative data
    $scope.admin = {
      getWaitingUsers: function() {
        return $http.get(window.location.origin + '/api/admin/approval', $scope.header)
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
