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
    var cumulative = false; //whether to include cumulative in chart or not

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
      spe: 0,
      cal: 0
    };
    vm.data = [false, false, false];
    vm.labels = [false, false, false];
    vm.series = [false, false, false];
    vm.options = [false, false, false];

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
      loadStats(vm.timespan, 0);
      console.log('test timespan changed to ' + vm.timespan);
    }

    function goToWeek() {
      vm.timespan = 'week';
      loadStats(vm.timespan, 1);
      console.log('test timespan changed to ' + vm.timespan);
    }

    function goToYear() {
      vm.timespan = 'year';
      loadStats(vm.timespan, 2);
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

    function loadStats(timespan, index) {
      if (vm.data[index] && vm.labels[index] &&
        vm.series[index] && vm.options[index]) {
        return; //already loaded
      }
      resetStats(index);
      Stats.loadFor(timespan).then(function(values) {
        vm.dis = values.dis;
        vm.tim = values.tim;
        vm.spe = values.spe;
        vm.cal = values.cal;
        vm.new.dis = values.disDiff;
        vm.new.tim = values.timDiff;
        vm.new.spe = values.speDiff;
        vm.new.cal = values.calDiff;
        vm.data[index] = cumulative ? values.data : [values.data[0]];
        vm.labels[index] = values.labels;
        vm.series[index] = cumulative ? values.series : [values.series[0]];
        vm.options[index] = values.options;
        vm.footer = values.footer;
      });
    }

    function resetStats(index) {
      vm.dis = '0.0';
      vm.tim = 0;
      vm.spe = '0.0';
      vm.cal = '0';
      vm.new.dis = 0;
      vm.new.tim = 0;
      vm.new.spe = 0;
      vm.new.cal = 0;
      vm.data[index] = false;
      vm.labels[index] = false;
      vm.series[index] = false;
      vm.options[index] = false;
    }

  }
})();
