(function() {
  'use strict';

  angular
    .module('stats')
    .service('Year', Stats);

  Stats.$inject = ['$q', 'Helper'];

  /* @ngInject */
  function Stats($q, Helper) {
    this.loadChart = loadYearChart;
    this.loadFooter = loadYearFooter;

    function loadYearChart(values) {
      var deferred = $q.defer();
      var distances = values.distances;
      values.options = {
        scaleSteps: 11 + 1, //Extra step to start with 0
        scaleStepWidth: 1,
        scaleStartValue: 0,
        bezierCurve: false,
        animation: false,
        pointHitDetectionRadius: 0.1,
        multiTooltipTemplate: '<%= value.toFixed(2) %> km'
      };
      values.labels = [
        '', 'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli',
        'Augustus', 'September', 'Oktober', 'November', 'December'
      ];
      values.series = ['Per maand', 'Cumulatief'];
      var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (var j = 0; j < distances.length; j++) {
        var month = new Date(distances[j].time).getMonth();
        data[month] += distances[j].distance;
      }
      data = Helper.trim(data, new Date().getMonth());
      var dataZeroStart = Helper.addZeroStart(data);
      values.data = [dataZeroStart, Helper.cumulative(dataZeroStart)];
      deferred.resolve(values);
      return deferred.promise;
    }

    function loadYearFooter(values) {
      var deferred = $q.defer();
      values.footer = new Date().getFullYear();
      deferred.resolve(values);
      return deferred.promise;
    }
  }
})();
