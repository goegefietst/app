(function() {
  'use strict';

  angular
    .module('app.tracker')
    .service('Popup', PopupService);

  PopupService.$inject = [
    '$ionicPopup', '$window'
  ];

  function PopupService($ionicPopup, $window) {

    PopupService.PERMISSION = 0;
    PopupService.LOCATION = 1;
    PopupService.ACCURACY = 2;
    PopupService.STOPPED = 3;

    this.showPermission = function() {
      return showPopup(PopupService.PERMISSION);
    };
    this.showLocation = function() {
      return showPopup(PopupService.LOCATION);
    };
    this.showAccuracy = function() {
      return showPopup(PopupService.ACCURACY);
    };
    this.showStopped = function() {
      return showPopup(PopupService.STOPPED);
    };

    var texts = [// jscs:disable maximumLineLength
      '<p>We kunnen enkel je route tracken als je toestemming geeft tot je locatie.</p>',
      '<p>We kunnen enkel je route tracken als je locatie aan staat.</p>',
      '<p>Je resultaten zullen nauwkeuriger zijn als je locatie op de grootste nauwkeurigheid staat.</p>',
      '<p>Het tracken van je rit is automatisch gestopt omdat je lange tijd stil stond.</p>'
    ];// jscs:enable maximumLineLength

    var titles = [
      'Locatie toestemming',
      'Locatie',
      'Nauwkeurigheid',
      'Gestopt'
    ];

    var buttonCancel = {
      text: 'Annuleer'
    };

    var buttonPermission = {
      text: '<b>Instellingen</b>',
      type: 'button-royal',
      onTap: function() {
        //FIXME OPEN WHICHEVER SETTINGS POINT TO APP LOCATION PERMISSIONS
        if ($window.localStorage.getItem('platform') === 'Android') {
          cordova.plugins.diagnostic.switchToLocationSettings();
        } else {
          cordova.plugins.diagnostic.switchToSettings();
        }
        return true;
      }
    };

    var buttonLocation = {
      text: '<b>Instellingen</b>',
      type: 'button-royal',
      onTap: function() {
        if ($window.localStorage.getItem('platform') === 'Android') {
          cordova.plugins.diagnostic.switchToLocationSettings();
        } else {
          cordova.plugins.diagnostic.switchToSettings();
        }
        return true;
      }
    };

    var buttonConfirm = {
      text: '<b>Ok</b>',
      type: 'button-royal'
    };

    var buttons = [
      [buttonCancel, buttonPermission],
      [buttonCancel, buttonLocation],
      [buttonCancel, buttonLocation],
      [buttonConfirm]
    ];

    function showPopup(type) {
      return $ionicPopup.show({
        template: texts[type],
        title: titles[type],
        buttons: buttons[type]
      });
    }
  }
})();
