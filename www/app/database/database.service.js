(function() {
  'use strict';

  angular
    .module('database')
    .service('Database', ['$cordovaSQLite', function($cordovaSQLite) {

      this.insertReminders = insertReminders;
      this.deleteReminders = deleteReminders;
      this.insertReminder = insertReminder;
      this.deleteReminder = deleteReminder;
      this.selectReminders = selectReminders;
      this.insertPoint = insertPoint;
      this.insertRoute = insertRoute;
      this.selectRoutes = selectRoutes;
      this.selectPoints = selectPoints;
      this.sentRoute = sentRoute;

      function insertReminders(reminders) {
        var query = 'INSERT OR REPLACE INTO reminders ' +
          '(id, active, hour, minutes, mon, tue, wed, thu, fri, sat, sun)' +
          ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        for (var i = 0; i < reminders.length; i++) {
          $cordovaSQLite.execute(db, query, [
            reminders[i].id,
            reminders[i].active,
            reminders[i].hour,
            reminders[i].minutes,
            reminders[i].days[0],
            reminders[i].days[1],
            reminders[i].days[2],
            reminders[i].days[3],
            reminders[i].days[4],
            reminders[i].days[5],
            reminders[i].days[6]
          ]).then(function(result) {
            console.log('INSERT REMINDER ID -> ' + result.insertId);
          }, function(err) {
            console.error(err);
            return true;
          });
        }
      }

      function deleteReminders(callback) {
        var query = 'DELETE FROM reminders';
        $cordovaSQLite.execute(db, query).then(function() {
          console.log('DELETE REMINDER ID -> ');
          callback();
        }, function(err) {
          console.error(err);
          return true;
        });
      }

      function insertReminder(reminder) {
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
      }

      function deleteReminder(reminder) {
        var query = 'DELETE FROM reminders WHERE id = ?';
        $cordovaSQLite.execute(db, query, [
          reminder.id
        ]).then(function() {
          console.log('DELETE REMINDER ID -> ' + reminder.id);
        }, function(err) {
          console.error(err);
          return true;
        });
      }

      function selectReminders(callback) {
        var query = 'SELECT * FROM reminders';
        var reminders = [];
        $cordovaSQLite.execute(db, query).then(function(result) {
          if (result.rows.length > 0) {
            for (var i = 0; i < result.rows.length; i++) {
              reminders.push(result.rows.item(i));
            }
            callback(reminders);
          } else {
            console.log('No reminders found');
          }
        }, function(err) {
          console.error(err);
        });
      }

      function insertPoint(routeId, point) {
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
      }

      function sentRoute(route) {
        var query = 'UPDATE routes SET sent = 1 WHERE id = ?';
        $cordovaSQLite.execute(db, query, [
          route.id,
        ]).then(function(result) {
          console.log('SENT ROUTE -> ' + result.insertId);
        }, function(err) {
          console.error(err);
          return true;
        });
      }

      function insertRoute(route) {
        if (route.length < 1) {
          console.error('Can\'t store route, it is empty');
          return;
        }
        var point = route[route.length - 1];
        var query = 'INSERT INTO routes (time, sent)' +
          'VALUES (?, ?)';
        $cordovaSQLite.execute(db, query, [point.time, false]).then(function(result) {
          console.log('INSERT ROUTE ID -> ' + result.insertId +
            ' TIME -> ' + result.time);
          for (var i = 0; i < route.length; i++) {
            insertPoint(result.insertId, route[i]);
          }
        }, function(err) {
          console.error(err);
          return true;
        });
      }

      function selectRoutes(callback, options) {
        var query = 'SELECT id, time, sent FROM routes';
        var routes = [];
        $cordovaSQLite.execute(db, query)
          .then(function(result) {
            if (result.rows.length > 0) {
              for (var i = 0; i < result.rows.length; i++) {
                //console.log('Route ' + i + '=' + result.rows.item(i));
                var route = result.rows.item(i);
                var date = new Date(route.time);
                if (!options) { // NO OPTIONS = RETURN ALL ROUTES
                  routes.push(route);
                } else if (options.day && options.month && options.year) { // OPTIONS.DATE = RETURN ALL ROUTES WITH A GIVEN DATE
                  if (options.year === date.getYear() &&
                    options.month === date.getMonth() &&
                    options.day === date.getDay()) {
                    routes.push(route);
                  }
                } else if (options.day) { // OPTIONS.DAY = RETURN ALL ROUTES WITH A GIVEN DAY
                  if (options.day === date.getDay()) {
                    routes.push(route);
                  }
                } else if (options.month && options.year) { // OPTIONS.MONTH = RETURN ALL ROUTES WITH A GIVEN MONTH AND YEAR
                  if (options.month === date.getMonth() &&
                    options.year === date.getYear()) {
                    routes.push(route);
                  }
                } else if (options.year) {
                  if (options.year === date.getYear()) {
                    routes.push(route);
                  }
                } else if (options.time) { // OPTIONS.TIME = RETURN ALL ROUTES IN LAST 7 DAYS
                  if (
                    Math.floor(
                      (new Date(options.time) - new Date(route.time)) /
                      (1000 * 60 * 60 * 24)) < 7
                  ) {
                    routes.push(route);
                  }
                } else if (options.sent) {
                  console.log('Trying to find routes that haven\'t been sent yet');
                  if (route.sent === 'false') {
                    routes.push(route);
                  }
                }
              }
              callback(routes, options.message);
            } else {
              console.log('No routes found');
            }
          }, function(err) {
            console.error(err);
          });
      }

      function selectPoints(callback, routeIds) {
        var query = 'SELECT routeId, lat AS latitude, lng AS longitude,' +
          ' time FROM points WHERE routeId IN ' + routeIds;
        console.log('query = ' + query);
        var points = [];
        $cordovaSQLite.execute(db, query).then(function(result) {
          if (result.rows.length > 0) {
            for (var i = 0; i < result.rows.length; i++) {
              /*console.log('SELECTED -> ' +
                'lat: ' + result.rows.item(i).lat +
                'lng: ' + result.rows.item(i).lng);*/
              points.push(result.rows.item(i));
            }
            callback(points);
          } else {
            console.log('No points found');
          }
        }, function(err) {
          console.error(err);
        });
      }

    }]);
})();
