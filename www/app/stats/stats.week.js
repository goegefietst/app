(function() {
  'use strict';

  angular
    .module('stats')
    .service('Week', Stats);

  Stats.$inject = ['$q', 'Helper'];

  /* @ngInject */
  /**
  * @class
  * @name Week
  * @memberof Stats
  * @description Service that loads week chart & footer.
  */
  function Stats($q, Helper) {
    this.loadChart = loadWeekChart;
    this.loadFooter = loadWeekFooter;
    this.setDefaultValues = setDefaultValues;

    /**
    * @function
    * @name loadWeekChart
    * @memberof Stats.Week
    * @param {Object} values - object with distances and options for the chart.
    * @returns {Promise}
    */
    function loadWeekChart(values) {
      var deferred = $q.defer();
      if (values.distances === undefined || values.distances.length < 1) {
        deferred.resolve(values);
        return deferred.promise;
      }
      Helper.filterThisWeek(values);
      var distances = values.distances;
      var data = [0, 0, 0, 0, 0, 0, 0];
      var today = Helper.mondayFirstDay(new Date().getDay());
      for (var j = 0; j < distances.length; j++) {
        var day = Helper.mondayFirstDay(new Date(distances[j].time).getDay());
        data[day] += distances[j].distance;
      }
      data = Helper.trim(data, today);
      var dataZeroStart = Helper.addZeroStart(data);
      values.data = [dataZeroStart, Helper.cumulative(dataZeroStart)];
      deferred.resolve(values);
      return deferred.promise;
    }

    /**
    * @function
    * @name loadWeekFooter
    * @memberof Stats.Week
    * @param {Object} values - object with distances and value for the footer.
    * @returns {Promise}
    */
    function loadWeekFooter(values) {
      var deferred = $q.defer();
      values.footer = Helper.getWeek(new Date());
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
      values.calDiff = 0;
      values.options = {
        scaleLabel: function(obj) {
          return ' ' + obj.value;
        },
        scaleSteps: 6 + 1, //Extra step to start with 0
        scaleStepWidth: 1,
        scaleStartValue: 0,
        bezierCurve: false,
        animation: false,
        pointHitDetectionRadius: 0.1,
        tooltipTemplate: function(obj) {
          return obj.value.toFixed(2) + ' km';
        },
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
      values.labels = ['', 'Maandag', 'Dinsdag', 'Woensdag',
        'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'
      ];
      values.series = ['Per dag', 'Cumulatief'];
      var data = [0, 0, 0, 0, 0, 0, 0];
      var today = Helper.mondayFirstDay(new Date().getDay());
      data = Helper.trim(data, today + 1);
      var dataZeroStart = Helper.addZeroStart(data);
      values.data = [dataZeroStart, Helper.cumulative(dataZeroStart)];
      deferred.resolve(values);
      return deferred.promise;
    }
  }
})();
