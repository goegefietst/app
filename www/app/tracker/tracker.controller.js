(function() {
  'use strict';

  angular
    .module('app.tracker')
    .controller('TrackerController', Controller);
  //dependencies
  Controller.$inject =
  ['$scope', '$http', '$window', 'leafletData', 'BackgroundGeolocationService', 'Database'];

  /* @ngInject */
  function Controller($scope,
    $http,
    $window,
    leafletData,
    BackgroundGeolocationService,
    Database) {
    var vm = this;
    vm.tracking = false;

    BackgroundGeolocationService.subscribe($scope, function dataUpdated() {
      console.log('Data updated!');

      var latlngs = [];
      for (var i = 0; i < BackgroundGeolocationService.locations.length; i++) {
        var point = BackgroundGeolocationService.locations[i];
        latlngs.push([point.latitude, point.longitude]);
      }
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
        console.log('app starts tracking');
        BackgroundGeolocationService.start();
        vm.tracking = true;
      } else {
        console.log('app stops tracking');
        var route = BackgroundGeolocationService.stop();
        console.log(route);
        vm.tracking = false;
        Database.insertRoute(route);
      }
    };

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

    //vm.drawRoute('test');
    //vm.loadRoute();
    //vm.drawRoutes(routes);
  }
})();
