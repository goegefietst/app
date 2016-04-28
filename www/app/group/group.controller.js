(function() {
  'use strict';

  angular
    .module('app.group')
    .controller('GroupController', Controller);

  Controller.$inject = [];

  /* @ngInject */
  function Controller() {
    var vm = this;
    vm.schools = [
      {
        nr: 1,
        school: 'HoGent',
        km: '324,5'
      },
      {
        nr: 2,
        school: 'uGent',
        km: '302,8'
      },
      {
        nr: 3,
        school: 'Artevelde',
        km: '267,1'
      },
      {
        nr: 4,
        school: 'Odisee',
        km: '120,4'
      },
      {
        nr: 5,
        school: 'Luca',
        km: '103,9'
      }
    ];
  }
})();
