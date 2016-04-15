(function() {
  'use strict';

  angular
    .module('stats')
    .service('Helper', Helper);

  Helper.$inject = ['moment'];

  /* @ngInject */
  function Helper(moment) {

    this.calculateDistances = calculateDistances;
    this.filterThisWeek = filterThisWeek;
    this.addZeroStart = addZeroStart;
    this.mondayFirstDay = mondayFirstDay;
    this.getDuration = getDuration;
    this.getDistance = getDistance;
    this.format = format;
    this.trim = trim;
    this.cumulative = cumulative;
    this.getWeek = getWeek;

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
