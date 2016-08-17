/**
 * @namespace Stats
 */
(function() {
  'use strict';

  angular
    .module('stats')
    .service('Stats', Stats);

  Stats.$inject = [
    '$q', 'Database', 'Helper', 'Day', 'Week', 'Year'
  ];

  /* @ngInject */
  /**
   * @class
   * @name StatsService
   * @memberof Stats
   * @description Service that is responsible for the stats.
   */
  function Stats($q, Database, Helper, Day, Week, Year) {

    var dayCache = false;
    var weekCache = false;
    var yearCache = false;

    this.loadFor = function(timespan) {
      var date = new Date();
      switch (timespan) {
        case 'day': //show a 24 hour day
          if (dayCache) {
            console.log('DAY CACHE');
            return $q.resolve(dayCache);
          }
          return loadData({
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getYear()
          }, Day.setDefaultValues, Day.loadChart, Day.loadFooter, timespan);
        case 'week': //show a 7 day week
          if (weekCache) {
            console.log('WEEK CACHE');
            return $q.resolve(weekCache);
          }
          return loadData({
            time: date.getTime()
          }, Week.setDefaultValues, Week.loadChart, Week.loadFooter, timespan);
        case 'year': //show a 12 month year
          if (yearCache) {
            console.log('YEAR CACHE');
            return $q.resolve(yearCache);
          }
          return loadData({
            year: date.getYear()
          }, Year.setDefaultValues, Year.loadChart, Year.loadFooter, timespan);
      }
    };

    this.invalidate = function() {
      dayCache = false;
      weekCache = false;
      yearCache = false;
    };

    /**
     * @callback loadChart
     * @description Load data and draw chart.
     */

    /**
     * @callback loadFooter
     * @description Load footer.
     */

    /**
     * @callback setDefaultValues
     * @description Set default values for statistics.
     */

    /**
     * @function
     * @name loadData
     * @memberof Stats.StatsService
     * @param {Object} options - options that determine what routes should be retrieved.
     * @param {setDefaultValues} setDefaultValues - callback that sets default values for statistics.
     * @param {loadChart} loadChart - callback that loads the chart.
     * @param {loadFooter} loadFooter - callback that loads the footer.
     */
    function loadData(options, setDefaultValues, loadChart, loadFooter, timespan) {

      return Database.selectRoutes(options)
        .then(checkIfEmpty)
        .then(Database.selectPoints)
        .then(transformToRoutesAndDistances)
        .then(setDefaultValues)
        .then(loadChart)
        .then(loadStats)
        .then(loadLatestRoute)
        .then(loadFooter)
        .then(function(values) {
          return cache(values, timespan);
        });
    }

    /**
     * @function
     * @name checkIfEmpty
     * @description checks if the retrieved data is empty or not.
     * @memberof Stats.StatsService
     * @param {Object} values - routes retrieved from database.
     * @returns {Promise}
     */
    function checkIfEmpty(values) {
      var deferred = $q.defer();
      var routes = values.routes;
      if (!routes || routes.length < 1) {
        deferred.resolve([]);
      } else {
        deferred.resolve(routes.map(function(route) {
          return route.id;
        }));
      }
      return deferred.promise;
    }

    /**
     * @function
     * @name transformToRoutesAndDistances
     * @description transforms points to routes and calculates distances.
     * @memberof Stats.StatsService
     * @param {Object} points - points retrieved from database.
     * @returns {Promise}
     */
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
      var distances = Helper.calculateDistances(routes);
      deferred.resolve({
        distances: distances,
        routes: routes
      });
      return deferred.promise;
    }

    /**
     * @function
     * @name loadStats
     * @description sets the stats in table.
     * @memberof Stats.StatsService
     * @param {Object} values - points retrieved from database.
     * @returns {Promise}
     */
    function loadStats(values) {
      var deferred = $q.defer();
      if (values.distances.length < 1) {
        deferred.resolve(values);
        return deferred.promise;
      }
      var distance = values.distances.reduce(function add(a, b) {
        return a + b.distance;
      }, 0);
      values.dis = distance.toFixed(1);
      var duration = Helper.getDuration(values.routes);
      values.tim = duration;
      values.spe = (distance / duration * 1000 * 60 * 60).toFixed(1);
      var intensity = 6;
      if (values.spe < 12) {
        intensity = 4;
      }
      if (values.spe > 20) {
        intensity = 8;
      }
      values.cal = (duration / 1000 / 60 * intensity).toFixed(1);
      deferred.resolve(values);
      return deferred.promise;
    }

    /**
     * @function
     * @name loadLatestRoute
     * @description Loads the latest route from the database.
     * @memberof Stats.StatsService
     * @param {Object} values - data retrieved from database.
     * @returns {Promise}
     */
    function loadLatestRoute(values) {
      var deferred = $q.defer();
      if (values.routes.length < 1) {
        deferred.resolve(values);
        return deferred.promise;
      }
      var route = values.routes[values.routes.length - 1];
      var distance = 0;

      if (route === undefined || route === null || route.length < 1) {
        console.log('NO LAST ROUTE');
        return $q.reject(); //fixme test
      }
      for (var j = 0; j < route.length - 1; j++) {
        var first = route[j];
        var second = route[j + 1];
        distance += Helper.getDistance(
          first.latitude, first.longitude,
          second.latitude, second.longitude
        );
      }
      distance = Math.round(distance * 100) / 100;
      values.disDiff = distance;
      values.timDiff = route[route.length - 1].time - route[0].time;
      var distanceOld = values.dis - values.disDiff;
      var timeOld = values.tim - values.timDiff;
      var speedOld =
        timeOld === 0 ? 0 : (distanceOld / timeOld * 1000 * 60 * 60);
      speedOld = Math.round(speedOld * 100) / 100;
      var speed = Math.round((values.spe - speedOld) * 100) / 100;
      values.speDiff = speed >= 0 ? '+ ' + speed : '- ' + Math.abs(speed);
      var intensity = 6;
      if (values.spe < 12) {
        intensity = 4;
      }
      if (values.spe > 20) {
        intensity = 8;
      }
      values.calDiff = '+ ' +
        (values.timDiff / 1000 / 60 * intensity).toFixed(1);
      deferred.resolve(values);
      return deferred.promise;
    }

    function cache(values, timespan) {
      switch (timespan) {
        case 'day':
          dayCache = values;
          break;
        case 'week':
          weekCache = values;
          break;
        case 'year':
          yearCache = values;
          break;
      }
      return values;
    }
  }
})();
