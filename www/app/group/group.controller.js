(function() {
  'use strict';

  angular
    .module('app.group')
    .controller('GroupController', Controller);

  Controller.$inject = ['$scope', '$ionicPopup'];

  /* @ngInject */
  function Controller($scope, $ionicPopup) {
    var vm = this;

    vm.type = 'school';
    vm.schools = [{
      nr: 1,
      school: 'HoGent',
      km: '324,5'
    }, {
      nr: 2,
      school: 'uGent',
      km: '302,8'
    }, {
      nr: 3,
      school: 'Artevelde',
      km: '267,1'
    }, {
      nr: 4,
      school: 'Odisee',
      km: '120,4'
    }, {
      nr: 5,
      school: 'Luca',
      km: '103,9'
    }];

    vm.isActive = isActive;
    vm.goToSchool = goToSchool;
    vm.goToFaculty = goToFaculty;
    vm.goToAssociation = goToAssociation;
    vm.unsubscribe = unsubscribe;
    vm.subscribe = subscribe;

    function goToSchool() {
      vm.type = 'school';
    }

    function goToFaculty() {
      vm.type = 'faculty';
    }

    function goToAssociation() {
      vm.type = 'association';
    }

    function isActive(value) {
      return vm.type === value;
    }

    function unsubscribe() {
      //CHECK IF USER IS ALREADY SUBSCRIBED TO SCHOOL/FACULTY/ASSOCIATIONS
      //IF USER IS SUBSCRIBED, ASK THEM IF THEY ARE SURE THEY WANT TO UNSUBSCRIBE
      //IF USER ISN'T SUBSCRIBED, TELL THEM THEY CAN'T UNSUBSCRIBE
      $scope.unsubscribeTest = 'test';
      var popup = $ionicPopup.show({
        scope: $scope,
        title: 'Uitschrijven',
        subTitle: 'Ben je zeker dat je volgende groep wenst te verlaten?',
        template: '<p>{{unsubscribeTest}}</p>',
        buttons: [
          {
            text: 'Nee',
            onTap: function() {
              return;
            }
          }, {
            text: '<b>Ja</b>',
            type: 'button-royal',
            onTap: function() {

            }
          }
        ]
      });

      popup.then(function() {

      });
    }

    function subscribe() {
      //CHECK IF USER IS ALREADY SUBSCRIBED TO SCHOOL/FACULTY/ASSOCIATIONS
      //IF USER IS SUBSCRIBED, TELL THEM THEY CAN'T SUBSCRIBE FOR MULTIPLE GROUPS (EXCEPT ASSOCIATIONS)
      //IF USER ISN'T SUBSCRIBED YET, GET POSSIBLE SCHOOLS/FACULTIES/ASSOCIATIONS TO SUBSCRIBE TO
      //SHOW GROUPS IN POPUP
      $scope.test = {
        schools: [
          {
            id: 1,
            name: 'HoGent'
          },
          {
            id: 2,
            name: 'uGent'
          },
          {
            id: 3,
            name: 'Artevelde'
          }
        ],
        result: null
      };
      var popup = $ionicPopup.show({
        scope: $scope,
        template:
          '<label for="repeatSelect"> Repeat select: </label>' +
          '<select name="repeatSelect" ng-model="test.result">' +
          '<option ng-repeat="test in test.schools" value="{{test.id}}">{{test.name}}</option>' +
          '</select>',
        title: 'Inschrijven',
        subTitle: 'Kies de groep waar je je wenst bij aan te sluiten.',
        buttons: [{
          text: 'Annuleer',
          onTap: function() {
            return;
          }
        }, {
          text: '<b>Kies</b>',
          type: 'button-royal',
          onTap: function() {
            console.log($scope.result);
            return $scope.result;
          }
        }]
      });

      popup.then(function(res) {
        console.log(res);
      });
    }
  }
})();
