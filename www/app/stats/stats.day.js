(function() {
  'use strict';

  angular
    .module('stats')
    .service('Day', Stats);

  Stats.$inject = ['$q', 'Helper'];

  /* @ngInject */
  function Stats($q, Helper) {
    this.loadChart = loadDayChart;
    this.loadFooter = loadDayFooter;

    function loadDayChart(values) {
      var deferred = $q.defer();
      var distances = values.distances;
      values.options = {
        scaleSteps: 23,
        scaleStepWidth: 1,
        scaleStartValue: 0,
        bezierCurve: false,
        animation: false,
        pointHitDetectionRadius: 0.1,
        multiTooltipTemplate: '<%= value.toFixed(2) %> km'
      };
      values.labels = [];
      for (var i = 0; i < 24; i++) {
        values.labels.push(
          Helper.format(i) + ':' + Helper.format(0)
        );
      }
      values.series = ['Per uur', 'Cumulatief'];
      var data = [
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0
      ];
      if (distances !== undefined) {
        for (var j = 0; j < distances.length; j++) {
          var hourMinutes = new Date(distances[j].time);
          var hour = hourMinutes.getHours();
          var minutes = hourMinutes.getMinutes();
          data[minutes > 29 ? hour + 1 : hour] += distances[j].distance;
        }
      }
      data = Helper.trim(data, new Date().getHours() + 1);
      values.data = [data, Helper.cumulative(data)];
      deferred.resolve(values);
      return deferred.promise;
    }

    function loadDayFooter(values) {
      var deferred = $q.defer();
      var date = new Date();
      values.footer =
        Helper.format(date.getDate()) + '/' +
        Helper.format(date.getMonth() + 1);
      deferred.resolve(values);
      return deferred.promise;
    }
  }
})();
