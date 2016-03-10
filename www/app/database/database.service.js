(function() {
  'use strict';

  angular
    .module('database')
    .factory('Database', ['$cordovaSQLite', function($cordovaSQLite) {
      var insertPoint = function(routeId, point) {
        var query = 'INSERT INTO points ' +
          '(routeId, lat, lng, alt, acc, speed, time)' +
          ' VALUES (?, ?, ?, ?, ?, ?, ?)';
        $cordovaSQLite.execute(db, query, [
          routeId,
          point.latitude,
          point.longitude,
          point.altitude,
          point.accuracy,
          point.speed,
          point.time
        ]).then(function(result) {
          console.log('INSERT POINT ID -> ' + result.insertId);
        }, function(err) {
          console.error(err);
          return true;
        });
      };

      var insertRoute = function(route) {
        var query = 'INSERT INTO routes DEFAULT VALUES';
        $cordovaSQLite.execute(db, query).then(function(result) {
          console.log('INSERT ROUTE ID -> ' + result.insertId);
          for (var i = 0; i < route.length; i++) {
            insertPoint(result.insertId, route[i]);
          }
        }, function(err) {
          console.error(err);
          return true;
        });
      };

      var selectPoints = function() {
        var query = 'SELECT lat, lng FROM points';
        $cordovaSQLite.execute(db, query).then(function(result) {
          if (result.rows.length > 0) {
            for (var i = 0; i < result.rows.length; i++) {
              console.log('SELECTED -> ' +
                'lat: ' + result.rows.item(i).lat +
                'lng: ' + result.rows.item(i).lng);
            }
          } else {
            console.log('No results found');
          }
        }, function(err) {
          console.error(err);
        });
      };

      return {
        insert: insertRoute,
        select: selectPoints
      };

    }]);
})();
