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

    /**
    * @function
    * @name loadWeekChart
    * @memberof Stats.Week
    * @param {Object} values - object with distances and options for the chart.
    * @returns {Promise}
    */
    function loadWeekChart(values) {
      Helper.filterThisWeek(values);
      var deferred = $q.defer();
      var distances = values.distances;
      values.options = {
        scaleSteps: 6 + 1, //Extra step to start with 0
        scaleStepWidth: 1,
        scaleStartValue: 0,
        bezierCurve: false,
        animation: false,
        pointHitDetectionRadius: 0.1,
        multiTooltipTemplate: '<%= value.toFixed(2) %> km'
      };
      values.labels = ['', 'Maandag', 'Dinsdag', 'Woensdag',
        'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'
      ];
      values.series = ['Per dag', 'Cumulatief'];
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
  }
})();
