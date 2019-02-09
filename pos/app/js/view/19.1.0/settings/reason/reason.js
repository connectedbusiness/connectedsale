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
  'text!template/19.1.0/settings/reason/reason.tpl.html',
  'js/libs/ui.checkswitch.min.js',
], function($, $$, _, Backbone, Global, Method, Service, PreferenceCollection, template) {  
  var ReasonSettingsView = Backbone.View.extend({
    
    _template: _.template(template),

    events: {
      "tap #IsReasonDiscount, #IsReasonReturns, #IsReasonItemVoid, #IsReasonTransactionVoid": "Chkbox_click"

    },

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
      var _self = this;    
      var _settings = this.preferenceCollection.at(0);
      var _booleanSettings = ["IsReasonDiscount", "IsReasonTransactionVoid", "IsReasonItemVoid", "IsReasonReturns"];      
      _.each(_booleanSettings,
        function(setting) {
          var elementID = "#" + setting;
          switch (setting) {
            case "IsReasonDiscount":
              _self.isReasonDiscount = _settings.attributes['IsReasonDiscount'];
              break;
            case "IsReasonTransactionVoid":
              _self.isReasonTransactionVoid = _settings.attributes['IsReasonTransactionVoid'];
              break;
            case "IsReasonItemVoid":
              _self.isReasonItemVoid = _settings.attributes['IsReasonItemVoid'];
              break;
            case "IsReasonReturns":
              _self.isReasonReturns = _settings.attributes['IsReasonReturns'];
              break;
          }
          if (_settings.get(setting)) {
            _self.SetChkState(setting, true);            
          } else {
            _self.SetChkState(setting, false);            
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
        case "IsReasonDiscount":
          self.isReasonDiscount = isCheked;          
          break;  
        case "IsReasonTransactionVoid":
          self.isReasonTransactionVoid = isCheked;
          break;
        case "IsReasonItemVoid":
          self.isReasonItemVoid = isCheked;
          break;
        case "IsReasonReturns":
          self.isReasonReturns = isCheked;
          break;
      }
      self.ToggleCheckbox(setting, isCheked);
    },

    UpdatePreference: function() {
      var self = this;
      var _settings = self.preferenceCollection.at(0);
      var _reasonCodes = ["IsReasonDiscount", "IsReasonReturns", "IsReasonItemVoid", "IsReasonTransactionVoid"];
      _.each(_reasonCodes, function(reason) {
        var _checked = false;        
        switch (reason) {
          case "IsReasonDiscount":
            _checked = self.isReasonDiscount;
            _settings.set({
              IsReasonDiscount: _checked
            });
            break;
          case "IsReasonReturns":
            _checked = self.isReasonReturns;
            _settings.set({
              IsReasonReturns: _checked
            });
            break;
          case "IsReasonItemVoid":
            _checked = self.isReasonItemVoid;
            _settings.set({
              IsReasonItemVoid: _checked
            });
            break;
          case "IsReasonTransactionVoid":
            _checked = self.isReasonTransactionVoid;
            _settings.set({
              IsReasonTransactionVoid: _checked
            });
            break;
        }
      });
      self.preferenceCollection.reset(_settings);
    }
    
  });
  return ReasonSettingsView;
});
