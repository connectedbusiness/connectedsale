/**
 * @author Connected Business
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
  'text!template/15.0.1/settings/discount/discount.tpl.html',
  'js/libs/mobile-range-slider.js',
  'js/libs/ui.checkswitch.min.js',
], function($, $$, _, Backbone, Global, Service, Method, PreferenceCollection, template) {
  var saleSlider, itemSlider;
  var DiscountSettings = Backbone.View.extend({
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
      this.$("#settings-discount").trigger("create");
      this.RenderRangeSlider(this.preferenceCollection.at(0));
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

    hasChanged: function(model) {
      var changed = model.changedAttributes();

      console.log(changed);
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
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.RequestError(error, "Error Saving Discount Preference");
          }
        });
      }
    },

    SaveCompleted: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.trigger("SaveCompleted", this);
    },

    ToggleCheckboxes: function() {
      var self = this;
      var _settings = this.preferenceCollection.at(0);
      var _booleanSettings = ["AllowSaleDiscount", "AllowItemDiscount"];
      _.each(_booleanSettings,
        function(setting) {
          var elementID = "#" + setting;
          var chk = CheckSwitch(elementID);

          switch (setting) {
            case "AllowSaleDiscount":
              this.allowSaleDiscount = chk;
              break;
            case "AllowItemDiscount":
              this.allowItemDiscount = chk;
              break;
          }

          if (_settings.get(setting)) {
            chk.on();
            $(elementID + "-max").removeClass('ui-disabled');
          } else {
            chk.off();
            $(elementID + "-max").addClass('ui-disabled');
          }

          if (setting === "AllowSaleDiscount" || setting === "AllowItemDiscount") {
            chk.bind({
              'checkSwitch:on': function(ev) {
                self.DisableMaxRangeSlider(ev.checkSwitch);
              },
              'checkSwitch:off': function(ev) {
                self.DisableMaxRangeSlider(ev.checkSwitch);
              }
            });
          }
        });
    },

    DisableMaxRangeSlider: function(checkSwitch) {
      switch (checkSwitch.id) {
        case "AllowSaleDiscount":
          if (!allowSaleDiscount.getState()) {
            $("#" + checkSwitch.id + "-max").addClass('ui-disabled');
          } else {
            $("#" + checkSwitch.id + "-max").removeClass('ui-disabled');
          }
          break;
        case "AllowItemDiscount":
          if (!allowItemDiscount.getState()) {
            $("#" + checkSwitch.id + "-max").addClass('ui-disabled');
          } else {
            $("#" + checkSwitch.id + "-max").removeClass('ui-disabled');
          }
          break;
      }
    },

    ResetPreferenceCollection: function(preferences) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.preferenceCollection.reset(preferences);
      this.InitializeDisplay();
    },

    UpdatePreference: function() {
      var _settings = this.preferenceCollection.at(0);
      var _discount = ["AllowSaleDiscount", "AllowItemDiscount"];
      _.each(_discount, function(discount) {
        var _checked = false;
        switch (discount) {
          case "AllowSaleDiscount":
            _checked = this.allowSaleDiscount.getState();
            _settings.set({
              AllowSaleDiscount: _checked
            });
            break;
          case "AllowItemDiscount":
            _checked = this.allowItemDiscount.getState();
            _settings.set({
              AllowItemDiscount: _checked
            });
            break;
        }
      });
      this.preferenceCollection.reset(_settings);
    },

    RenderRangeSlider: function(collection) {

      saleSlider = new MobileRangeSlider('maxSale-Slider', {
        value: collection.get("MaxSaleDiscount"),
        min: 0,
        max: 100,
        change: function(percent) {
          value = percent;
          $("#maxSale").text(percent + "%");
          collection.set({
            MaxSaleDiscount: percent
          });
        }
      });

      itemSlider = new MobileRangeSlider('maxItem-Slider', {
        value: collection.get("MaxItemDiscount"),
        min: 0,
        max: 100,
        change: function(percent) {
          value = percent;
          $("#maxItem").text(percent + "%");
          collection.set({
            MaxItemDiscount: percent
          });
        }
      });

    }
  });
  return DiscountSettings;
});
