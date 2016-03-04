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

    vm.day = function day() {
      //change timespan to day
      console.log('test timespan changed to day');
    }

    vm.week = function week() {
      //change timespan to week
      console.log('test timespan changed to week');
    }

    vm.month = function month() {
      //change timespan to month
      console.log('test timespan changed to month');
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
