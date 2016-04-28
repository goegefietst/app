(function() {
  'use strict';

  angular
    .module('stats')
    .service('Year', Stats);

  Stats.$inject = ['$q', 'Helper'];

  /* @ngInject */
  /**
  * @class
  * @name Year
  * @memberof Stats
  * @description Service that loads year chart & footer.
  */
  function Stats($q, Helper) {
    this.loadChart = loadYearChart;
    this.loadFooter = loadYearFooter;
    this.setDefaultValues = setDefaultValues;

    /**
    * @function
    * @name loadYearChart
    * @memberof Stats.Year
    * @param {Object} values - object with distances and options for the chart.
    * @returns {Promise}
    */
    function loadYearChart(values) {
      var deferred = $q.defer();
      if (values.distances === undefined || values.distances.length < 1) {
        deferred.resolve(values);
        return deferred.promise;
      }
      var distances = values.distances;
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

    /**
    * @function
    * @name loadYearFooter
    * @memberof Stats.Year
    * @param {Object} values - object with distances and value for the footer.
    * @returns {Promise}
    */
    function loadYearFooter(values) {
      var deferred = $q.defer();
      values.footer = new Date().getFullYear();
      deferred.resolve(values);
      return deferred.promise;
    }

    function setDefaultValues(values) {
      var deferred = $q.defer();
      values.dis = '0.0';
      values.tim = 0;
      values.spe = '0.0';
      values.cal = '0';
      values.disDiff = 0;
      values.timDiff = 0;
      values.speDiff = 0;
      values.options = {
        scaleLabel: function(obj) {
          return ' ' + obj.value;
        },
        scaleSteps: 11 + 1, //Extra step to start with 0
        scaleStepWidth: 1,
        scaleStartValue: 0,
        bezierCurve: false,
        animation: false,
        pointHitDetectionRadius: 0.1,
        multiTooltipTemplate: function(obj) {
          return obj.value.toFixed(2) + ' km';
        },
        legendTemplate: function(obj) {
          var datasets = obj.datasets;
          var templ = '<ul class=\"line-legend\">';
          for (var i = 0; i < datasets.length; i++) {
            var color = datasets[i].strokeColor;
            var label = datasets[i].label ? datasets[i].label : '';
            templ +=
            '<li>' +
            '<span style=\"background-color:' + color + '\"></span> ' + label +
            '</li>';
          }
          return templ + '</ul>';
        }
      };
      values.labels = [
        '', 'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli',
        'Augustus', 'September', 'Oktober', 'November', 'December'
      ];
      values.series = ['Per maand', 'Cumulatief'];
      var data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      data = Helper.trim(data, new Date().getMonth() + 1);
      var dataZeroStart = Helper.addZeroStart(data);
      values.data = [dataZeroStart, Helper.cumulative(dataZeroStart)];
      deferred.resolve(values);
      return deferred.promise;
    }
  }
})();
