(function() {
  'use strict';

  angular
    .module('app.settings', ['ionic-timepicker'])
    .controller('SettingsController', Controller);

  Controller.$inject = ['$ionicPopup']; //dependencies

  /* @ngInject */
  function Controller($ionicPopup) {
    var vm = this;

    activate();

    function activate() {

    }

    vm.showDelete = false;
    vm.showEdit = false;
    vm.masterCheck = true;
    vm.selectedTime = {};

    vm.testReminders = [{
      check: true,
      days: 'iedere dag',
      time: '7:20'
    }, {
      check: false,
      days: 'zaterdag',
      time: '12:00'
    }, {
      check: true,
      days: 'iedere dag',
      time: '12:30'
    }];

    vm.timePickerObject = {
      inputEpochTime: ((new Date()).getHours() * 60 * 60), //Optional
      step: 5, //Optional
      format: 24, //Optional
      titleLabel: 'Kies het uur', //Optional
      setLabel: 'Kies', //Optional
      closeLabel: 'Annuleer', //Optional
      setButtonType: 'button-positive', //Optional
      closeButtonType: 'button-stable', //Optional
      callback: function(val) { //Mandatory
        vm.timePickerCallback(val);
      }
    }

    vm.timePickerCallback = function timePickerCallback(val) {
      if (typeof(val) === 'undefined') {
        console.log('Time not selected');
        console.log(vm.selectedTime);
      } else {
        var time = new Date(val * 1000);
        vm.selectedTime.hours = time.getUTCHours();
        vm.selectedTime.minutes = time.getUTCMinutes();
        console.log(vm.selectedTime);
        vm.add();
      }
    }

    vm.toggleDelete = function toggleDelete() {
      if (vm.testReminders.length == 0) {
        vm.showDelete = false;
      } else {
        vm.showDelete = !vm.showDelete;
      }
    }

    vm.toggleEdit = function toggleEdit() {
      if (vm.testReminders.length == 0) {
        vm.showEdit = false;
      } else {
        vm.showEdit = !vm.showEdit;
      }
    }

    vm.add = function add() {

      console.log('test add');
      
      /*    vm.newReminder = {
            };
            var popup = $ionicPopup.show({
              title: 'Kies de dag(en)',
              template: '<ion-list><ion-checkbox ng-model="vm.newReminder.monday">Maandag</ion-checkbox><ion-checkbox ng-model="vm.newReminder.tuesday">Dinsdag</ion-checkbox><ion-checkbox ng-model="vm.newReminder.wednesday">Woensdag</ion-checkbox><ion-checkbox ng-model="vm.newReminder.thursday">Donderdag</ion-checkbox><ion-checkbox ng-model="vm.newReminder.friday">Vrijdag</ion-checkbox><ion-checkbox ng-model="vm.newReminder.saterday">Zaterdag</ion-checkbox><ion-checkbox ng-model="vm.newReminder.sunday">Zondag</ion-checkbox></ion-list>',
              buttons: [{
                text: 'Annuleer'
              }, {
                text: '<b>Volgende</b>',
                type: 'button-positive',
                onTap: function() {
                  console.log(vm.newReminder);
                  console.log(vm.newReminder.monday);
                  return vm.newReminder;
                }
              }, ]
            });
            popup.then(function(res) {
              console.log(res);
            });*/

    };

    vm.onItemDelete = function onItemDelete(reminder) {
      console.log('test delete');
      console.log(reminder);
      console.log(vm.testReminders.indexOf(reminder));
      vm.testReminders.splice(vm.testReminders.indexOf(reminder), 1);
      console.log(vm.testReminders.length);
      if (vm.testReminders.length == 0) {
        vm.showDelete = false;
      }
    }

    vm.onItemEdit = function onItemEdit(reminder) {
      console.log('test edit');
      console.log(reminder);

    }
  }
})();
