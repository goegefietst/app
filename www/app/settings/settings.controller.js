(function() {
  'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', Controller);

  Controller.$inject = []; //dependencies

  /* @ngInject */
  function Controller(dependencies) {
    var vm = this;

    activate();

    function activate() {

    }

    vm.showDelete = false;
    vm.masterCheck = true;
    vm.testReminders = [
      {
        check: true,
        days: 'every day',
        time: '7:20'
      },{
        check: false,
        days: 'Saterday',
        time: '12:00'
      }
    ];
    vm.test = function test() {
      console.log('test add');
    }


  }
})();
