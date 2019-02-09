/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/method',
  'shared/service',
  'collection/preferences',
  'text!template/19.1.0/settings/misc/misc.tpl.html',
  'js/libs/ui.checkswitch.min.js',
], function($, $$, _, Backbone, Global, Method, Service, PreferenceCollection, template) {
  var MiscSettingsView = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      this.render();
    },

    render: function() {
      this.InitializeAllowBlindClose();
      this.FetchPreference();
    },
    InitializeAllowBlindClose: function() {
      Global.trackDrawerBalanceState = Global.TrackDrawerBalance;
      if (Global.Preference.BlindClose == true && Global.TrackDrawerBalance == true) {
        Global.IsOnLoad = false;
      } else {
        Global.IsOnLoad = true;
      }
    },
    InitializeDisplay: function() {
      this.$el.html(this._template(this.preferenceCollection.at(0).toJSON()));
      this.ToggleCheckboxes();
      this.$("#settings-misc").trigger("create");

    },

    FetchPreference: function() {
      if (!this.preferenceCollection) {
        this.preferenceCollection = new PreferenceCollection();
      }
      var self = this;
      this.preferenceCollection.url = Global.ServiceUrl + Service.POS + Method.GETPREFERENCEBYWORKSTATION + Global.POSWorkstationID;
      this.preferenceCollection.fetch({
        success: function(collection, response) {
          self.ResetPreferenceCollection(response.Preference);
        }
      });
    },

    ResetPreferenceCollection: function(preferences) {
      this.preferenceCollection.reset(preferences);
      this.InitializeDisplay();

    },

    Save: function() {
      if (!this.preferenceCollection) {
        return;
      } else {
        this.UpdatePreference();
        var _self = this;
        var _settings = this.preferenceCollection.at(0);
        _settings.url = Global.ServiceUrl + Service.POS + Method.UPDATEPREFERENCE;
        _settings.save(null, {
          success: function(model, response) {
            _self.SaveCompleted()
          }
        });
      }
    },

    SaveCompleted: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.trigger("SaveCompleted", this);
    },

    ToggleCheckboxes: function() {
      var _self = this;
      var _settings = this.preferenceCollection.at(0);
      var _booleanSettings = ["AutoSignOutUser", "TrackDrawerBalance", "BlindClose", "UseCashDrawer"];
      _.each(_booleanSettings,
        function(setting) {
          var elementID = "#" + setting;
          var chk = CheckSwitch(elementID);
          switch (setting) {
            case "AutoSignOutUser":
              this.autoSignOutUser = chk;
              break;
            case "TrackDrawerBalance":
              this.trackDrawerBalance = chk;
              break;
            case "BlindClose":
              this.blindClose = chk;
              break;
            case "UseCashDrawer":
              this.useCashDrawer = chk;
              break;
          }

          if (_settings.get(setting)) {
            chk.on();
            $("#BlindClose-li").removeClass('ui-disabled');

          } else {
            chk.off();
            $("#BlindClose-li").addClass('ui-disabled');
          }

          if (setting === "TrackDrawerBalance") {
            chk.bind({
              'checkSwitch:on': function(ev) {
                Global.trackDrawerBalanceState = true;
                _self.DisableBlindClose();
                _self.trackDrawerBalance_change(true);
              },
              'checkSwitch:off': function(ev) {
                Global.trackDrawerBalanceState = false;
                _self.DisableBlindClose();
                _self.trackDrawerBalance_change(false)

              }
            });
          }
          if (setting === "BlindClose") {
            chk.bind({
              'checkSwitch:off': function(ev) {
                _self.AllowBlindClose();
              }
            });
          }
        });
    },
    AllowBlindClose: function() {
      if (Global.trackDrawerBalanceState == true && Global.AdministratorRole == false && Global.IsOnLoad == false && Global.Preference.BlindClose == true) {
        $("#BlindClose-container > h1 > span").removeClass('ui_check_switch_off').addClass('ui_check_switch_on');
        $("#BlindClose-container > h1 > span .ui_check_switch_slider").css("margin-left", "0px");
        $("#BlindClose").attr("checked", true);
        navigator.notification.alert("You are not authorized to change this setting.", null, "Action Not Allowed", "OK");
      }
      Global.IsOnLoad = false;
    },

    DisableBlindClose: function(checkSwitch) {
      if (!trackDrawerBalance.getState()) {
        $("#BlindClose-li").addClass('ui-disabled');
        $("#BlindClose").attr("checked", false);
        $("#BlindClose-container > h1 > span").removeClass('ui_check_switch_on').addClass('ui_check_switch_off');
        $("#BlindClose-container > h1 > span .ui_check_switch_slider").css("margin-left", "-50px");
      } else {
        $("#BlindClose-li").removeClass('ui-disabled');
        if (Global.AdministratorRole == false && Global.Preference.BlindClose == true) {
          $("#BlindClose-container > h1 > span").removeClass('ui_check_switch_off').addClass('ui_check_switch_on');
          $("#BlindClose-container > h1 > span .ui_check_switch_slider").css("margin-left", "0px");
          $("#BlindClose").attr("checked", true);
        }
      }
    },
    UpdatePreference: function() {
      var _settings = this.preferenceCollection.at(0);
      var _misc = ["AutoSignOutUser", "TrackDrawerBalance", "BlindClose", "UseCashDrawer"];
      _.each(_misc, function(misc) {
        var _checked = false;

        switch (misc) {
          case "AutoSignOutUser":
            _checked = this.autoSignOutUser.getState();
            _settings.set({
              AutoSignOutUser: _checked
            });
            break;
          case "TrackDrawerBalance":
            _checked = this.trackDrawerBalance.getState();
            _settings.set({
              TrackDrawerBalance: _checked
            });
            Global.TrackDrawerBalance = _checked;
            break;
          case "BlindClose":
            _checked = this.blindClose.getState();
            _settings.set({
              BlindClose: _checked
            })
            Global.Preference.BlindClose = _checked;
            break;
          case "UseCashDrawer":
            _checked = this.useCashDrawer.getState();
            _settings.set({
              UseCashDrawer: _checked
            });
            break;
        }

      });
      this.preferenceCollection.reset(_settings);
    },

    trackDrawerBalance_change: function(checked) {
      if (Global.Preference.TrackDrawerBalance && Global.Status.IsOpen && !checked) {
        Global.PromptCloseWorkstation = true;
        var _errorMessage = "Warning! This workstation is still open, you'll be asked to close this workstation after you save your changes.";
        console.log(_errorMessage);
        navigator.notification.alert(_errorMessage, null, "Workstation Still Open", "OK");
      } else {
        Global.PromptCloseWorkstation = false;
      }
    }
  });
  return MiscSettingsView;
});
