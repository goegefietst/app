(function() {
  'use strict';

  angular
    .module('database')
    .factory('Database', ['$cordovaSQLite', function($cordovaSQLite) {

      var insertReminder = function(reminder) {
        var query = 'INSERT OR REPLACE INTO reminders ' +
          '(id, active, hour, minutes, mon, tue, wed, thu, fri, sat, sun)' +
          ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        $cordovaSQLite.execute(db, query, [
          reminder.id,
          reminder.active,
          reminder.hour,
          reminder.minutes,
          reminder.days[0],
          reminder.days[1],
          reminder.days[2],
          reminder.days[3],
          reminder.days[4],
          reminder.days[5],
          reminder.days[6]
        ]).then(function(result) {
          console.log('INSERT REMINDER ID -> ' + result.insertId);
        }, function(err) {
          console.error(err);
          return true;
        });
      };

      var deleteReminder = function(reminder) {
        var query = 'DELETE FROM reminders WHERE id = ?';
        $cordovaSQLite.execute(db, query, [
          reminder.id
        ]).then(function() {
          console.log('DELETE REMINDER ID -> ' + reminder.id);
        }, function(err) {
          console.error(err);
          return true;
        });
      };

      var selectReminders = function(callback) {
        var query = 'SELECT * FROM reminders';
        var reminders = [];
        $cordovaSQLite.execute(db, query).then(function(result) {
          if (result.rows.length > 0) {
            //console.log(result.rows.item(0));
            reminders.push(result.rows.item(0));
            callback(reminders);
          } else {
            console.log('No results found');
          }
        }, function(err) {
          console.error(err);
        });
      };

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

      var selectRoutes = function(callback) {
        var query = 'SELECT id FROM routes';
        var routes = [];
        $cordovaSQLite.execute(db, query).then(function(result) {
          if (result.rows.length > 0) {
            for (var i = 0; i < result.rows.length; i++) {
              //console.log('Route ' + i + '=' + result.rows.item(i));
              routes.push(result.rows.item(i));
            }
            callback(routes);
          } else {
            console.log('No results found');
          }
        }, function(err) {
          console.error(err);
        });
      };

      var selectPoints = function(callback, routeId) {
        var query = 'SELECT routeId, lat, lng FROM points WHERE routeId = ?';
        var points = [];
        $cordovaSQLite.execute(db, query, [routeId]).then(function(result) {
          if (result.rows.length > 0) {
            for (var i = 0; i < result.rows.length; i++) {
              /*console.log('SELECTED -> ' +
                'lat: ' + result.rows.item(i).lat +
                'lng: ' + result.rows.item(i).lng);*/
              points.push(result.rows.item(i));
            }
            callback(points);
          } else {
            console.log('No results found');
          }
        }, function(err) {
          console.error(err);
        });
      };

      return {
        selectPoints: selectPoints,
        insertRoute: insertRoute,
        selectRoutes: selectRoutes,
        insertReminder: insertReminder,
        deleteReminder: deleteReminder,
        selectReminders: selectReminders
      };

    }]);
})();
