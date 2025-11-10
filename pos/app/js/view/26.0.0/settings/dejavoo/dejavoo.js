define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'collection/preferences',
  'view/26.0.0/settings/modal/modal',
  'view/26.0.0/settings/dejavoo/protocol/protocol',
  'text!template/26.0.0/settings/dejavoo/dejavoo.tpl.html',
  'js/libs/iscroll.js',
  'js/libs/ui.checkswitch.min.js'
], function($, $$, _, Backbone, Global, Service, Method, Shared, PreferenceCollection,
  SettingsModal, ProtocolPreference, template) {

  var DejavooSettingsView = Backbone.View.extend({
    _template: _.template(template),
    events: {
      "tap #dejavoo-protocol-btn": "buttonPOSPreference_tap",
      "tap #DejavooEnabled, #DejavooTransactionPrintReceipt, #DejavooTransactionSignature": "Chkbox_click",
      "change #DejavooConnectionStatusPort, #DejavooTransactionReferenceID, #DejavooTransactionRegisterID": "TextNumber_Changed",
    },

    buttonPOSPreference_tap: function(e) {
      e.preventDefault();
      this.InitializeProtocolModal(this.preferenceCollection.at(0));
    },

    Save: function() { //v14
      switch (this.selectedPage) {
        case "Dejavoo":
          this.UpdateDejavooPreference();
          break;
      }
      if (this.backToMain) this.SaveCompleted();
    },

    initialize: function() {
      this.render();
    },

    InitializeProtocolModal: function(model) {
      this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        model: model,
        preferencetype: "DejavooConnectionProtocol",
        general: this
      });
      this.settingsModal.protocolView.on("selected", function(protocolPreference) {
        this.preferenceCollection.at(0).set({
          DejavooConnectionProtocol: protocolPreference.selectedProtocol
        });
        this.$("#DejavooConnectionProtocol").text(protocolPreference.selectedProtocol);
      }, this);
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
      var _self = this;
      switch(setting){
        case "DejavooEnabled":
          _self.dejavooEnabled = isCheked;
          break;
        case "DejavooTransactionPrintReceipt":
          _self.dejavooTransactionPrintReceipt = isCheked;
          break;
        case "DejavooTransactionSignature":
          _self.dejavooTransactionSignature = isCheked;
          break;
      }
      _self.ToggleCheckbox(setting, isCheked);
    },

    ToggleCheckboxes: function() {
      var _self = this;
      var _settings = this.preferenceCollection.at(0);
      var _booleanSettings = ["DejavooEnabled", "DejavooTransactionPrintReceipt", "DejavooTransactionSignature"];

      _.each(_booleanSettings,
        function(setting) {
          switch (setting) {
            case "DejavooEnabled":
              _self.dejavooEnabled = _settings.attributes['DejavooEnabled'];
              break;
            case "DejavooTransactionPrintReceipt":
              _self.dejavooTransactionPrintReceipt = _settings.attributes['DejavooTransactionPrintReceipt'];
              break;
            case "DejavooTransactionSignature":
              _self.dejavooTransactionSignature = _settings.attributes['DejavooTransactionSignature'];
              break;
          };

          if (_settings.get(setting)) {
            _self.SetChkState(setting, true);
          } else {
            _self.SetChkState(setting, false);
          }

        });
    },

    UpdatePreference: function() {
      var _self = this;
      var _settings = _self.preferenceCollection.at(0);
      var _dejavoo = ["DejavooEnabled", "DejavooTransactionPrintReceipt", "DejavooTransactionSignature"];
      _.each(_dejavoo, function(dejavoo) {
        var _checked = false;
        switch (dejavoo) {
          case "DejavooEnabled":
            _checked = _self.dejavooEnabled;
            _settings.set({
              DejavooEnabled: _checked
            });
            break;
          case "DejavooTransactionPrintReceipt":
            _checked = _self.dejavooTransactionPrintReceipt;
            _settings.set({
              DejavooTransactionPrintReceipt: _checked
            });
            break;
          case "DejavooTransactionSignature":
            _checked = _self.dejavooTransactionSignature;
            _settings.set({
              DejavooTransactionSignature: _checked
            });
            break;
        }
      });

      _settings.set({
        DejavooConnectionTerminal: $("#DejavooConnectionTerminal").val(),
        DejavooConnectionCGIPort: $("#DejavooConnectionCGIPort").val(),
        DejavooConnectionAuthKey: $("#DejavooConnectionAuthKey").val(),
        DejavooConnectionStatusPort: $("#DejavooConnectionStatusPort").val(),
        DejavooTransactionFrequency: $("#DejavooTransactionFrequency").val(),
        DejavooTransactionReferenceID: $("#DejavooTransactionReferenceID").val(),
        DejavooTransactionRegisterID: $("#DejavooTransactionRegisterID").val()
      });

      this.preferenceCollection.reset(_settings);
    },

    InitializeDisplay: function() {
      console.log("Initialize Display");
      this.SetSelectedPage("Dejavoo");
      var _model = this.preferenceCollection.at(0);

      $("#right-pane-content").html('');
      $("#right-pane-content").css("padding", "");

      this.$el.html(this._template(_model.toJSON()));
      // if (Global.isBrowserMode) $('.printerSettings').remove();
      this.ToggleCheckboxes();

      // if (Global.isBrowserMode) Shared.UseBrowserScroll('.settings-left-pane #receipt-left-pane-content');
      // else this.myScroll = new iScroll('scroll-wrapper');
    },

    render: function() {
      this.FetchPreference();
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
      this.InitializePreferenceCollection();
      this.InitializePreferences();

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

    UpdateDejavooPreference: function() {
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
            _self.SaveCompleted();
          },
          error: function(model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.RequestError(error, "Error Saving Workstation Preference");
          }
        });
      }
    },

    SetSelectedPage: function(page) {
      this.selectedPage = page;
    },

    SaveCompleted: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      console.log("SaveDejavoo")
      this.trigger("SaveCompleted", this);
    },

    ResetPreferenceCollection: function(preferences) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.preferenceCollection.reset(preferences);
      this.InitializeDisplay();
    },

    TextNumber_Changed: function(e) {
      var input = e.srcElement;
      if ( input ) {
        if (input.value.length > input.maxLength) {
          input.value = input.value.slice(0, input.maxLength);
        }
      }
    }

  });
  return DejavooSettingsView;
});
