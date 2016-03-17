(function() {
  'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', Controller);

  Controller.$inject = ['$ionicPopup', '$scope', 'Database']; //dependencies

  /* @ngInject */
  function Controller($ionicPopup, $scope, Database) {
    var vm = this;

    vm.reminders = [];

    activate();

    function activate() {
      //FOR TESTING PURPOSES
      /*Database.insertReminder({
        id: 0,
        active: true,
        hour: 11,
        minutes: 55,
        days: [true, true, true, true, true, true, true]
      });
      Database.deleteReminder({
        id: 0
      });
      Database.selectReminders(log);*/
      Database.insertRoute([{
        latitude: 66,
        longitude: 66,
        altitude: 123,
        accuracy: 10,
        speed: 5.5,
        time: Date.now() - 4 * 60 * 60 * 1000
      }, {
        latitude: 45,
        longitude: 45,
        altitude: 124,
        accuracy: 10,
        speed: 5.0,
        time: Date.now() - 3 * 60 * 60 * 1000
      }]);
      Database.insertRoute([{
        latitude: 66,
        longitude: 66,
        altitude: 123,
        accuracy: 10,
        speed: 5.5,
        time: Date.now() - 1 * 60 * 60 * 1000
      }, {
        latitude: 45,
        longitude: 45,
        altitude: 124,
        accuracy: 10,
        speed: 5.0,
        time: Date.now()
      }]);
      /*Database.selectRoutes(log, {day: 2, message: 'BY DAY'});
      Database.selectRoutes(log, {day: 2, month: 2, year: year(2016), message: 'BY DATE'});
      Database.selectRoutes(log, {month: 2, year: year(2016), message: 'BY MONTH AND YEAR'});
      Database.selectRoutes(log, {time: 1458046159000, message: 'BY TIME'});*/
      //Database.selectPoints(log, 5);
    }

    Database.selectReminders(map);

    function map(object) {
      for (var i = 0; i < object.length; i++) {
        var days = [];
        days.push(object[i].mon === 'true');
        days.push(object[i].tue === 'true');
        days.push(object[i].wed === 'true');
        days.push(object[i].thu === 'true');
        days.push(object[i].fri === 'true');
        days.push(object[i].sat === 'true');
        days.push(object[i].sun === 'true');

        console.log(format(object[i].hour));
        console.log(format(object[i].minutes));
        var reminder = {
          id: object[i].id,
          active: object[i].active === 'true',
          hour: format(object[i].hour),
          minutes: format(object[i].minutes),
          days: days,
          daysString: vm.daysToString(days)
        };
        vm.reminders.push(reminder);
      }
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
        vm.selectedTime.minutes = time.getUTCMinutes();
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
        }]
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
            active: true,
            hour: format(vm.selectedTime.hours),
            minutes: format(vm.selectedTime.minutes),
            days: res,
            daysString: vm.daysToString(res)
          };
          if (vm.masterCheck) {
            vm.configureNotification(newReminder);
          }

          //add notification to db
          vm.reminders.push(newReminder);
          Database.insertReminder({
            id: newReminder.id,
            active: newReminder.active,
            hour: parseInt(vm.selectedTime.hours),
            minutes: parseInt(vm.selectedTime.minutes),
            days: [res[0], res[1], res[2], res[3], res[4], res[5], res[6]]
          });
        } else {
          //user didn't select one or more days of the week
          console.log('User didn\'t select any days of the week');
        }
        vm.selectedTime = {};
      });
    };

    vm.configureNotification = function configureNotification(reminder) {
      if (reminder.active) {
        //configure notification with id
        for (var j = 0; j < reminder.days.length; j++) {
          if (reminder.days[j]) {
            var result =
              vm.returnDateObject(reminder.hour, reminder.minutes, j);
            console.log(result);
            cordova.plugins.notification.local.schedule({
              id: reminder.id,
              text: 'Vergeet niet je route te tracken!',
              at: result,
              every: 'week',
            });
          }
        }
      }
    };

    vm.onItemDelete = function onItemDelete(reminder) {
      vm.reminders.splice(vm.reminders.indexOf(reminder), 1);
      Database.deleteReminder(reminder);
      vm.cancelNotification(reminder);
      if (vm.reminders.length === 0) {
        vm.showDelete = false;
      }
      Database.selectReminders(function(object) {
        console.log(object);
      });
    };

    vm.onItemEdit = function onItemEdit(reminder) {
      //TO DO
    };

    vm.toggleReminder = function toggleReminder(reminder) {
      if (reminder.active) {
        console.log(reminder.active);
        vm.configureNotification(reminder);
      } else {
        console.log(reminder.active);
        vm.cancelNotification(reminder);
      }
    };

    vm.toggleMasterCheck = function toggleMasterCheck() {
      if (vm.masterCheck) {
        for (var i = 0; i < vm.reminders.length; i++) {
          var reminder = vm.reminders[i];
          vm.configureNotification(reminder);
        }
        cordova.plugins.notification.local.getAllIds(function(ids) {
          console.log(ids);
        });
      } else {
        cordova.plugins.notification.local.cancelAll(function() {
          console.log('cancel all notifications');
        });
        cordova.plugins.notification.local.getAllIds(function(ids) {
          console.log(ids);
        });
      }
    };

    vm.cancelNotification = function cancelNotification(reminder) {
      cordova.plugins.notification.local.cancel(reminder.id, function() {
        console.log('cancel notification with id ' + reminder.id);
      });
    };

    function format(number) {
      return number > 9 ? '' + number : '0' + number;
    }

    vm.daysToString = function daysToString(days) {
      var daysString = [];
      for (var i = 0; i < days.length; i++) {
        if (days[i]) {
          switch (i) {
            case 0:
              daysString.push('ma');
              break;
            case 1:
              daysString.push('di');
              break;
            case 2:
              daysString.push('wo');
              break;
            case 3:
              daysString.push('do');
              break;
            case 4:
              daysString.push('vr');
              break;
            case 5:
              daysString.push('za');
              break;
            case 6:
              daysString.push('zo');
              break;
          }
        }
      }
      console.log(daysString);
      return daysString;
    };

    vm.mapDays = function mapDays(input) {
      var result = [];
      if (input.monday) {
        result.push(true);
      } else {
        result.push(false);
      }
      if (input.tuesday) {
        result.push(true);
      } else {
        result.push(false);
      }
      if (input.wednesday) {
        result.push(true);
      } else {
        result.push(false);
      }
      if (input.thursday) {
        result.push(true);
      } else {
        result.push(false);
      }
      if (input.friday) {
        result.push(true);
      } else {
        result.push(false);
      }
      if (input.saturday) {
        result.push(true);
      } else {
        result.push(false);
      }
      if (input.sunday) {
        result.push(true);
      } else {
        result.push(false);
      }
      return result;
    };

    vm.returnDateObject = function returnDateObject(hours, minutes, j) {
      var now = new Date();
      var result = new Date();
      var dayOfWeek = now.getDay();
      var date;

      if (j === 0) {
        date = now.getDate() + 8 - dayOfWeek;
      }
      if (j === 1) {
        date = now.getDate() + 9 - dayOfWeek;
      }
      if (j === 2) {
        date = now.getDate() + 10 - dayOfWeek;
      }
      if (j === 3) {
        date = now.getDate() + 11 - dayOfWeek;
      }
      if (j === 4) {
        date = now.getDate() + 12 - dayOfWeek;
      }
      if (j === 5) {
        date = now.getDate() + 13 - dayOfWeek;
      }
      if (j === 6) {
        date = now.getDate() + 14 - dayOfWeek;
      }
      var diff = (date - now.getDate());
      if (diff > 7) {
        date = date - 7;
      } else if (diff === 7) {
        if (parseInt(hours) > now.getHours()) {
          date = date - 7;
        } else if (parseInt(hours) === now.getHours()) {
          if (parseInt(minutes) > now.getMinutes()) {
            date = date - 7;
          }
        }
      }

      result.setDate(date);
      result.setHours(parseInt(hours));
      result.setMinutes(parseInt(minutes));
      result.setSeconds(0);

      return result;
    };
  }
})();
