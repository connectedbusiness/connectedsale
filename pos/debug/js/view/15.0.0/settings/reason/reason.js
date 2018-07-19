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
  'text!template/15.0.0/settings/reason/reason.tpl.html',
  'js/libs/ui.checkswitch.min.js',
], function($, $$, _, Backbone, Global, Method, Service, PreferenceCollection, template) {
  var ReasonSettingsView = Backbone.View.extend({
    _template: _.template(template),
    initialize: function() {
      this.render();
    },

    render: function() {
      this.FetchPreference();
    },

    InitializeDisplay: function() {
      this.$el.html(this._template(this.preferenceCollection.at(0).toJSON()));
      this.ToggleCheckboxes();
      this.$("#settings-reason").trigger("create");
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

    Save: function() {
      if (!this.preferenceCollection || this.preferenceCollection.length === 0 || !this.preferences || this.preferences.length === 0) {
        return;
      } else {
        this.UpdatePreference();
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
            model.RequestError(error, "Error Saving Reason Code Preference");
          }
        });
      }
    },

    SaveCompleted: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.trigger("SaveCompleted", this);
    },

    ToggleCheckboxes: function() {
      var _settings = this.preferenceCollection.at(0);
      var _booleanSettings = ["IsReasonDiscount", "IsReasonTransactionVoid", "IsReasonItemVoid", "IsReasonReturns"];
      _.each(_booleanSettings,
        function(setting) {
          var elementID = "#" + setting;
          var chk = CheckSwitch(elementID);

          switch (setting) {
            case "IsReasonDiscount":
              this.isReasonDiscount = chk;
              break;
            case "IsReasonTransactionVoid":
              this.isReasonTransactionVoid = chk;
              break;
            case "IsReasonItemVoid":
              this.isReasonItemVoid = chk;
              break;
            case "IsReasonReturns":
              this.isReasonReturns = chk;
              break;
          }

          if (_settings.get(setting)) {
            chk.on();
          } else {
            chk.off();
          }
        });
    },

    UpdatePreference: function() {
      var _settings = this.preferenceCollection.at(0);
      var _reasonCodes = ["IsReasonDiscount", "IsReasonReturns", "IsReasonItemVoid", "IsReasonTransactionVoid"];
      _.each(_reasonCodes, function(reason) {
        var _checked = false;
        switch (reason) {
          case "IsReasonDiscount":
            _checked = this.isReasonDiscount.getState();
            _settings.set({
              IsReasonDiscount: _checked
            });
            break;
          case "IsReasonReturns":
            _checked = this.isReasonReturns.getState();
            _settings.set({
              IsReasonReturns: _checked
            });
            break;
          case "IsReasonItemVoid":
            _checked = this.isReasonItemVoid.getState();
            _settings.set({
              IsReasonItemVoid: _checked
            });
            break;
          case "IsReasonTransactionVoid":
            _checked = this.isReasonTransactionVoid.getState();
            _settings.set({
              IsReasonTransactionVoid: _checked
            });
            break;
        }
      });
      this.preferenceCollection.reset(_settings);
    }

  });
  return ReasonSettingsView;
});
