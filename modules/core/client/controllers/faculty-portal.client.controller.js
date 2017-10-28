'use strict';

// TODO consider replacing $http requests with controller (sessions.client.service.js)
angular.module('core').controller('FacultyPortalController', ['$scope','$http','NgTableParams', '$rootScope',
  function($scope, $http, NgTableParams, $rootScope) {


    // Called after page loads
    $scope.init = function(){
      // TODO Get all sessions for this USER (find user details)
      // TODO Resize table columns and possibly hide column on mobile
      $scope.courses.getAll()
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.allCourses = results.data;
          console.log($scope.allCourses);
      //    $scope.create();
        });


      $scope.sessions.extraCreditByCourse("C59ea70e7a56af007a83e1fe5")
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.extracredit = results.data;
          console.log('Extra credit' + JSON.stringify($scope.extracredit));
        });


    };

/*      $scope.sessions.extraCreditByCourse("59ea70e7a56af007a83e1fe5")
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.extracredit = results.data;
          console.log($scope.extracredit);
      //    $scope.create();
        });*/


    $scope.sessions = {
      extraCreditByCourse: function() {
        return $http.get(window.location.origin + '/api/sessions/course/:courseName')
            .then((results) => {
              return results;
            })
            .catch((err) => {
              return err;
            });
      }
    }

    // Declare methods that can be used to access session data
    
    $scope.courses = {
      getAll: function() {
        return $http.get(window.location.origin + '/api/courses/')
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },  

 /*     extraCreditByCourse: function() {
        return $http.get(window.location.origin + '/api/courses/:courseName')
          .then((results) => {
            return results;
          })
          .catch((err) => {
            return err;
          });
      },*/


      create: function(newCourse) {
        return $.ajax({
          url: window.location.origin + '/api/courses/',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newCourse)
        });


        $scope.addCourse = function(newCourse) {
          // $scope.newCourse needs to have a name
          console.log('cousess ran');
          $scope.newCourse.name = newCourse;
          const newCourseBody = {
            name: $scope.newCourse.name
          }
          $http.post('/api/courses/', newCourseBody).success((response) => {
            console.log('ran2');
          }).error((response) => {
            $scope.error = response.message;
            console.log('ran3');
          });
        };
        


      }

    };

    // Run our init function
    $scope.init();


  }
]);
