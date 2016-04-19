(function() {
  'use strict';

  angular
    .module('stats')
    .service('Stats', Stats);

  Stats.$inject = [
    '$q', 'Database', 'Helper', 'Day', 'Week', 'Year'
  ];

  /* @ngInject */
  function Stats($q, Database, Helper, Day, Week, Year) {

    this.loadFor = function(timespan) {
      var date = new Date();
      switch (timespan) {
        case 'day': //show a 24 hour day
          return loadData({
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getYear()
          }, Day.setDefaultValues, Day.loadChart, Day.loadFooter);
        case 'week': //show a 7 day week
          return loadData({
            time: date.getTime()
          }, Week.setDefaultValues, Week.loadChart, Week.loadFooter);
        case 'year': //show a 12 month year
          return loadData({
            year: date.getYear()
          }, Year.setDefaultValues, Year.loadChart, Year.loadFooter);
      }
    };

    function loadData(options, setDefaultValues, loadChart, loadFooter) {
      return Database.selectRoutes(options)
        .then(checkIfEmpty)
        .then(Database.selectPoints)
        .then(transformToRoutesAndDistances)
        .then(setDefaultValues)
        .then(loadChart)
        .then(loadStats)
        .then(loadLatestRoute)
        .then(loadFooter);
    }

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
      values.cal = 'Such wow, many';
      deferred.resolve(values);
      return deferred.promise;
    }

    function loadLatestRoute(values) {
      var deferred = $q.defer();
      if (values.routes.length < 1) {
        deferred.resolve(values);
        return deferred.promise;
      }
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
        distance += Helper.getDistance(
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
  }
})();
