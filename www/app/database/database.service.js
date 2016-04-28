(function() {
  'use strict';

  angular
    .module('database')
    .service('Database', ['$q', '$cordovaSQLite', function($q, $cordovaSQLite) {

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
        var deferred = $q.defer();
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
            deferred.resolve();
          }, function(err) {
            console.error(err);
            deferred.reject();
            return true;
          });
        }
        return deferred.promise;
      }

      function deleteReminders() {
        var deferred = $q.defer();
        var query = 'DELETE FROM reminders';
        $cordovaSQLite.execute(db, query).then(function() {
          console.log('DELETE REMINDER ID -> ');
          deferred.resolve();
        }, function(err) {
          console.error(err);
          deferred.reject();
          return true;
        });
        return deferred.promise;
      }

      //NOT IN USE
      function insertReminder(reminder) {
        var deferred = $q.defer();
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
          deferred.resolve();
        }, function(err) {
          console.error(err);
          deferred.reject();
          return true;
        });
        return deferred.promise;
      }

      //NOT IN USE
      function deleteReminder(reminder) {
        var deferred = $q.defer();
        var query = 'DELETE FROM reminders WHERE id = ?';
        $cordovaSQLite.execute(db, query, [
          reminder.id
        ]).then(function() {
          console.log('DELETE REMINDER ID -> ' + reminder.id);
          deferred.resolve();
        }, function(err) {
          console.error(err);
          deferred.reject();
          return true;
        });
        return deferred.promise;
      }

      function selectReminders() {
        var deferred = $q.defer();
        var query = 'SELECT * FROM reminders';
        var reminders = [];
        $cordovaSQLite.execute(db, query).then(function(result) {
          if (result.rows.length > 0) {
            for (var i = 0; i < result.rows.length; i++) {
              reminders.push(result.rows.item(i));
            }
            deferred.resolve(reminders);
          } else {
            deferred.reject();
            console.log('No reminders found');
          }
        }, function(err) {
          deferred.reject();
          console.error(err);
        });
        return deferred.promise;
      }

      function insertPoint(routeId, point) {
        var deferred = $q.defer();
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
          deferred.resolve();
          console.log('INSERT POINT ID -> ' + result.insertId);
        }, function(err) {
          deferred.reject();
          console.error(err);
          return true;
        });
        return deferred.promise;
      }

      function sentRoute(route) {
        var deferred = $q.defer();
        var query = 'UPDATE routes SET sent = 1 WHERE id = ?';
        $cordovaSQLite.execute(db, query, [
          route.id,
        ]).then(function(result) {
          deferred.resolve();
          console.log('SENT ROUTE -> ' + result.insertId);
        }, function(err) {
          deferred.reject();
          console.error(err);
          return true;
        });
        return deferred.promise;
      }

      function insertRoute(route) {
        var deferred = $q.defer();
        if (route.length < 1) {
          deferred.reject();
          console.error('Can\'t store route, it is empty');
          return deferred.promise;
        }
        var point = route[route.length - 1];
        var query = 'INSERT INTO routes (time, sent)' +
          'VALUES (?, ?)';
        $cordovaSQLite.execute(db, query, [point.time, false]).then(function(result) {
          var promises = [];
          console.log('INSERT ROUTE ID -> ' + result.insertId +
            ' TIME -> ' + result.time);
          for (var i = 0; i < route.length; i++) {
            promises.push(insertPoint(result.insertId, route[i]));
          }
          $q.all(promises).then(function(value) {
            deferred.resolve(value);
          }, function(reason) {
            deferred.reject(reason);
          });
        }, function(reason) {
          deferred.reject(reason);
          console.error(reason);
          return true;
        });
        return deferred.promise;
      }

      function selectRoutes(options) {
        var deferred = $q.defer();
        var query = 'SELECT id, time, sent FROM routes';
        var routes = [];
        $cordovaSQLite.execute(db, query)
          .then(function(result) {
            if (result.rows.length < 1) {
              deferred.resolve([]);
              return deferred.promise;
            }
            for (var i = 0; i < result.rows.length; i++) {
              //console.log('Route ' + i + '=' + result.rows.item(i));
              var route = result.rows.item(i);
              var date = new Date(route.time);
              if (!options) { // NO OPTIONS = RETURN ALL ROUTES
                routes.push(route);
              } else if (options.day && options.month && options.year) { // OPTIONS.DATE = RETURN ALL ROUTES WITH A GIVEN DATE
                if (options.year === date.getYear() &&
                  options.month === date.getMonth() &&
                  options.day === date.getDate()) {
                  routes.push(route);
                }
              } else if (options.day) { // OPTIONS.DAY = RETURN ALL ROUTES WITH A GIVEN DAY
                if (options.day === date.getDate()) {
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
              } else if (options.notSent) {
                console.log('Trying to find routes that haven\'t been sent yet');
                if (route.sent === 'false') {
                  routes.push(route);
                }
              }
            }
            deferred.resolve({
              routes: routes,
              message: options.message
            });
          }, function(reason) {
            deferred.reject(reason);
            console.error(reason);
          });
        return deferred.promise;
      }

      function selectPoints(routeIds) {
        var deferred = $q.defer();
        if (Object.prototype.toString.call(routeIds) !== '[object Array]' ||
          routeIds.length < 1) {
          console.log('Need at least one route id to query for points');
          deferred.resolve([]);
          return deferred.promise;
        }
        var ids = routeIds.reduce(function(previousValue) {
          return previousValue += '?, ';
        }, '(').slice(0, -2) + ')';
        var query = 'SELECT routeId, lat AS latitude, lng AS longitude,' +
          ' time FROM points WHERE routeId IN ' + ids;
        console.log('query = ' + query);
        var points = [];
        $cordovaSQLite.execute(db, query, routeIds).then(function(result) {
          if (result.rows.length > 0) {
            for (var i = 0; i < result.rows.length; i++) {
              /*console.log('SELECTED -> ' +
                'lat: ' + result.rows.item(i).lat +
                'lng: ' + result.rows.item(i).lng);*/
              points.push(result.rows.item(i));
            }
            deferred.resolve(points);
          } else {
            deferred.reject('No points found');
            console.log('No points found');
          }
        }, function(err) {
          deferred.reject(err);
          console.error(err);
        });
        return deferred.promise;
      }

    }]);
})();
