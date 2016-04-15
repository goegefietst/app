(function() {
  'use strict';

  angular
    .module('stats')
    .service('Stats', Stats);

  Stats.$inject = ['$q', 'Database', 'moment'];

  /* @ngInject */
  function Stats($q, Database, moment) {

    this.loadFor = function(timespan) {
      var date = new Date();
      switch (timespan) {
        case 'day': //show a 24 hour day
          return loadData({
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getYear()
          }, loadDayChart, loadDayFooter);
        case 'week': //show a 7 day week
          return loadData({
            time: date.getTime()
          }, loadWeekChart, loadWeekFooter);
        case 'year': //show a 12 month year
          return loadData({
            year: date.getYear()
          }, loadYearChart, loadYearFooter);
      }
    };

    function loadData(options, loadChart, loadFooter) {
      return Database.selectRoutes(options)
        .then(checkIfEmpty)
        .then(Database.selectPoints)
        .then(transformToRoutesAndDistances)
        .then(loadChart)
        .then(loadStats)
        .then(loadLatestRoute)
        .then(loadFooter);
    }

    function checkIfEmpty(values) {
      var deferred = $q.defer();
      var routes = values.routes;
      if (!routes || routes.length < 1) {
        deferred.reject('0 routes were returned from DB');
      } else {
        deferred.resolve(routes.map(function(route) {
          return route.id;
        }));
      }
      return deferred.promise;
    }

    function transformToRoutesAndDistances(points) {
      var deferred = $q.defer();
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
      deferred.resolve({
        distances: distances,
        routes: routes
      });
      return deferred.promise;
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

    function loadStats(values) {
      var deferred = $q.defer();
      var distance = values.distances.reduce(function add(a, b) {
        return a + b.distance;
      }, 0);
      values.dis = distance.toFixed(1);
      var duration = getDuration(values.routes);
      values.tim = duration;
      values.spe = (distance / duration * 1000 * 60 * 60).toFixed(1);
      values.cal = 'Such wow, many';
      deferred.resolve(values);
      return deferred.promise;
    }

    function loadDayChart(values) {
      var deferred = $q.defer();
      var distances = values.distances;
      values.options = {
        scaleSteps: 23,
        scaleStepWidth: 1,
        scaleStartValue: 0,
        bezierCurve: false,
        animation: false,
        pointHitDetectionRadius: 0.1,
        multiTooltipTemplate: '<%= value.toFixed(2) %> km'
      };
      values.labels = [];
      for (var i = 0; i < 24; i++) {
        values.labels.push(
          format(i) + ':' + format(0)
        );
      }
      values.series = ['Per uur', 'Cumulatief'];
      var data = [
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0
      ];
      if (distances !== undefined) {
        for (var j = 0; j < distances.length; j++) {
          var hourMinutes = new Date(distances[j].time);
          var hour = hourMinutes.getHours();
          var minutes = hourMinutes.getMinutes();
          data[minutes > 29 ? hour + 1 : hour] += distances[j].distance;
        }
      }
      data = trim(data, new Date().getHours() + 1);
      values.data = [data, cumulative(data)];
      deferred.resolve(values);
      return deferred.promise;
    }

    function loadDayFooter(values) {
      var deferred = $q.defer();
      var date = new Date();
      values.footer =
        format(date.getDate()) + '/' + format(date.getMonth() + 1);
      deferred.resolve(values);
      return deferred.promise;
    }

    function loadWeekChart(values) {
      filterThisWeek(values);
      var deferred = $q.defer();
      var distances = values.distances;
      values.options = {
        scaleSteps: 6 + 1, //Extra step to start with 0
        scaleStepWidth: 1,
        scaleStartValue: 0,
        bezierCurve: false,
        animation: false,
        pointHitDetectionRadius: 0.1,
        multiTooltipTemplate: '<%= value.toFixed(2) %> km'
      };
      values.labels = ['', 'Maandag', 'Dinsdag', 'Woensdag',
        'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'
      ];
      values.series = ['Per dag', 'Cumulatief'];
      var data = [0, 0, 0, 0, 0, 0, 0];
      var today = mondayFirstDay(new Date().getDay());
      for (var j = 0; j < distances.length; j++) {
        var day = mondayFirstDay(new Date(distances[j].time).getDay());
        data[day] += distances[j].distance;
      }
      data = trim(data, today);
      var dataZeroStart = addZeroStart(data);
      values.data = [dataZeroStart, cumulative(dataZeroStart)];
      deferred.resolve(values);
      return deferred.promise;
    }

    function loadWeekFooter(values) {
      var deferred = $q.defer();
      values.footer = getWeek(new Date());
      deferred.resolve(values);
      return deferred.promise;
    }

    function loadYearChart(values) {
      var deferred = $q.defer();
      var distances = values.distances;
      values.options = {
        scaleSteps: 11 + 1, //Extra step to start with 0
        scaleStepWidth: 1,
        scaleStartValue: 0,
        bezierCurve: false,
        animation: false,
        pointHitDetectionRadius: 0.1,
        multiTooltipTemplate: '<%= value.toFixed(2) %> km'
      };
      values.labels = [
        '', 'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli',
        'Augustus', 'September', 'Oktober', 'November', 'December'
      ];
      values.series = ['Per maand', 'Cumulatief'];
      var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (var j = 0; j < distances.length; j++) {
        var month = new Date(distances[j].time).getMonth();
        data[month] += distances[j].distance;
      }
      data = trim(data, new Date().getMonth());
      var dataZeroStart = addZeroStart(data);
      values.data = [dataZeroStart, cumulative(dataZeroStart)];
      deferred.resolve(values);
      return deferred.promise;
    }

    function loadYearFooter(values) {
      var deferred = $q.defer();
      values.footer = new Date().getFullYear();
      deferred.resolve(values);
      return deferred.promise;
    }

    function loadLatestRoute(values) {
      var deferred = $q.defer();
      var route = values.routes[values.routes.length - 1];
      var distance = 0;
      var duration = 0;

      if (route === undefined || route === null || route.length < 1) {
        console.log('NO LAST ROUTE');
        return;
      }
      for (var j = 0; j < route.length - 1; j++) {
        var first = route[j];
        var second = route[j + 1];
        distance += getDistance(
          first.latitude, first.longitude,
          second.latitude, second.longitude
        );
      }
      distance = Math.round(distance * 100) / 100;
      values.disDiff = distance;
      duration = route[route.length - 1].time - route[0].time;
      values.timDiff = duration;
      var distanceOld = values.dis - values.disDiff;
      var timeOld = values.tim - values.timDiff;
      var speedOld = (distanceOld / timeOld * 1000 * 60 * 60);
      speedOld = Math.round(speedOld * 100) / 100;
      var speed = Math.round((values.spe - speedOld) * 100) / 100;
      values.speDiff = speed > 0 ? '+ ' + speed : '- ' + Math.abs(speed);
      deferred.resolve(values);
      return deferred.promise;
    }

    function filterThisWeek(values) {
      var distances = values.distances;
      var routes = values.routes;
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
      values.distances = filteredDistances;
      values.routes = filteredRoutes;
      return values;
    }

    function addZeroStart(data) {
      var withZero = data.slice();
      withZero.unshift(0);
      return withZero;
    }

    function mondayFirstDay(day) {
      return day === 0 ? 6 : --day;
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
