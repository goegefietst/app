(function() {
  'use strict';

  angular
    .module('app.performance')
    .controller('PersonalPerformanceController', Controller);

  Controller.$inject = ['Database']; //dependencies

  /* @ngInject */
  function Controller(Database) {
    var vm = this;

    vm.timespan = 'day';
    vm.routes = [];
    vm.chartData = 'distance';

    vm.dis = '0.0';
    vm.tim = '00:00:00';
    vm.spe = '0.0';
    vm.cal = '0';

    vm.loadData = function loadData(options) {
      //temporary for testing purposes, should load from db later
      vm.routes = [
        [{
          latitude: 66,
          longitude: 66,
          altitude: 123,
          accuracy: 10,
          speed: 5.5,
          time: Date.now() - 4 * 60 * 60 * 1000
        }, {
          latitude: 66.2,
          longitude: 66.3,
          altitude: 124,
          accuracy: 10,
          speed: 5.0,
          time: Date.now() - 3 * 60 * 60 * 1000
        }],
        [{
          latitude: 66.2,
          longitude: 66.3,
          altitude: 123,
          accuracy: 10,
          speed: 5.5,
          time: Date.now() - 1 * 60 * 60 * 1000
        }, {
          latitude: 66.1,
          longitude: 66.2,
          altitude: 124,
          accuracy: 10,
          speed: 5.0,
          time: Date.now()
        }]
      ];
      var distances = calculateDistances(vm.routes);
      var distance = distances.reduce(function add(a, b) {
        return a + b.distance;
      }, 0);
      vm.dis = distance.toFixed(1);/*Math.round(distances.reduce(function add(a, b) {
        return a + b.distance;
      }, 0) * 10) / 10;*/
      var duration = getDuration(vm.routes);
      vm.tim = msToTime(duration);
      vm.spe = (distance / duration * 1000 * 60 * 60).toFixed(1);
      vm.cal = 'Such wow, many';
      vm.loadChart(distances);

      /*var callback = function(routes) {
        vm.routes = routes;
        vm.routes.sort(comparePoints);
        vm.loadChart();

        function comparePoints(a, b) {
          return a.time - b.time;
        }
      };
      Database.selectRoutes(callback, options);*/
    };

    vm.loadChart = function loadChart(distances) {
      switch (vm.timespan) {
        case 'day': //show a 24 hour day
          vm.loadDayChart(distances);
          break;
        case 'week': //show a 7 day week
          vm.loadWeekChart(distances);
          break;
        case 'year': //show a 12 month year
          vm.loadYearChart(distances);
          break;
      }
    };

    vm.loadDayChart = function loadDayChart(distances) {
      console.log('Loading day chart');
      vm.options = {
        scaleSteps: 23,
        scaleStepWidth: 1,
        scaleStartValue: 0,
        bezierCurve: false
      };
      vm.labels = [];
      for (var i = 0; i < 24; i++) {
        vm.labels.push(
          format(i) + ':' + format(0)
        );
      }
      vm.series = ['test serie'];
      var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (var j = 0; j < distances.length; j++) {
        var hour = new Date(distances[j].time).getHours();
        data[hour] += distances[j].distance;
      }
      vm.data = [cumulative(data)];
    };

    vm.loadWeekChart = function loadWeekChart(distances) {
      console.log('Loading week chart');
      vm.options = {
        scaleSteps: 7,
        scaleStepWidth: 1,
        scaleStartValue: 0,
      };
      // TODO
    };

    vm.loadYearChart = function loadYearChart(distances) {
      console.log('Loading year chart');
      vm.options = {
        scaleSteps: 12,
        scaleStepWidth: 1,
        scaleStartValue: 0,
      };
      // TODO
    };

    function calculateDistances(routes) {
      var distances = [];
      for (var i = 0; i < routes.length; i++) {
        routes[i].sort(function(a, b) {
          return a.time - b.time;
        });
        for (var j = 0; j < routes[i].length - 1; j++) {
          var first = routes[i][j];
          var second = routes[i][j + 1];
          var time = (first.time + second.time) / 2;
          var distance = getDistance(
            first.latitude, first.longitude,
            second.latitude, second.longitude
          );
          distances.push({
            time: time,
            distance: distance
          });
        }
      }
      return distances;
    }

    function getDuration(routes) {
      var duration = 0;
      for (var i = 0; i < routes.length; i++) {
        var route = routes[i];
        duration += route[route.length - 1].time - route[0].time;
      }
      return duration;
    }

    function msToTime(duration) {
      var seconds = parseInt((duration / 1000) % 60);
      var minutes = parseInt((duration / (1000 * 60)) % 60);
      var hours = parseInt((duration / (1000 * 60 * 60)) % 24);

      hours = (hours < 10) ? '0' + hours : hours;
      minutes = (minutes < 10) ? '0' + minutes : minutes;
      seconds = (seconds < 10) ? '0' + seconds : seconds;

      return hours + ':' + minutes + ':' + seconds;
    }

    function getDistance(lat1, lon1, lat2, lon2) {
      var radlat1 = Math.PI * lat1 / 180;
      var radlat2 = Math.PI * lat2 / 180;
      var theta = lon1 - lon2;
      var radtheta = Math.PI * theta / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      dist = dist * 1.609344;
      return dist;
    }

    function format(number) {
      return number > 9 ? '' + number : '0' + number;
    }

    function cumulative(array) {
      var sum = 0;
      for (var i = 0; i < array.length; i++) {
        array[i] += sum;
        sum = array[i];
      }
      return array;
    }

    vm.isActive = function isActive(value) {
      return vm.timespan === value;
    };

    vm.day = function day() {
      //change timespan to day
      vm.timespan = 'day';
      console.log('test timespan changed to ' + vm.timespan);
      var date = new Date();
      vm.loadData({
        day: date.getDay(),
        month: date.getMonth(),
        year: date.getYear()
      });
    };

    vm.week = function week() {
      //change timespan to week$
      vm.timespan = 'week';
      console.log('test timespan changed to ' + vm.timespan);
      vm.loadData({
        time: Date.now()
      });
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

    vm.day();
  }
})();
