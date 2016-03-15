var db;

(function() {
  'use strict';

  angular
    .module('database', ['ngCordova'])
    .run(function($ionicPlatform, $cordovaSQLite) {
      $ionicPlatform.ready(function() {
        /*if (window.cordova) {
          db = $cordovaSQLite.openDB({
            name: 'goegefietst.db'
          });
        } else {
          db = window.openDatabase('goegefietst.db',
            '1', 'goegefietst', 1024 * 1024 * 100);
        }*/
        db = $cordovaSQLite.openDB('goegefietst.db');
        $cordovaSQLite.execute(db,
          'CREATE TABLE IF NOT EXISTS points ' +
          '(id integer primary key, routeId integer, lat real, lng real, ' +
          'alt decimal, acc real, speed real, time integer)');
        $cordovaSQLite.execute(db,
          'CREATE TABLE IF NOT EXISTS routes ' +
          '(id integer primary key, time integer)');
        $cordovaSQLite.execute(db,
          'CREATE TABLE IF NOT EXISTS reminders ' +
          '(id integer primary key, active integer,' +
          ' hour integer, minutes integer,' +
          ' mon integer, tue integer, wed integer, thu integer, fri integer' +
          ', sat integer, sun integer)'
        );
      });
    });
})();
