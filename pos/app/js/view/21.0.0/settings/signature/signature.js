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
  'text!template/19.2.0/settings/signature/signature.tpl.html',
  'js/libs/ui.checkswitch.min.js',
], function($, $$, _, Backbone, Global, Service, Method, PreferenceCollection, template) {
  var GeneralSettingsView = Backbone.View.extend({
    _template: _.template(template),

    events:{
      "tap #RequireSignatureOnCheck, #RequireSignatureOnCreditCard, #RequireSignatureOnOpenAccount, #RequireSignatureOnOrder": "Chkbox_click"
    },

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

    Chkbox_click: function(e){      
      e.preventDefault();      
      var _elementID = '#' + e.currentTarget.id;
      var _chkState = this.GetCheckState(_elementID);      
      this.SetChkState(e.currentTarget.id, !_chkState);
    },

    GetCheckState: function(elementID){      
      return $(elementID).hasClass('icon-ok-sign') ? true : false;
    },

   ToggleCheckbox: function(elementID, chkState){      
      if (!chkState){
        $('#' + elementID).addClass("icon-circle-blank").css("color","#DADADA");
        $('#' + elementID).removeClass("icon-ok-sign");
      }else{
        $('#' + elementID).addClass("icon-ok-sign").css("color","");
        $('#' + elementID).removeClass("icon-circle-blank");      
      }       
    },

    SetChkState: function(setting, isCheked){
      var self = this;
      switch(setting){
        case "RequireSignatureOnCheck":
          self.requireSignatureOnCheck = isCheked;          
          break;  
        case "RequireSignatureOnCreditCard":
          self.requireSignatureOnCreditCard = isCheked;
          break;
        case "RequireSignatureOnOpenAccount":
          self.requireSignatureOnOpenAccount = isCheked;
          break;
        case "RequireSignatureOnOrder":
          self.requireSignatureOnOrder = isCheked;
          break;
      }
      self.ToggleCheckbox(setting, isCheked);
    },

    ResetPreferenceCollection: function(preferences) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.preferenceCollection.reset(preferences);
      this.InitializeDisplay();
    },

    ToggleCheckboxes: function() {
      var _self = this; 
      var _settings = _self.preferenceCollection.at(0);
      var _booleanSettings = ["RequireSignatureOnCheck", "RequireSignatureOnCreditCard", "RequireSignatureOnOpenAccount", "RequireSignatureOnOrder"];      
      _.each(_booleanSettings,
        function(setting) {
          var elementID = "#" + setting;
          // var chk = CheckSwitch(elementID);

          switch (setting) {
            case "RequireSignatureOnCheck":
              _self.requireSignatureOnCheck = _settings.attributes['RequireSignatureOnCheck'];
              break;
            case "RequireSignatureOnCreditCard":
              _self.requireSignatureOnCreditCard = _settings.attributes['RequireSignatureOnCreditCard'];
              break;
            case "RequireSignatureOnOpenAccount":
              _self.requireSignatureOnOpenAccount = _settings.attributes['RequireSignatureOnOpenAccount'];
              break;
            case "RequireSignatureOnOrder":
              _self.requireSignatureOnOrder = _settings.attributes['RequireSignatureOnOrder'];
              break;
          }

          if (_settings.get(setting)) {
            _self.SetChkState(setting, true);
          } else {
            _self.SetChkState(setting, false); 
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
      var self = this;
      var _settings = self.preferenceCollection.at(0);
      var _booleanSettings = ["RequireSignatureOnCheck", "RequireSignatureOnCreditCard", "RequireSignatureOnOpenAccount", "RequireSignatureOnOrder"];
      _.each(_booleanSettings,
        function(setting) {
          var _checked = false;
          switch (setting) {
            case "RequireSignatureOnCheck":
              _checked = self.requireSignatureOnCheck;
              _settings.set({
                RequireSignatureOnCheck: _checked
              });
              break;
            case "RequireSignatureOnCreditCard":
              _checked = self.requireSignatureOnCreditCard;
              _settings.set({
                RequireSignatureOnCreditCard: _checked
              });
              break;
            case "RequireSignatureOnOpenAccount":
              _checked = self.requireSignatureOnOpenAccount;
              _settings.set({
                RequireSignatureOnOpenAccount: _checked
              });
              break;
            case "RequireSignatureOnOrder":
              _checked = self.requireSignatureOnOrder;
              _settings.set({
                RequireSignatureOnOrder: _checked
              });
              break;
          }
        });
      self.preferenceCollection.reset(_settings);
    }
  });
  return GeneralSettingsView;
});
