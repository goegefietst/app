(function() {
  'use strict';

  angular
    .module('stats')
    .service('Helper', Helper);

  Helper.$inject = ['moment'];

  /* @ngInject */
  /**
  * @class
  * @name HelperService
  * @memberof Stats
  * @description Service that has some helper methods.
  */
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

    /**
    * @function
    * @name calculateDistances
    * @description calcutes distances for points in the routes.
    * @memberof Stats.HelperService
    * @param {Object[]} routes - array of routes that service retrieved.
    * @returns {Object[]} array with distance and time of the points from the retrieved data.
    */
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

    /**
    * @function
    * @name filterThisWeek
    * @description filter data from current week.
    * @memberof Stats.HelperService
    * @param {Object[]} values - array of routes that service retrieved.
    * @returns {Object[]} array with distances and routes of the current week.
    */
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

    /**
    * @function
    * @name addZeroStart
    * @description adds a zero to the front of data to beautify chart.
    * @memberof Stats.HelperService
    * @param {Object[]} data - array of routes that service retrieved.
    * @returns {Object[]} array with an zero added to the front.
    */
    function addZeroStart(data) {
      var withZero = data.slice();
      withZero.unshift(0);
      return withZero;
    }

    /**
    * @function
    * @name mondayFirstDay
    * @description adds a zero to the front of data to beautify chart.
    * @memberof Stats.HelperService
    * @param {number} day - number which day of the week it is when sunday is equal to 0.
    * @returns {number} number which day of the week it is when monday is equal to 0.
    */
    function mondayFirstDay(day) {
      return day === 0 ? 6 : --day;
    }

    /**
    * @function
    * @name getDuration
    * @description calculates the duration of the routes.
    * @memberof Stats.HelperService
    * @param {Object[]} routes - array of routes that service retrieved.
    * @returns {number} duration of routes.
    */
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

    /**
    * @function
    * @name getDistance
    * @description calculates distance between 2 points.
    * @memberof Stats.HelperService
    * @param {number} lat1 - latitude of first point.
    * @param {number} lon1 - longitude of first point.
    * @param {number} lat2 - latitude of second point.
    * @param {number} lon2 - longitude of second point.
    * @returns {number} calculated distance.
    */
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

    /**
    * @function
    * @name format
    * @description formats a number to a 2 digit string.
    * @memberof Stats.HelperService
    * @param {number} number - number.
    * @returns {string} string of the number.
    */
    function format(number) {
      return number > 9 ? '' + number : '0' + number;
    }

    /**
    * @function
    * @name trim
    * @description trims an array.
    * @memberof Stats.HelperService
    * @param {number[]} array - array of data.
    * @param {number} index - index to trim to.
    * @returns {number[]} array that is trimmed.
    */
    function trim(array, index) {
      for (var i = array.length - 1; i >= 0; i--) {
        if (array[i] !== 0) {
          break;
        }
      }
      return array.slice(0, ++i < index ? index : i);
    }

    /**
    * @function
    * @name cumulative
    * @description creates an array with a cumulated value of the original array.
    * @memberof Stats.HelperService
    * @param {number[]} array - array of data.
    * @returns {number[]} array with cumulated values.
    */
    function cumulative(array) {
      var sum = 0;
      var cumul = array.slice();
      for (var i = 0; i < cumul.length; i++) {
        cumul[i] += sum;
        sum = cumul[i];
      }
      return cumul;
    }

    /**
    * @function
    * @name getWeek
    * @description gets a string with first and last day of the week.
    * @memberof Stats.HelperService
    * @param {Object} day - current day.
    * @returns {string} string with the first and last day of the week.
    */
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
