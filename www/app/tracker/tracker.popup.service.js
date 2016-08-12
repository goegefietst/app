(function() {
  'use strict';

  angular
    .module('app.tracker')
    .service('Popup', PopupService);

  PopupService.$inject = [
    '$ionicPopup', '$window'
  ];

  /**
   * @ngdoc service
   * @name app.tracker.service:PopupService
   * @description
   * Service responsible for popups related to tracking.
   */
  function PopupService($ionicPopup, $window) {

    PopupService.PERMISSION = 0;
    PopupService.LOCATION = 1;
    PopupService.ACCURACY = 2;
    PopupService.STOPPED = 3;

    this.showPermission = showPermission;
    this.showLocation = showLocation;
    this.showAccuracy = showAccuracy;
    this.showStopped = showStopped;

    /**
     * @ngdoc method
     * @name showPermission
     * @methodOf app.tracker.service:PopupService
     * @description
     * Shows a popup to warn the user that location permission is needed.
     */
    function showPermission() {
      return showPopup(PopupService.PERMISSION);
    }

    /**
     * @ngdoc method
     * @name showLocation
     * @methodOf app.tracker.service:PopupService
     * @description
     * Shows a popup to warn the user that location needs to be enabled.
     */
    function showLocation() {
      return showPopup(PopupService.LOCATION);
    }

    /**
     * @ngdoc method
     * @name showAccuracy
     * @methodOf app.tracker.service:PopupService
     * @description
     * Shows a popup to warn the user that high accuracy mode is disabled.
     */
    function showAccuracy() {
      return showPopup(PopupService.ACCURACY);
    }

    /**
     * @ngdoc method
     * @name showStopped
     * @methodOf app.tracker.service:PopupService
     * @description
     * Shows a popup to warn the user that the previous session was stopped.
     */
    function showStopped() {
      return showPopup(PopupService.STOPPED);
    }

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

    /**
     * @ngdoc function
     * @name showPopup
     * @methodOf app.tracker.service:PopupService
     * @description
     * Shows a popup based on type<br/>
     * 0 Permission<br/>
     * 1 Location<br/>
     * 2 Accuracy<br/>
     * 3 Stopped<br/>
     * @param {Number} type type of popup
     */
    function showPopup(type) {
      return $ionicPopup.show({
        template: texts[type],
        title: titles[type],
        buttons: buttons[type]
      });
    }
  }
})();
