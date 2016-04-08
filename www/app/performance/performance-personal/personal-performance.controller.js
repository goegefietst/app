(function() {
  'use strict';

  angular
    .module('app.performance')
    .controller('PersonalPerformanceController', Controller)
    .filter('msToTimeFilter', Filter);

  function Filter() {
    return function(duration) {
      var seconds = parseInt((duration / 1000) % 60);
      var minutes = parseInt((duration / (1000 * 60)) % 60);
      var hours = parseInt((duration / (1000 * 60 * 60)) % 24);

      hours = (hours < 10) ? '0' + hours : hours;
      minutes = (minutes < 10) ? '0' + minutes : minutes;
      seconds = (seconds < 10) ? '0' + seconds : seconds;

      return hours + ':' + minutes + ':' + seconds;
    };
  }

  Controller.$inject = ['$q', '$stateParams', 'Database', 'moment']; //dependencies

  /* @ngInject */
  function Controller($q, $stateParams, Database, moment) {
    var vm = this;
    var dataLoaded = $q.defer();

    vm.timespan = 'day';
    vm.routes = [];
    vm.chartData = 'distance';
    vm.footer = '';

    vm.dis = '0.0';
    vm.tim = 0;
    vm.spe = '0.0';
    vm.cal = '0';
    vm.new = {
      dis: 0,
      tim: 0,
      spe: 0
    };

    //CHANGE BETWEEN DAY, WEEK OR YEAR STATISTICS
    vm.isActive = isActive;
    vm.goToDay = goToDay;
    vm.goToWeek = goToWeek;
    vm.goToYear = goToYear;

    //SHOW RECENT TRACKED DATA IF USER JUST STOPPED TRACKING
    vm.showNewData = showNewData;

    //CURRENTLY NOT USED
    vm.goToDistance = goToDistance;
    vm.goToTime = goToTime;
    vm.goToSpeed = goToSpeed;
    vm.goToCalories = goToCalories;
    vm.goToPrevious = goToPrevious;
    vm.goToNext = goToNext;

    //DEFAULT
    vm.goToDay();
    vm.showNewData();

    function showNewData() {
      var isDataLoaded = dataLoaded.promise;
      isDataLoaded.then(function() {
        var route = $stateParams.route;
        var distance = 0;
        var duration = 0;

        if (route !== undefined && route !== null) {
          if (route.length > 1) {
            for (var j = 0; j < route.length - 1; j++) {
              var first = route[j];
              var second = route[j + 1];
              distance += getDistance(
                first.latitude, first.longitude,
                second.latitude, second.longitude
              );
            }
            distance = Math.round(distance * 100) / 100;
            vm.new.dis = distance;
            duration = route[route.length - 1].time - route[0].time;
            vm.new.tim = duration;
            var distanceOld = vm.dis - vm.new.dis;
            var timeOld = vm.tim - vm.new.tim;
            var speedOld = (distanceOld / timeOld * 1000 * 60 * 60);
            speedOld = Math.round(speedOld * 100) / 100;
            var speed = Math.round((vm.spe - speedOld) * 100) / 100;
            vm.new.spe = speed > 0 ? '+ ' + speed : '- ' + Math.abs(speed);
          }
        }
      });
    }

    function goToDay() {
      //change timespan to day
      vm.timespan = 'day';
      console.log('test timespan changed to ' + vm.timespan);
      var date = new Date();
      vm.footer = format(date.getDate()) + '/' + format(date.getMonth() + 1);
      loadData({
        day: date.getDay(),
        month: date.getMonth(),
        year: date.getYear()
      });
    }

    function goToWeek() {
      //change timespan to week$
      vm.timespan = 'week';
      var date = new Date();
      vm.footer = getWeek(date);
      console.log('test timespan changed to ' + vm.timespan);
      loadData({
        time: Date.now()
      });
    }

    function goToYear() {
      //change timespan to year
      vm.timespan = 'year';
      console.log('test timespan changed to ' + vm.timespan);
      var date = new Date();
      vm.footer = date.getFullYear();
      loadData({
        year: date.getYear()
      });
    }

    function goToDistance() {
      //change chart data to distance
      vm.chartData = 'distance';
      console.log('test chartData changed to ' + vm.chartData);
    }

    function goToTime() {
      //change chart data to time
      vm.chartData = 'time';
      console.log('test chartData changed to ' + vm.chartData);
    }

    function goToSpeed() {
      //change chart data to speed
      vm.chartData = 'speed';
      console.log('test chartData changed to ' + vm.chartData);
    }

    function goToCalories() {
      //change chart data to calories
      vm.chartData = 'calories';
      console.log('test chartData changed to ' + vm.chartData);
    }

    function goToPrevious() {
      //select the previous day/week/year
      console.log('test previous was clicked');
    }

    function goToNext() {
      //select the next day/week/year
      console.log('test next was clicked');
    }

    function isActive(value) {
      return vm.timespan === value;
    }

    function loadData(options) {
      Database.selectRoutes(routeCallback, options);

      function routeCallback(routes) {
        if (!routes || routes.length < 1) {
          console.log('0 routes were returned from DB');
          resetStats();
          loadChartAndStats([]);
          return;
        }
        Database.selectPoints(pointCallback, routes.map(function(route) {
          return route.id;
        }));
      }

      function pointCallback(points) {
        var routes = [];
        for (var i = 0; i < points.length; i++) {
          if (!routes[points[i].routeId]) {
            routes[points[i].routeId] = [];
            routes[points[i].routeId].push(points[i]);
          } else {
            routes[points[i].routeId].push(points[i]);
          }
        }
        var distances = calculateDistances(routes);
        loadChartAndStats(distances, routes);
      }
    }

    function loadChartAndStats(distances, routes) {
      switch (vm.timespan) {
        case 'day': //show a 24 hour day
          loadDayChart(distances);
          loadStats(distances, routes);
          break;
        case 'week': //show a 7 day week
          var filtered = filterThisWeek(distances, routes);
          loadWeekChart(filtered.distances);
          loadStats(filtered.distances, filtered.routes);
          break;
        case 'year': //show a 12 month year
          loadYearChart(distances);
          loadStats(distances, routes);
          break;
      }
    }

    function loadStats(distances, routes) {
      var distance = distances.reduce(function add(a, b) {
        return a + b.distance;
      }, 0);
      vm.dis = distance.toFixed(1);
      var duration = getDuration(routes);
      vm.tim = duration;
      vm.spe = (distance / duration * 1000 * 60 * 60).toFixed(1);
      vm.cal = 'Such wow, many';
      dataLoaded.resolve();
    }

    function loadDayChart(distances) {
      console.log('Loading day chart');
      vm.options = {
        scaleSteps: 23,
        scaleStepWidth: 1,
        scaleStartValue: 0,
        bezierCurve: false,
        animation: false
      };
      vm.labels = [];
      for (var i = 0; i < 24; i++) {
        vm.labels.push(
          format(i) + ':' + format(0)
        );
      }
      vm.series = ['Per uur', 'Cumulatief'];
      var data = [
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0
      ];
      for (var j = 0; j < distances.length; j++) {
        var hourMinutes = new Date(distances[j].time);
        var hour = hourMinutes.getHours();
        var minutes = hourMinutes.getMinutes();
        data[minutes > 29 ? hour + 1 : hour] += distances[j].distance;
      }
      data = trim(data, new Date().getHours() + 1);
      vm.data = [data, cumulative(data)];
    }

    function loadWeekChart(distances) {
      console.log('Loading week chart');
      vm.options = {
        scaleSteps: 6 + 1, //Extra step to start with 0
        scaleStepWidth: 1,
        scaleStartValue: 0,
        bezierCurve: false,
        animation: false
      };
      vm.labels = ['', 'Maandag', 'Dinsdag', 'Woensdag',
        'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'
      ];
      vm.series = ['Per dag', 'Cumulatief'];
      var data = [0, 0, 0, 0, 0, 0, 0];
      var today = mondayFirstDay(new Date().getDay());
      for (var j = 0; j < distances.length; j++) {
        var day = mondayFirstDay(new Date(distances[j].time).getDay());
        data[day] += distances[j].distance;
      }
      data = trim(data, today);
      var dataZeroStart = addZeroStart(data);
      vm.data = [dataZeroStart, cumulative(dataZeroStart)];
    }

    function loadYearChart(distances) {
      console.log('Loading year chart');
      vm.options = {
        scaleSteps: 11 + 1, //Extra step to start with 0
        scaleStepWidth: 1,
        scaleStartValue: 0,
        bezierCurve: false,
        animation: false
      };
      vm.labels = [
        '', 'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli',
        'Augustus', 'September', 'Oktober', 'November', 'December'
      ];
      vm.series = ['Per maand', 'Cumulatief'];
      var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (var j = 0; j < distances.length; j++) {
        var month = new Date(distances[j].time).getMonth();
        data[month] += distances[j].distance;
      }
      data = trim(data, new Date().getMonth());
      var dataZeroStart = addZeroStart(data);
      vm.data = [dataZeroStart, cumulative(dataZeroStart)];
    }

    function filterThisWeek(distances, routes) {
      var filteredDistances = [];
      var filteredRoutes = [];
      var monday = moment().startOf('isoweek').toDate();
      for (var i = 0; i < distances.length; i++) {
        if (distances[i].time > monday.getTime()) {
          filteredDistances.push(distances[i]);
        }
      }
      for (var j = 0; j < routes.length; j++) {
        var route = routes[j];
        if (Object.prototype.toString.call(route) === '[object Array]' &&
          route.length > 1 && route[route.length - 1].time > monday.getTime()) {
          filteredRoutes.push(route);
        }
      }
      console.log('FILTERED ROUTES');
      console.log(filteredRoutes);
      return {
        distances: filteredDistances,
        routes: filteredRoutes
      };
    }

    function addZeroStart(data) {
      var withZero = data.slice();
      withZero.unshift(0);
      return withZero;
    }

    function mondayFirstDay(day) {
      return day === 0 ? 6 : --day;
    }

    function calculateDistances(routes) {
      var distances = [];
      for (var i = 0; i < routes.length; i++) {
        if (Object.prototype.toString.call(routes[i]) === '[object Array]') {
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
      }
      return distances;
    }

    function getDuration(routes) {
      var duration = 0;
      for (var i = 0; i < routes.length; i++) {
        var route = routes[i];
        if (Object.prototype.toString.call(route) === '[object Array]' &&
          route.length > 1) {
          duration += route[route.length - 1].time - route[0].time;
        }
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
      var dist = Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      dist = dist * 1.609344;
      return dist;
    }

    function format(number) {
      return number > 9 ? '' + number : '0' + number;
    }

    function trim(array, index) {
      for (var i = array.length - 1; i >= 0; i--) {
        if (array[i] !== 0) {
          break;
        }
      }
      return array.slice(0, ++i < index ? index : i);
    }

    function cumulative(array) {
      var sum = 0;
      var cumul = array.slice();
      for (var i = 0; i < cumul.length; i++) {
        cumul[i] += sum;
        sum = cumul[i];
      }
      return cumul;
    }

    function resetStats() {
      vm.dis = '0.0';
      vm.tim = 0;
      vm.spe = '0.0';
      vm.cal = '0';
    }

    function getWeek(day) {
      var firstday = new Date(day.setDate(day.getDate() - day.getDay() + 1));
      var lastday = new Date(day.setDate(day.getDate() - day.getDay() + 7));
      return format(firstday.getDate()) + '/' +
        format(firstday.getMonth() + 1) +
        ' - ' + format(lastday.getDate()) +
        '/' + format(lastday.getMonth() + 1);
    }

  }
})();
