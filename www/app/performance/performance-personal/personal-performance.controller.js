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
