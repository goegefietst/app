(function() {
  'use strict';

  angular
    .module('app.tracker')
    .controller('TrackerController', Controller);
  //dependencies
  Controller.$inject = ['$scope', '$http', '$window', 'leafletData', 'BackgroundGeolocationService', 'Database'];

  /* @ngInject */
  function Controller($scope,
    $http,
    $window,
    leafletData,
    BackgroundGeolocationService,
    Database) {
    var vm = this;
    vm.tracking = false;
    vm.stopwatch = {
      hours: '00',
      minutes: '00',
      seconds: '00'
    };
    vm.distance = 0.0;
    vm.speed = 0.0;

    var timestamp;
    var running = false;

    BackgroundGeolocationService.subscribe($scope, function dataUpdated() {
      console.log('Data updated!');
      var latlngs = [];
      var locations = BackgroundGeolocationService.getLocations();
      var lastPoint;
      var secondLastPoint;

      for (var i = 0; i < locations.length; i++) {
        var point = locations[i];
        latlngs.push([point.latitude, point.longitude]);
      }

      if (locations.length === 1) {
        lastPoint = locations[(locations.length - 1)];
      }

      if (locations.length > 1) {
        lastPoint = locations[(locations.length - 1)];
        secondLastPoint = locations[(locations.length - 2)];
        vm.distance = getDistance(secondLastPoint.latitude,
          secondLastPoint.longitude,
          lastPoint.latitude,
          lastPoint.longitude).fixed(1);
      }

      var duration = (parseInt(vm.stopwatch.hours) * 3600000) +
      (parseInt(vm.stopwatch.minutes) * 60000) +
      (parseInt(vm.stopwatch.seconds) * 1000);

      console.log(duration);
      vm.speed = vm.distance / duration;
      console.log(vm.speed);
      vm.drawRoute(latlngs);
    });
    angular.extend($scope, {
      defaults: { //todo: check configurations
        touchZoom: true,
        scrollWheelZoom: true,
        zoomControl: false,
      },
      gent: {
        lat: 51.050,
        lng: 3.733,
        zoom: 10
      },
      tiles: {
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: {
          attribution: '&copy; <a href="http://www.openstreetmap.org/' +
            'copyright">OpenStreetMap</a> contributors'
        }
      },
      markers: [],
      paths: {},
      height: ($window.innerHeight - 105) / 1.6
    });

    vm.toggle = function toggle() {
      if (!vm.tracking) {
        console.log('app starts vm.tracking');
        BackgroundGeolocationService.start();
        vm.startStopwatch();
        vm.tracking = true;
      } else {
        console.log('app stops vm.tracking');
        var route = BackgroundGeolocationService.stop();
        console.log(route);
        vm.tracking = false;
        vm.stopStopwatch();
        Database.insertRoute(route);
      }
    };

    vm.startStopwatch = function startStopwatch() {
      var now = new Date();
      timestamp = now.getTime();
      running = true;
      timecounter();
    };

    vm.stopStopwatch = function stopStopwatch() {
      running = false;
      console.log('User tracked for ' +
      vm.stopwatch.hours + ':' +
      vm.stopwatch.minutes + ':' +
      vm.stopwatch.seconds);
      vm.stopwatch.hours = '00';
      vm.stopwatch.minutes = '00';
      vm.stopwatch.seconds = '00';
    };

    function timecounter() {
      var now = new Date();
      var timediff = now.getTime() - timestamp;
      if (running === true) {
        var time = formattedtime(timediff);
        vm.stopwatch.hours = time.hours;
        vm.stopwatch.minutes = time.minutes;
        vm.stopwatch.seconds = time.seconds;
        console.log(vm.stopwatch.hours + ':' + vm.stopwatch.minutes + ':' + vm.stopwatch.seconds);

        setTimeout(function() {
          timecounter();
          $scope.$apply();
        }, 1000);

      }
    }

    function formattedtime(unformattedtime) {
      var second = Math.floor(unformattedtime / 1000);
      var minute = Math.floor(unformattedtime / 60000);
      var hour = Math.floor(unformattedtime / 3600000);
      second = second - 60 * minute - 24 * hour;
      minute = minute - 24 * hour;

      second = second > 9 ? '' + second : '0' + second;
      minute = minute > 9 ? '' + minute : '0' + minute;
      hour = hour > 9 ? '' + hour : '0' + hour;

      return {
        hours: hour,
        minutes: minute,
        seconds: second
      };
    }

    vm.loadRoute = function() {
      $http.get('route.geo.json').success(function(data, status) {
        if (status !== 200) {
          console.log('Something went wrong, status code: ' + status);
        }
        angular.extend($scope, {
          geojson: {
            data: data,
            style: {
              color: 'red',
              weight: 4,
              opacity: 0.5
            }
          }
        });
        var coordinates = data.features[0].geometry.coordinates;
        vm.addMarker({
          lng: coordinates[coordinates.length - 1][0],
          lat: coordinates[coordinates.length - 1][1]
        });
      });
    };

    vm.clearRoutes = function() {
      $scope.paths = {};
    };

    vm.clearMarkers = function() {
      $scope.markers = [];
    };

    vm.addMarker = function(latlng) {
      $scope.markers.push({
        lat: latlng.lat,
        lng: latlng.lng
      });
    };

    vm.setView = function(latlng) {
      leafletData.getMap('map').then(
        function(map) {
          map.setView(latlng);
        }
      );
    };

    vm.drawRoutes = function(routes) {
      vm.clearRoutes();
      vm.clearMarkers();

      routes.type = 'multiPolyline';
      routes.weight = 4;
      routes.color = 'red';
      routes.opacity = 0.5;
      $scope.paths.multiPolyline = routes;

      var lastPoint = routes.latlngs[routes.latlngs[0].length - 1];

      vm.addMarker(lastPoint);
      vm.setView(lastPoint);
    };

    vm.drawRoute = function(route) {
      if (!route) {
        return;
      }

      vm.clearRoutes();
      vm.clearMarkers();

      var path = {
        type: 'polyline',
        weight: 4,
        color: 'red',
        opacity: 0.5,
        latlngs: route
        //latlngs: [[51.050, 3.733], [52.050, 4.733]]
      };
      $scope.paths.path = path;

      if (route.length > 0) {
        var lastPoint = {
          lat: route[route.length - 1][0],
          lng: route[route.length - 1][1]
        };
        vm.addMarker(lastPoint);
        vm.setView(lastPoint);
      }
    };

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

    //vm.drawRoute('test');
    //vm.loadRoute();
    //vm.drawRoutes(routes);
  }
})();
