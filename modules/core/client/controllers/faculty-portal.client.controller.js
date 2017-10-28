'use strict';

// TODO consider replacing $http requests with controller (sessions.client.service.js)
angular.module('core').controller('FacultyPortalController', ['$scope','$http','NgTableParams', '$rootScope',
  function($scope, $http, NgTableParams, $rootScope) {
    $scope.extraCredit = {};
    $scope.newCourse = {};

    // Prevent race condition
    let alreadyClicked = false;

    // Called after page loads
    $scope.init = function(){
      $('section.ng-scope').css('margin-top', '0px');
      $('section.ng-scope').css('margin-bottom', '0px');

      $scope.courses.getAll()
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.allCourses = results.data;
        });
    };

    $scope.populateCourse = function(){
      $scope.sessions.extraCreditByCourse($scope.selectedCourse.name)
        .then((results) => {
          // Assign results to upcomingSessions.data
          $scope.extraCredit.data = results.data;
          console.log($scope.extracredit);

          $scope.extraCredit = new NgTableParams({
            count: 10,
            sorting: {
              lastName: 'desc'
            }
          }, {
            counts: [], // hides page sizes
            dataset: $scope.extraCredit.data // select data
          });
        });
    };

    $scope.addCourse = function() {
      if(!alreadyClicked){
        $scope.error = '';
        if(!$scope.newCourse.name){
          $scope.error = "The course name cannot be empty!";
        } else{
          $http.post('/api/courses/', $scope.newCourse).success((response) => {
            $('#addCourseModal').modal('hide');
            $scope.init();
            alreadyClicked = false;
          }).error((response) => {
            $scope.error = response.message;
            alreadyClicked = false;
          });
        }
      }
    };

    $scope.exportCSV = function() {
      const fileName = "Grades-" + $scope.selectedCourse.name + '.csv';
      let mimeType = 'text/csv;encoding=utf-8';
      $scope.extraCredit.data
      let data = [["Student"]];
      for(let i = 0; i < $scope.extraCredit.data.length; i++) {
        const tempArray = ["\"" + $scope.extraCredit.data[i].lastName + ", " + $scope.extraCredit.data[i].firstName + "\""];
        data.push(tempArray);
      }
      let lineArray = [];
      data.forEach(function(infoArray, index) {
        let line = infoArray.join("");
        lineArray.push(line);
      });
      let csvContent = lineArray.join("\n");
      let a = document.createElement('a');
      mimeType = mimeType || 'application/octet-stream';
      if(navigator.msSaveBlob) { //IE10
        navigator.msSaveBlob(new Blob([csvContent], {
          type: mimeType
        }), fileName);
      } else if(URL && 'download' in a) { //html5 A[download]
        a.href = URL.createObjectURL(new Blob([csvContent], {
          type: mimeType
        }));
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        location.href = 'data:application/octet-stream,' + encodeURIComponent(csvContent); //only this mime type is supported
      }
    };

    // Declare methods that can be used to access session data
    $scope.sessions = {
      extraCreditByCourse: function(courseName) {
        return $http.get(window.location.origin + '/api/sessions/course/' + courseName)
            .then((results) => {
              return results;
            })
            .catch((err) => {
              return err;
            });
      }
    };

    // Declare methods that can be used to access course data
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

      create: function(newCourse) {
        return $.ajax({
          url: window.location.origin + '/api/courses/',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(newCourse)
        });
      }
    };

    // Run our init function
    $scope.init();
  }
]);
