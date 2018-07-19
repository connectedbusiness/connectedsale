define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/receipt',
  'collection/receipts',
  'collection/preferences',
  'view/15.0.0/settings/receipt/print/printsetting',
  'view/15.0.0/settings/receipt/typelist/receipttypelist',
  'text!template/15.0.0/settings/receipt/receipt.tpl.html',
  'js/libs/iscroll.js',
  'js/libs/ui.checkswitch.min.js'
], function($, $$, _, Backbone, Global, Service, Method, Shared, ReceiptModel, ReceiptCollection, PreferenceCollection, PrintSettingsView, ReceiptTypeListPreference, template) {

  var ReceiptSettingsView = Backbone.View.extend({
    _template: _.template(template),
    events: {
      "tap #printer-settings": "showPrintSettings",
      "change #AutoPrintReceipt": "AutoPrintReceipt_toggled",
      "tap #sale-receipt": "SaleReceiptTapped",
      "tap #order-receipt": "OrderReceiptTapped",
      "tap #quote-receipt": "QuoteReceiptTapped",
      "tap #return-receipt": "ReturnReceiptTapped",
      "tap #credit-card-receipt": "CreditCardReceiptTapped",
      "tap #sale-payment-receipt": "SalePaymentReceiptTapped",
      "tap #pick-note-receipt": "PickNoteTapped",
      "tap #z-tape-report": "ZTapeTapped",
      "tap #x-tape-report": "XTapeTapped",

      "change #CreditCardReceiptCopies": "CreditCardReceiptCopies_Change"
    },

    SaleReceiptTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('InvoiceReportCode');
    },

    OrderReceiptTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('OrderReportCode');
    },

    QuoteReceiptTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('QuoteReportCode');
    },

    ReturnReceiptTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('ReturnReportCode');
    },

    CreditCardReceiptTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('CreditCardReportCode');
    },

    SalePaymentReceiptTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('SalePaymentReportCode');
    },

    PickNoteTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('PickNoteReportCode');
    },

    ZTapeTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('ZTapeReportCode');
    },

    XTapeTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('XTapeReportCode');
    },

    InitializeReceiptModel: function(_lookupReportMode) {
      this.receiptCollection = new ReceiptCollection();
      this.receiptCollection.on('selected', this.UpdateReportCodeSelected, this);

      this.lookupReportMode = _lookupReportMode;
      this.receiptModel
      var _rowsSelected = 100;
      this.receiptModel = new ReceiptModel();
      this.receiptModel.url = Global.ServiceUrl + Service.POS + Method.REPORTCODELOOKUP + _lookupReportMode + "/" + _rowsSelected;

      this.RetrieveReportCodes();
    },

    RetrieveReportCodes: function() {
      var _self = this;
      var _criteria = " ";
      this.receiptModel.set({
        Criteria: _criteria
      });

      this.receiptModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.receiptCollection.reset(response.ReportViews);
          _self.ValidateCollection(_self.receiptCollection);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving Report Codes");
        }
      });
    },

    ValidateCollection: function(_collection) {
      if (_collection.length === 0) {
        console.log("No Data Found!");
        navigator.notification.alert("No Report found.", null, "No Report Found", "OK");
      } else {
        this.ShowReceiptTypePage(_collection);
      }
    },

    ShowReceiptTypePage: function(_collection) {
      _selectedReportCode = this.GetSelectedReportCode(),
        //console.log(_selectedReportCode);
        this.SetSelectedPage("ReceiptTypeListPage");
      this.receiptTypePref = new ReceiptTypeListPreference({
        el: this.$el,
        collection: _collection,
      });
      this.receiptTypePref.SetSelected(_selectedReportCode);
      //this.receiptTypePref.on("SaveCompleted", this.SaveCompleted, this);
    },

    UpdateReportCodeSelected: function(_model) {
      var _self = this;
      if (!this.preferenceCollection || this.preferenceCollection.length === 0 || !this.preferences || this.preferences.length === 0) {
        return;
      } else {
        var _self = this;
        _prevReportCode = this.GetSelectedReportCode();
        if (_prevReportCode !== _model.get('ReportCode')) {
          this.AssignChangesToPreference(_model);
          this.Save();
          this.InitializeDisplay();
          // this.render();
          // this.RemoveSearchTemplate();
        }
      }
    },

    AssignChangesToPreference: function(model) {
      var _settings = this.preferenceCollection.at(0);
      var _reportCode = model.get("ReportCode");
      console.log("lookupmode =" + this.lookupReportMode);
      switch (this.lookupReportMode) {
        case "InvoiceReportCode":
          _settings.set({
            InvoiceReportCode: model.get("ReportCode"),
            InvoiceReportName: model.get("ReportName")
          });
          break;
        case "ReturnReportCode":
          _settings.set({
            ReturnReportCode: model.get("ReportCode"),
            ReturnReportName: model.get("ReportName")
          });
          break;
        case "OrderReportCode":
          _settings.set({
            OrderReportCode: model.get("ReportCode"),
            OrderReportName: model.get("ReportName")
          });
          break;
        case "QuoteReportCode":
          _settings.set({
            QuoteReportCode: model.get("ReportCode"),
            QuoteReportName: model.get("ReportName")
          });
          break;
        case "CreditCardReportCode":
          _settings.set({
            CreditCardReportCode: model.get("ReportCode"),
            CreditCardReportName: model.get("ReportName")
          });
          break;
        case "SalePaymentReportCode":
          _settings.set({
            SalePaymentReportCode: model.get("ReportCode"),
            SalePaymentReportName: model.get("ReportName")
          });
          break;
        case "PickNoteReportCode":
          _settings.set({
            PickNoteReportCode: model.get("ReportCode"),
            PickNoteReportName: model.get("ReportName")
          });
          break;
        case "XTapeReportCode":
          _settings.set({
            XTapeReportCode: model.get("ReportCode"),
            XTapeReportName: model.get("ReportName")
          });
          break;
        case "ZTapeReportCode":
          _settings.set({
            ZTapeReportCode: model.get("ReportCode"),
            ZTapeReportName: model.get("ReportName")
          });
          break;
      }
      this.preferenceCollection.reset(_settings);
    },

    GetSelectedReportCode: function() {
      var _settings = this.preferenceCollection.at(0);
      var _reportCode;
      switch (this.lookupReportMode) {
        case "InvoiceReportCode":
          _reportCode = _settings.get("InvoiceReportCode");
          break;
        case "ReturnReportCode":
          _reportCode = _settings.get("ReturnReportCode");
          break;
        case "OrderReportCode":
          _reportCode = _settings.get("OrderReportCode");
          break;
        case "QuoteReportCode":
          _reportCode = _settings.get("QuoteReportCode");
          break;
        case "CreditCardReportCode":
          _reportCode = _settings.get("CreditCardReportCode");
          break;
        case "SalePaymentReportCode":
          _reportCode = _settings.get("SalePaymentReportCode");
          break;
        case "PickNoteReportCode":
          _reportCode = _settings.get("PickNoteReportCode");
          break;
        case "XTapeReportCode":
          _reportCode = _settings.get("XTapeReportCode");
          break;
        case "ZTapeReportCode":
          _reportCode = _settings.get("ZTapeReportCode");
          break;
      }
      return _reportCode;
    },

    SearchReport: function(criteria) {
      console.log(criteria);
      this.FetchReport(50, criteria);
    },

    FetchReport: function(_rows, _criteria) {
      var _self = this;
      var _reportLookup = new ReceiptModel();
      var _rowsToSelect = _rows;

      _reportLookup.set({
        StringValue: _criteria
      })
      _reportLookup.url = Global.ServiceUrl + Service.POS + Method.REPORTCODELOOKUP + this.lookupReportMode + "/" + _rowsToSelect;
      _reportLookup.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.receiptCollection.reset(response.ReportViews);
          _self.ValidateCollection(_self.receiptCollection);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving Report Code");
        }
      });
    },

    ValidateData: function() {
      if (!this.preferenceCollection) {
        return true;
      }
      var _settings = this.preferenceCollection.at(0);

      if (!Global.isBrowserMode && (_settings.get("UseCashDrawer") && _settings.get("AutoPrintReceipt")) &&
        (Shared.IsNullOrWhiteSpace(Global.Printer.PrinterModel) && Shared.IsNullOrWhiteSpace(Global.Printer.IpAddress))) {
        navigator.notification.alert("There is no Printer connected as of the moment. Please try again", null, "No Printer Connected", "OK");
        Global.BackToMain = false;
        this.IsFocusReceipt = true;
        return false;
      } else {
        return true;
      }
    },

    Save: function() { //v14
      switch (this.selectedPage) {
        case "Receipt":
        case "ReceiptTypeListPage":
          this.UpdateReceiptPreference();
          break;
        case "PrintSetting":
          this.UpdatePrintSettings();
          break;
      }
      if (this.backToMain) this.SaveCompleted();
    },

    initialize: function() {
      this.AllowSilentSave = true;
      this.on('ReportLookup', this.SearchReport, this);
      this.render();
    },

    ToggleCheckboxes: function() {
      var _self = this;
      var _settings = this.preferenceCollection.at(0);
      var _booleanSettings = ["AutoEmailReceipt", "ShowPrintOptions", "AutoPrintReceipt", "IsSinglePageTransactionReceipt"];

      var _showPrintOptions = (_settings.get("PromptEmailAddress") || _settings.get("PromptToPrintReceipt"))
      _settings.set({
        ShowPrintOptions: _showPrintOptions
      });

      _.each(_booleanSettings,
        function(setting) {

          var elementID = "#" + setting;
          var chk = CheckSwitch(elementID);

          if (_settings.get(setting)) {
            chk.on();
          } else {
            chk.off();
          }

          switch (setting) {
            case "IsSinglePageTransactionReceipt":
              this.singlePageTransaction = chk;
              break;
            case "AutoEmailReceipt":
              this.autoEmailReceipt = chk;
              break;
            case "ShowPrintOptions":
              this.showPrintOptions = chk;
              break;
            case "AutoPrintReceipt":
              this.autoPrintReceipt = chk;
              break;
          };

          switch (setting) {
            case "AutoPrintReceipt":
              chk.bind({
                'checkSwitch:on': function(e) {
                  _self.autoPrintReceipt_change(chk);
                }
              });
              break;
          };
        });
    },

    autoPrintReceipt_change: function(checked) {
      if ((Global.Printer.IpAddress === "" || Global.Printer.IpAddress === null) && !Global.isBrowserMode) {
        navigator.notification.alert("Please set printer IP address first before enabling AutoPrint.", null, "Required Action", "OK");
        checked.off();

      }
      return;
    },

    UpdatePreference: function() {
      var _settings = this.preferenceCollection.at(0);
      var _receipt = ["AutoEmailReceipt", "ShowPrintOptions", "AutoPrintReceipt", "IsSinglePageTransactionReceipt"];
      _.each(_receipt, function(receipt) {
        var _checked = false;
        switch (receipt) {
          case "IsSinglePageTransactionReceipt":
            _checked = this.singlePageTransaction.getState();
            _settings.set({
              IsSinglePageTransactionReceipt: _checked
            });
            break;
          case "AutoEmailReceipt":
            _checked = this.autoEmailReceipt.getState();
            _settings.set({
              AutoEmailReceipt: _checked
            });
            break;
          case "ShowPrintOptions":
            _checked = this.showPrintOptions.getState();
            _settings.set({
              PromptEmailAddress: _checked,
              PromptToPrintReceipt: _checked
            });
            break;
          case "AutoPrintReceipt":
            _checked = this.autoPrintReceipt.getState();
            _settings.set({
              AutoPrintReceipt: _checked
            });

            break;
        }
      });
      this.preferenceCollection.reset(_settings);

    },

    InitializeDisplay: function() {
      console.log("Initialize Display");
      this.SetSelectedPage("Receipt");
      var _model = this.preferenceCollection.at(0);
      this.AssignAirprint(_model);

      $("#settings-report-search").remove();
      $("#right-pane-content").html('');
      $("#right-pane-content").css("padding", "");

      //this.AskToPrintReceiptConfig(_model);
      this.$el.html(this._template(_model.toJSON()));
      if (Global.isBrowserMode) $('#printer-settings').remove();
      this.$("#settings-receipt").trigger("create");
      this.ToggleCheckboxes();
      this.ConfigureListItems(_model);

      if (Global.isBrowserMode) Shared.UseBrowserScroll('#right-pane-content');
      else this.myScroll = new iScroll('right-pane-content');
    },

    AssignAirprint: function(_model) {
      if (_model.get("IsAirprint")) {
        _model.set({
          IsAirprintDisplay: "AirPrint-enabled Printer"
        });
      } else {
        _model.set({
          IsAirprintDisplay: "Receipt Printer"
        });
      }
    },

    ConfigureListItems: function(_model) {
      var _isAir = _model.get("IsAirprint");
      if (_isAir && !Global.isBrowserMode) {
        $("#auto-print-receipt").addClass("ui-disabled");
      } else {
        $("#auto-print-receipt").removeClass("ui-disabled");
      }
    },


    ToggleAskToPrint: function() {
      if (this.allowAskToPrintReceipt === false) {
        $("#li-ask-to-print-receipt").addClass("ui-disabled");
        //$("#PromptToPrintReceipt").attr("checked",false);
        $("#div-ask-to-print-receipt > h1 > span").removeClass('ui_check_switch_on').addClass('ui_check_switch_off');
        $("#div-ask-to-print-receipt > h1 > div > span .ui_check_switch_slider").css("margin-left", "-50px");
      } else {
        $("#li-ask-to-print-receipt").removeClass("ui-disabled");
      }
    },

    AutoPrintReceipt_toggled: function(e) {
      if (_isChecked) {
        this.allowAskToPrintReceipt = false;
      } else {
        this.allowAskToPrintReceipt = true;
      }
      //this.ToggleAskToPrint();
    },

    showPrintSettings: function() {
      this.UpdatePreference();
      this.InitializePrintSettings();
    },

    render: function() {
      this.AllowSilentSave = true;
      this.FetchPreference();
      //this.InitializeDisplay();
    },

    InitializePrintSettings: function() {
      this.SetSelectedPage("PrintSetting");
      var _model = this.preferenceCollection.at(0);
      this.$el.html("");
      this.$el.append("<div id='receiptContainer'></div>");
      this.printSettings = new PrintSettingsView({
        el: $("#receiptContainer"),
        model: _model
      });
      this.printSettings.on("SaveCompleted", this.SaveCompleted, this);
      this.printSettings.SetPreferences(this.preferences);
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

    UpdateReceiptPreference: function() {
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
            if (_self.IsSilentSave()) {
              _self.SilentSaveCompleted();
            } else {
              _self.SaveCompleted();
            }
          },
          error: function(model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.RequestError(error, "Error Saving Workstation Preference");
          }
        });
      }
    },

    UpdatePrintSettings: function() {
      this.printSettings.Save();
    },

    SetSelectedPage: function(page) {
      this.selectedPage = page;
    },

    SaveCompleted: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      $("#settings-report-search").remove();
      //navigator.notification.alert("Save Complete.",null,"No Report Found.","OK");
      console.log("SaveReceipt")
      this.trigger("SaveCompleted", this);
    },

    ResetPreferenceCollection: function(preferences) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.preferenceCollection.reset(preferences);
      this.InitializeDisplay();
    },

    SilentSaveCompleted: function() {
      this.render();
      this.RemoveSearchTemplate();
    },

    IsSilentSave: function() {
      return (this.selectedPage == "ReceiptTypeListPage" && !Shared.IsNullOrWhiteSpace(this.AllowSilentSave));
    },

    RemoveSearchTemplate: function() {
      $("#settings-report-search").remove();
      $("#back-general").hide();
    },

    CreditCardReceiptCopies_Change: function(e) {
      if (this.preferenceCollection.at(0)) {
        this.preferenceCollection.at(0).set({
          CreditCardReceiptCopies: parseInt($("#CreditCardReceiptCopies").val())
        });
      }
    }

  });
  return ReceiptSettingsView;
});
