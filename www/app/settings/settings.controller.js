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
    vm.templatePopup = '<ion-list><ion-checkbox ng-model="data.monday">maandag</ion-checkbox><ion-checkbox ng-model="data.tuesday">dinsdag</ion-checkbox><ion-checkbox ng-model="data.wednesday">woensdag</ion-checkbox><ion-checkbox ng-model="data.thursday">donderdag</ion-checkbox><ion-checkbox ng-model="data.friday">vrijdag</ion-checkbox><ion-checkbox ng-model="data.saturday">zaterdag</ion-checkbox><ion-checkbox ng-model="data.sunday">zondag</ion-checkbox></ion-list>';
    vm.testReminders = [{
      check: true,
      days: ["maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag","zondag"],
      time: {
        hours: '7',
        minutes: '20'
      }
    }, {
      check: false,
      days: ["maandag","dinsdag","woensdag","donderdag","vrijdag"],
      time: {
        hours: '12',
        minutes: '00'
      }
    }, {
      check: false,
      days: ["zaterdag","zondag"],
      time: {
        hours: '16',
        minutes: '45'
      }
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
        console.log(time.getUTCMinutes());
        vm.selectedTime.hours = time.getUTCHours();
        if(time.getUTCMinutes() == 0){
          console.log('true');
          vm.selectedTime.minutes = "00";
        } else {
          console.log('false');
          vm.selectedTime.minutes = time.getUTCMinutes();
        }
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

      $scope.data = {}

      // An elaborate, custom popup
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
        }, ]
      });
      myPopup.then(function(res) {
        if(res != undefined){
          vm.testReminders.push({
            check: true,
            days: res,
            time: vm.selectedTime
          });
        };
        vm.selectedTime = {};
      });
    };

    vm.onItemDelete = function onItemDelete(reminder) {
      vm.testReminders.splice(vm.testReminders.indexOf(reminder), 1);
      if (vm.testReminders.length == 0) {
        vm.showDelete = false;
      }
    };

    vm.onItemEdit = function onItemEdit(reminder) {
      console.log('test edit');
      console.log(reminder);

    };

    vm.mapDays = function mapDays(input) {
      var result = [];
      if(input.monday) {
        result.push("maandag");
      } if(input.tuesday) {
        result.push("dinsdag");
      } if(input.wednesday) {
        result.push("woensdag");
      } if(input.thursday) {
        result.push("donderdag");
      } if(input.friday) {
        result.push("vrijdag");
      } if(input.saturday) {
        result.push("zaterdag");
      } if(input.sunday){
        result.push("zondag");
      }
      return result;
    };
  }
})();
