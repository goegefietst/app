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
    vm.templatePopup =
      '<ion-list><ion-checkbox ng-model="data.monday">maandag</ion-checkbox>' +
      '<ion-checkbox ng-model="data.tuesday">dinsdag</ion-checkbox>' +
      '<ion-checkbox ng-model="data.wednesday">woensdag</ion-checkbox>' +
      '<ion-checkbox ng-model="data.thursday">donderdag</ion-checkbox>' +
      '<ion-checkbox ng-model="data.friday">vrijdag</ion-checkbox>' +
      '<ion-checkbox ng-model="data.saturday">zaterdag</ion-checkbox>' +
      '<ion-checkbox ng-model="data.sunday">zondag</ion-checkbox></ion-list>';

    vm.testReminders = [];

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
    };

    vm.timePickerCallback = function timePickerCallback(val) {
      if (typeof(val) === 'undefined') {
        console.log('User didn\'t select a time');
      } else {
        var time = new Date(val * 1000);
        vm.selectedTime.hours = time.getUTCHours();
        if (time.getUTCMinutes() === 0) {
          vm.selectedTime.minutes = '00';
        } else {
          vm.selectedTime.minutes = time.getUTCMinutes();
        }
        vm.add();
      }
    };

    vm.toggleDelete = function toggleDelete() {
      vm.showDelete = !vm.showDelete;
    };

    vm.toggleEdit = function toggleEdit() {
      vm.showEdit = !vm.showEdit;
    };

    vm.add = function add() {
      $scope.data = {};

      var myPopup = $ionicPopup.show({
        template: vm.templatePopup,
        title: 'Kies de dag(en)',
        scope: $scope,
        buttons: [{
          text: 'Annuleer'
        }, {
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
              return vm.mapDays($scope.data);
            }
          }
        },]
      });

      myPopup.then(function(res) {
        if (res !== undefined) {
          var ids = window.localStorage['counterIds'];
          if (ids === undefined) {
            ids = 1;
          } else {
            ids++;
          }
          window.localStorage['counterIds'] = ids;
          //user did select day/days
          var newReminder = {
            id: ids,
            check: true,
            days: res,
            time: vm.selectedTime
          };
          if (vm.masterCheck) {
            //configure notification with id
            vm.configureNotification(newReminder);
          }
          //add notification to db
          vm.testReminders.push(newReminder);

        } else {
          //user didn't select one or more days of the week
          console.log('User didn\'t select any days of the week');
        }
        vm.selectedTime = {};
      });
    };

    vm.configureNotification = function configureNotification(reminder) {

      for (var j = 0; j < reminder.days.length; j++) {
        var day = reminder.days[j];
        var result = vm.returnDateObject(reminder.time, day);
        cordova.plugins.notification.local.schedule({
          id: reminder.id,
          text: 'Vergeet niet je route te tracken!',
          firstAt: result,
          every: 'week',
        });
      }
    };

    vm.onItemDelete = function onItemDelete(reminder) {
      vm.testReminders.splice(vm.testReminders.indexOf(reminder), 1);
      if (vm.testReminders.length === 0) {
        vm.showDelete = false;
      }
    };

    vm.onItemEdit = function onItemEdit(reminder) {
      console.log('test edit');
      console.log(reminder);

    };

    vm.toggleReminder = function toggleReminder(reminder) {
      if (reminder.check) {
        vm.configureNotification(reminder);
      } else {
        vm.cancelNotification(reminder);
      }
    };

    vm.toggleMasterCheck = function toggleMasterCheck() {
      if (vm.masterCheck) {
        for (var i = 0; i < vm.testReminders.length; i++) {
          vm.configureNotification(vm.testReminders[i]);
        }
      } else {
        cordova.plugins.notification.local.cancelAll(function() {
          console.log('cancel all notifications');
        });
      }
    };

    vm.cancelNotification = function cancelNotification(reminder) {
      cordova.plugins.notification.local.cancel(reminder.id, function() {
        console.log('cancel notification with id ' + reminder.id);
      });
    };

    vm.mapDays = function mapDays(input) {
      var result = [];
      if (input.monday) {
        result.push('maandag');
      }
      if (input.tuesday) {
        result.push('dinsdag');
      }
      if (input.wednesday) {
        result.push('woensdag');
      }
      if (input.thursday) {
        result.push('donderdag');
      }
      if (input.friday) {
        result.push('vrijdag');
      }
      if (input.saturday) {
        result.push('zaterdag');
      }
      if (input.sunday) {
        result.push('zondag');
      }
      return result;
    };

    vm.returnDateObject = function returnDateObject(time, day) {
      var now = new Date();
      var result = new Date();
      var dayOfWeek = now.getDay();
      var date;

      if (day === 'maandag') {
        date = now.getDate() + 8 - dayOfWeek;
      }

      if (day === 'dinsdag') {
        date = now.getDate() + 9 - dayOfWeek;
      }

      if (day === 'woensdag') {
        date = now.getDate() + 10 - dayOfWeek;
      }

      if (day === 'donderdag') {
        date = now.getDate() + 11 - dayOfWeek;
      }

      if (day === 'vrijdag') {
        date = now.getDate() + 12 - dayOfWeek;
      }

      if (day === 'zaterdag') {
        date = now.getDate() + 13 - dayOfWeek;
      }

      if (day === 'zondag') {
        date = now.getDate() + 14 - dayOfWeek;
      }

      var diff = (date - now.getDate());
      if (diff > 7) {
        date = date - 7;
      } else if (diff === 7) {
        if (time.hours > now.getHours()) {
          date = date - 7;
        } else if (time.hours === now.getHours()) {
          if (time.minutes > now.getMinutes()) {
            date = date - 7;
          }
        }
      }

      result.setDate(date);
      result.setHours(time.hours);
      result.setMinutes(time.minutes);
      result.setSeconds(0);

      return result;
    };
  }
})();
