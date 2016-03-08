(function() {
    'use strict';

    angular
      .module('app.settings', ['ionic-timepicker'])
      .controller('SettingsController', Controller);

    Controller.$inject = ['$ionicPopup', '$scope']; //dependencies

    /* @ngInject */
    function Controller($ionicPopup, $scope) {
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
        $scope.data = {}

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
          template: '<ion-list><ion-checkbox ng-model="data.monday">Maandag</ion-checkbox><ion-checkbox ng-model="data.tuesday">Dinsdag</ion-checkbox><ion-checkbox ng-model="data.wednesday">Woensdag</ion-checkbox><ion-checkbox ng-model="data.thursday">Donderdag</ion-checkbox><ion-checkbox ng-model="data.friday">Vrijdag</ion-checkbox><ion-checkbox ng-model="data.saturday">Zaterdag</ion-checkbox><ion-checkbox ng-model="data.sunday">Zondag</ion-checkbox></ion-list>',
          title: 'Kies de dag(en)',
          scope: $scope,
          buttons: [
            { text: 'Annuleer' },
            {
              text: '<b>Kies</b>',
              type: 'button-positive',
              onTap: function(e) {
                if (!$scope.data.monday &&
                      !$scope.data.tuesday &&
                      !$scope.data.wednesday &&
                      !$scope.data.thursday &&
                      !$scope.data.friday &&
                      !$scope.data.saturday &&
                      !$scope.data.sunday) {
                  //don't allow the user to close unless he enters wifi password
                  e.preventDefault();
                } else {
                  return $scope.data;
                }
              }
            },
          ]
        });
        myPopup.then(function(res) {
          console.log(res);
        });
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
