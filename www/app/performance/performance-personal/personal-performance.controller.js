(function() {
  'use strict';

  angular
    .module('app.performance')
    .controller('PersonalPerformanceController', Controller);

  Controller.$inject = []; //dependencies

  /* @ngInject */
  function Controller(dependencies) {
    var vm = this;

    activate();

    function activate() {

    }

    vm.timespan = 'day';
    vm.chartData = 'distance'

    vm.day = function day() {
      //change timespan to day
      vm.timespan = 'day';
      console.log('test timespan changed to ' + vm.timespan);
    }

    vm.week = function week() {
      //change timespan to week$
      vm.timespan = 'week';
      console.log('test timespan changed to ' + vm.timespan);
    }

    vm.month = function month() {
      //change timespan to month
      vm.timespan = 'month'
      console.log('test timespan changed to ' + vm.timespan);
    }

    vm.distance = function distance() {
      //change chart data to distance
      vm.chartData = 'distance';
      console.log('test chartData changed to ' + vm.chartData);
    }

    vm.time = function time() {
      //change chart data to time
      vm.chartData = 'time';
      console.log('test chartData changed to ' + vm.chartData);
    }

    vm.speed = function speed() {
      //change chart data to speed
      vm.chartData = 'speed';
      console.log('test chartData changed to ' + vm.chartData);
    }

    vm.calories = function calories() {
      //change chart data to calories
      vm.chartData = 'calories';
      console.log('test chartData changed to ' + vm.chartData);
    }

    vm.previous = function previous() {
      //select the previous day/week/year
      console.log('test previous was clicked');
    }

    vm.next = function next() {
      //select the next day/week/year
      console.log('test next was clicked')
    }
  }
})();
