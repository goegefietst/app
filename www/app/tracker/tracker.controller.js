(function() {
  'use strict';

  angular
    .module('app.tracker')
    .controller('TrackerController', Controller);

  Controller.$inject = ['$scope', '$http', 'leafletData', 'BackgroundGeolocationService']; //dependencies

  /* @ngInject */
  function Controller($scope, $http, leafletData, BackgroundGeolocationService) {
    var vm = this;
    BackgroundGeolocationService.subscribe($scope, function dataUpdated() {
      console.log('Data updated!');
      vm.drawRoute(BackgroundGeolocationService.locations);
    });
    angular.extend($scope, {
      defaults: { //todo: check configurations
        touchZoom: true,
        scrollWheelZoom: true
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
      paths: {}
    });

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

      var lastPoint = routes.latlngs[0][routes.latlngs[0].length - 1];
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
