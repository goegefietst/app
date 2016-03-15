(function() {
  'use strict';

  angular
    .module('app.performance')
    .controller('PersonalPerformanceController', Controller);

  Controller.$inject = ['$scope']; //dependencies

  /* @ngInject */
  function Controller($scope) {
    var vm = this;

    testChart($scope);

    vm.timespan = 'day';
    vm.chartData = 'distance';

    vm.dis = 15.4;
    vm.tim = '01:05:23';
    vm.spe = 5.3;
    vm.cal = 50;

    vm.isActive = function isActive(value) {
      return vm.timespan === value;
    };

    vm.day = function day() {
      //change timespan to day
      vm.timespan = 'day';
      console.log('test timespan changed to ' + vm.timespan);
    };

    vm.week = function week() {
      //change timespan to week$
      vm.timespan = 'week';
      console.log('test timespan changed to ' + vm.timespan);
    };

    vm.month = function month() {
      //change timespan to month
      vm.timespan = 'month';
      console.log('test timespan changed to ' + vm.timespan);
    };

    vm.distance = function distance() {
      //change chart data to distance
      vm.chartData = 'distance';
      console.log('test chartData changed to ' + vm.chartData);
    };

    vm.time = function time() {
      //change chart data to time
      vm.chartData = 'time';
      console.log('test chartData changed to ' + vm.chartData);
    };

    vm.speed = function speed() {
      //change chart data to speed
      vm.chartData = 'speed';
      console.log('test chartData changed to ' + vm.chartData);
    };

    vm.calories = function calories() {
      //change chart data to calories
      vm.chartData = 'calories';
      console.log('test chartData changed to ' + vm.chartData);
    };

    vm.previous = function previous() {
      //select the previous day/week/year
      console.log('test previous was clicked');
    };

    vm.next = function next() {
      //select the next day/week/year
      console.log('test next was clicked');
    };
  }

  function testChart($scope) {
    var dates = [1455266094000, 1455870894000,
      1456475694000, 1457080494000, 1457685294000
    ];
    $scope.labels = [];
    for (var i = 0; i < dates.length; i++) {
      var date = new Date(dates[i]);
      $scope.labels.push(
        format(date.getDate()) + '/' + format(date.getMonth())
      );
    }
    $scope.series = ['km gefietst'];
    $scope.data = [
      [12.2, 13.7, 12.3, 21.4, 22.7]
    ];
    $scope.onClick = function(points, evt) {
      console.log(points, evt);
    };

    function format(number) {
      return number > 9 ? '' + number : '0' + number;
    }
  }
})();
