/**
 * Connected Business | 06-27-2012
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'collection/preferences',
  'text!template/15.0.1/settings/signature/signature.tpl.html',
  'js/libs/ui.checkswitch.min.js',
], function($, $$, _, Backbone, Global, Service, Method, PreferenceCollection, template) {
  var GeneralSettingsView = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      this.render();
    },

    render: function() {
      this.FetchPreference();
    },

    InitializeDisplay: function() {
      this.preferenceCollection.at(0).set({
        AllowCouponSearch: Global.Preference.AllowCouponSearch
      })
      this.$el.html(this._template(this.preferenceCollection.at(0).toJSON()));
      this.ToggleCheckboxes();
      this.$("#settings-signature").trigger("create");
    },

    InitializePreferences: function() {
      //this is the collection that holds the entire POSPreferenceGroup
      if (!this.preferences) {
        this.preferences = new PreferenceCollection();
      }
    },

    InitializePreferenceCollection: function() {
      if (!this.preferenceCollection) {
        this.preferenceCollection = new PreferenceCollection();
      }
    },

    FetchPreference: function() {
      var self = this;
      this.InitializePreferences();
      this.InitializePreferenceCollection();
      this.preferences.url = Global.ServiceUrl + Service.POS + Method.GETPREFERENCEBYWORKSTATION + Global.POSWorkstationID;
      this.preferences.fetch({
        success: function(collection, response) {
          self.ResetPreferenceCollection(response.Preference);
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Retrieving Workstation Preference");
        }
      });
    },

    ResetPreferenceCollection: function(preferences) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.preferenceCollection.reset(preferences);
      this.InitializeDisplay();
    },

    ToggleCheckboxes: function() {
      var _settings = this.preferenceCollection.at(0);
      var _booleanSettings = ["RequireSignatureOnCheck", "RequireSignatureOnCreditCard", "RequireSignatureOnOpenAccount", "RequireSignatureOnOrder"];
      _.each(_booleanSettings,
        function(setting) {
          var elementID = "#" + setting;
          var chk = CheckSwitch(elementID);

          switch (setting) {
            case "RequireSignatureOnCheck":
              this.requireSignatureOnCheck = chk;
              break;
            case "RequireSignatureOnCreditCard":
              this.requireSignatureOnCreditCard = chk;
              break;
            case "RequireSignatureOnOpenAccount":
              this.requireSignatureOnOpenAccount = chk;
              break;
            case "RequireSignatureOnOrder":
              this.requireSignatureOnOrder = chk;
              break;
          }

          if (_settings.get(setting)) {
            chk.on();
          } else {
            chk.off();
          }
        });
    },

    Save: function() {
      if (!this.preferenceCollection || this.preferenceCollection.length === 0 || !this.preferences || this.preferences.length === 0) {
        return;
      } else {
        this.UpdateCollection();
        var _self = this;
        var _preferenceModel = this.preferences.at(0)
        _preferenceModel.set({
          Preference: this.preferenceCollection.at(0)
        })
        _preferenceModel.url = Global.ServiceUrl + Service.POS + Method.UPDATEPREFERENCE;
        _preferenceModel.save(null, {
          success: function(model, response) {
            _self.SaveCompleted()
          },
          error: function(model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.RequestError(error, "Error Updating Signature Preference");
          }
        });
      }
    },

    SaveCompleted: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.trigger("SaveCompleted", this);
    },

    UpdateCollection: function() {
      var _settings = this.preferenceCollection.at(0);
      var _booleanSettings = ["RequireSignatureOnCheck", "RequireSignatureOnCreditCard", "RequireSignatureOnOpenAccount", "RequireSignatureOnOrder"];
      _.each(_booleanSettings,
        function(setting) {
          var _checked = false;
          switch (setting) {
            case "RequireSignatureOnCheck":
              _checked = this.requireSignatureOnCheck.getState();
              _settings.set({
                RequireSignatureOnCheck: _checked
              });
              break;
            case "RequireSignatureOnCreditCard":
              _checked = this.requireSignatureOnCreditCard.getState();
              _settings.set({
                RequireSignatureOnCreditCard: _checked
              });
              break;
            case "RequireSignatureOnOpenAccount":
              _checked = this.requireSignatureOnOpenAccount.getState();
              _settings.set({
                RequireSignatureOnOpenAccount: _checked
              });
              break;
            case "RequireSignatureOnOrder":
              _checked = this.requireSignatureOnOrder.getState();
              _settings.set({
                RequireSignatureOnOrder: _checked
              });
              break;
          }
        });
      this.preferenceCollection.reset(_settings);
    }
  });
  return GeneralSettingsView;
});
