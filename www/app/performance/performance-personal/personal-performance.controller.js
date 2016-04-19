(function() {
  'use strict';

  angular
    .module('app.performance')
    .controller('PersonalPerformanceController', Controller)
    .filter('msToTimeFilter', Filter);

  function Filter() {
    return function(duration) {
      var seconds = parseInt((duration / 1000) % 60);
      var minutes = parseInt((duration / (1000 * 60)) % 60);
      var hours = parseInt((duration / (1000 * 60 * 60)) % 24);

      hours = (hours < 10) ? '0' + hours : hours;
      minutes = (minutes < 10) ? '0' + minutes : minutes;
      seconds = (seconds < 10) ? '0' + seconds : seconds;

      return hours + ':' + minutes + ':' + seconds;
    };
  }

  Controller.$inject = ['Stats']; //dependencies

  /* @ngInject */
  function Controller(Stats) {
    var vm = this;

    vm.timespan = 'day';
    vm.chartData = 'distance';
    vm.footer = '';

    vm.dis = '0.0';
    vm.tim = 0;
    vm.spe = '0.0';
    vm.cal = '0';
    vm.new = {
      dis: 0,
      tim: 0,
      spe: 0
    };

    //CHANGE BETWEEN DAY, WEEK OR YEAR STATISTICS
    vm.isActive = isActive;
    vm.goToDay = goToDay;
    vm.goToWeek = goToWeek;
    vm.goToYear = goToYear;

    //CURRENTLY NOT USED
    vm.goToDistance = goToDistance;
    vm.goToTime = goToTime;
    vm.goToSpeed = goToSpeed;
    vm.goToCalories = goToCalories;
    vm.goToPrevious = goToPrevious;
    vm.goToNext = goToNext;

    //DEFAULT
    vm.goToDay();

    function goToDay() {
      vm.timespan = 'day';
      loadStats(vm.timespan);
      console.log('test timespan changed to ' + vm.timespan);
    }

    function goToWeek() {
      vm.timespan = 'week';
      loadStats(vm.timespan);
      console.log('test timespan changed to ' + vm.timespan);
    }

    function goToYear() {
      vm.timespan = 'year';
      loadStats(vm.timespan);
      console.log('test timespan changed to ' + vm.timespan);
    }

    function goToDistance() {
      //change chart data to distance
      vm.chartData = 'distance';
      console.log('test chartData changed to ' + vm.chartData);
    }

    function goToTime() {
      //change chart data to time
      vm.chartData = 'time';
      console.log('test chartData changed to ' + vm.chartData);
    }

    function goToSpeed() {
      //change chart data to speed
      vm.chartData = 'speed';
      console.log('test chartData changed to ' + vm.chartData);
    }

    function goToCalories() {
      //change chart data to calories
      vm.chartData = 'calories';
      console.log('test chartData changed to ' + vm.chartData);
    }

    function goToPrevious() {
      //select the previous day/week/year
      console.log('test previous was clicked');
    }

    function goToNext() {
      //select the next day/week/year
      console.log('test next was clicked');
    }

    function isActive(value) {
      return vm.timespan === value;
    }

    function loadStats(timespan) {
      resetStats();
      Stats.loadFor(timespan).then(function(values) {
        vm.dis = values.dis;
        vm.tim = values.tim;
        vm.spe = values.spe;
        vm.cal = values.cal;
        vm.new.dis = values.disDiff;
        vm.new.tim = values.timDiff;
        vm.new.spe = values.speDiff;
        vm.data = values.data;
        vm.labels = values.labels;
        vm.series = values.series;
        vm.options = values.options;
        vm.footer = values.footer;
      });
    }

    function resetStats() {
      vm.dis = '0.0';
      vm.tim = 0;
      vm.spe = '0.0';
      vm.cal = '0';
      vm.new.dis = 0;
      vm.new.tim = 0;
      vm.new.spe = 0;
      vm.data = [];
      vm.labels = [];
      vm.series = [];
      vm.options = [];
    }

  }
})();
