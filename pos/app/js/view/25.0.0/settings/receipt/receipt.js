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
  'model/printer',
  'collection/receipts',
  'collection/preferences',
  'view/25.0.0/settings/receipt/print/printsetting',
  'view/25.0.0/settings/receipt/typelist/receipttypelist',
  'view/25.0.0/settings/modal/modal',
  'text!template/25.0.0/settings/receipt/receipt.tpl.html',
  'js/libs/iscroll.js',
  'js/libs/ui.checkswitch.min.js'
], function($, $$, _, Backbone, Global, Service, Method, Shared, ReceiptModel, PrinterModel, ReceiptCollection, PreferenceCollection, PrintSettingsView, ReceiptTypeListPreference,
  SettingsModal, template) {

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

      "tap #sale-receipt2": "SaleReceipt2Tapped",
      "tap #order-receipt2": "OrderReceipt2Tapped",
      "tap #quote-receipt2": "QuoteReceipt2Tapped",
      "tap #return-receipt2": "ReturnReceipt2Tapped",
      "tap #credit-card-receipt2": "CreditCardReceipt2Tapped",
      "tap #sale-payment-receipt2": "SalePaymentReceipt2Tapped",
      "tap #pick-note-receipt2": "PickNote2Tapped",

      "tap #default-printer": "DefaultPrinterTapped",
      "tap #invoice-report-printer": "InvoiceReportPrinterTapped",
      "tap #invoice-report-printer2": "InvoiceReportPrinter2Tapped",
      "tap #order-report-printer": "OrderReportPrinterTapped",
      "tap #quote-report-printer": "QuoteReportPrinterTapped",
      "tap #return-report-printer": "ReturnReportPrinterTapped",
      "tap #credit-card-report-printer": "CreditCardReportPrinterTapped",
      "tap #sale-payment-report-printer": "SalePaymentReportPrinterTapped",
      "tap #pick-note-report-printer": "PickNoteReportPrinterTapped",

      // "change #CreditCardReceiptCopies": "CreditCardReceiptCopies_Change",
      "change #InvoiceReceiptCopies, #OrderReceiptCopies, #QuoteReceiptCopies, #ReturnReceiptCopies, #CreditCardReceiptCopies, #SalePaymentReceiptCopies, #PickNoteReceiptCopies": "TextNumber_Changed",
      "change #InvoiceReceiptCopies2, #OrderReceiptCopies2, #QuoteReceiptCopies2, #ReturnReceiptCopies2, #CreditCardReceiptCopies2, #SalePaymentReceiptCopies2, #PickNoteReceiptCopies2": "TextNumber_Changed",

      "tap #IsSinglePageTransactionReceipt, #ShowPrintOptions, #AutoEmailReceipt, #AutoPrintReceipt" : "Chkbox_click",
      "tap #InvoiceReceiptAutoPrint" : "Chkbox_click"
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

    SaleReceipt2Tapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('InvoiceReportCode2');
    },

    OrderReceipt2Tapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('OrderReportCode2');
    },

    QuoteReceipt2Tapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('QuoteReportCode2');
    },

    ReturnReceipt2Tapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('ReturnReportCode2');
    },

    CreditCardReceipt2Tapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('CreditCardReportCode2');
    },

    SalePaymentReceipt2Tapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('SalePaymentReportCode2');
    },

    PickNote2Tapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.InitializeReceiptModel('PickNoteReportCode2');
    },

    DefaultPrinterTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.ShowPrinterList("DefaultPrinter");
    },

    InvoiceReportPrinterTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.ShowPrinterList("InvoiceReportPrinter");
    },

    InvoiceReportPrinter2Tapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.ShowPrinterList("InvoiceReportPrinter2");
    },

    OrderReportPrinterTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.ShowPrinterList("OrderReportPrinter");
    },

    QuoteReportPrinterTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.ShowPrinterList("QuoteReportPrinter");
    },

    ReturnReportPrinterTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.ShowPrinterList("ReturnReportPrinter");
    },

    CreditCardReportPrinterTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.ShowPrinterList("CreditCardReportPrinter");
    },

    SalePaymentReportPrinterTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.ShowPrinterList("SalePaymentReportPrinter");
    },

    PickNoteReportPrinterTapped: function(e) {
      e.preventDefault();
      this.UpdatePreference();
      this.ShowPrinterList("PickNoteReportPrinter");
    },

    Chkbox_click: function(e){
      e.preventDefault();
      var _elementID = '#' + e.currentTarget.id;
      var _chkState = this.GetCheckState(_elementID);
      this.SetChkState(e.currentTarget.id, !_chkState);
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

    ShowPrinterList: function(mode) {
      if (printerTool) {
        var self = this;

        printerTool.getPrinters()
          .then(function(result) {
            var printers = result.map(function(item) {
              var printerModel = new PrinterModel();
              printerModel.on('selected', self.UpdateDefaultPrinter, self);

              printerModel.set({
                Printer: item,
                mode: mode
              });

              return printerModel;
            });

            if (printers && printers.length > 0) {
              self.SetSelectedPage("DefaultPrinter");
              var _settings = self.preferenceCollection.at(0);
              var defaultPrinter;

              switch(mode) {
                case "DefaultPrinter":
                  defaultPrinter = _settings.get("DefaultPrinter");
                  break;
                case "InvoiceReportPrinter":
                  defaultPrinter = _settings.get("InvoiceReportPrinter");
                  break;
                case "InvoiceReportPrinter2":
                  defaultPrinter = _settings.get("InvoiceReportPrinter2");
                  break;
                case "CreditCardReportPrinter":
                  defaultPrinter = _settings.get("CreditCardReportPrinter");
                  break;
                case "OrderReportPrinter":
                  defaultPrinter = _settings.get("OrderReportPrinter");
                  break;
                case "PickNoteReportPrinter":
                  defaultPrinter = _settings.get("PickNoteReportPrinter");
                  break;
                case "QuoteReportPrinter":
                  defaultPrinter = _settings.get("QuoteReportPrinter");
                  break;
                case "ReturnReportPrinter":
                  defaultPrinter = _settings.get("ReturnReportPrinter");
                  break;
                case "SalePaymentReportPrinter":
                  defaultPrinter = _settings.get("SalePaymentReportPrinter");
                  break;
              }

              self.settingsModal = new SettingsModal({
                el: $("#settings-modal-container"),
                collection: printers,
                preferencetype: "DefaultPrinter",
                defaultPrinter: defaultPrinter
              });
            }
            else {
              navigator.notification.alert("There are no printers installed in this machine.", null, "No Printers Found", "OK");
            }
          });
      }
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
      // this.receiptTypePref = new ReceiptTypeListPreference({
      //   el: this.$el,
      //   collection: _collection,
      // });
      // this.receiptTypePref.SetSelected(_selectedReportCode);
      //this.receiptTypePref.on("SaveCompleted", this.SaveCompleted, this);

      this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        collection: _collection,
        preferencetype: "Receipt",
        selectedReport: _selectedReportCode
      });
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
          this.CloseModal();
          // this.render();
          // this.RemoveSearchTemplate();
        }
      }
    },

    UpdateDefaultPrinter: function(model) {
      if (!this.preferenceCollection || this.preferenceCollection.length === 0 || !this.preferences || this.preferences.length === 0) {
        return;
      } else {
        var settings = this.preferenceCollection.at(0);
        var selectedPrinter = model.get("Printer")
        var defaultPrinter;
        var mode = model.attributes.mode;

        switch(mode) {
          case "DefaultPrinter":
            defaultPrinter = settings.get("DefaultPrinter");
            break;
          case "InvoiceReportPrinter":
            defaultPrinter = settings.get("InvoiceReportPrinter");
            break;
          case "InvoiceReportPrinter2":
            defaultPrinter = settings.get("InvoiceReportPrinter2");
            break;
          case "CreditCardReportPrinter":
            defaultPrinter = settings.get("CreditCardReportPrinter");
            break;
          case "OrderReportPrinter":
            defaultPrinter = settings.get("OrderReportPrinter");
            break;
          case "PickNoteReportPrinter":
            defaultPrinter = settings.get("PickNoteReportPrinter");
            break;
          case "QuoteReportPrinter":
            defaultPrinter = settings.get("QuoteReportPrinter");
            break;
          case "ReturnReportPrinter":
            defaultPrinter = settings.get("ReturnReportPrinter");
            break;
          case "SalePaymentReportPrinter":
            defaultPrinter = settings.get("SalePaymentReportPrinter");
            break;
        }

        if (selectedPrinter != defaultPrinter) {
          switch(mode) {
            case "DefaultPrinter":
              settings.set({
                DefaultPrinter: selectedPrinter,
              });
              break;
            case "InvoiceReportPrinter":
              settings.set({
                InvoiceReportPrinter: selectedPrinter,
              });
              break;
            case "InvoiceReportPrinter2":
              settings.set({
                InvoiceReportPrinter2: selectedPrinter,
              });
              break;
            case "CreditCardReportPrinter":
              settings.set({
                CreditCardReportPrinter: selectedPrinter,
              });
              break;
            case "OrderReportPrinter":
              settings.set({
                OrderReportPrinter: selectedPrinter,
              });
              break;
            case "PickNoteReportPrinter":
              settings.set({
                PickNoteReportPrinter: selectedPrinter,
              });
              break;
            case "QuoteReportPrinter":
              settings.set({
                QuoteReportPrinter: selectedPrinter,
              });
              break;
            case "ReturnReportPrinter":
              settings.set({
                ReturnReportPrinter: selectedPrinter,
              });
              break;
            case "SalePaymentReportPrinter":
              settings.set({
                SalePaymentReportPrinter: selectedPrinter,
              });
              break;
          }

          this.Save();
          this.InitializeDisplay();
          this.CloseModal();
        }
      }
    },

    CloseModal: function(){
      if (this.settingsModal != null){
            this.settingsModal.close();
          }
    },

    AssignChangesToPreference: function(model) {
      var _settings = this.preferenceCollection.at(0);
      var _reportCode = model.get("ReportCode");

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
        case "DefaultPrinter":
          _settings.set({
            DefaultPrinter: model.get("ReportName")
          });
          break;
        case "InvoiceReportCode2":
          _settings.set({
            InvoiceReportCode2: model.get("ReportCode"),
            InvoiceReportName2: model.get("ReportName")
          });
          break;
        case "ReturnReportCode2":
          _settings.set({
            ReturnReportCode2: model.get("ReportCode"),
            ReturnReportName2: model.get("ReportName")
          });
          break;
        case "OrderReportCode2":
          _settings.set({
            OrderReportCode2: model.get("ReportCode"),
            OrderReportName2: model.get("ReportName")
          });
          break;
        case "QuoteReportCode2":
          _settings.set({
            QuoteReportCode2: model.get("ReportCode"),
            QuoteReportName2: model.get("ReportName")
          });
          break;
        case "CreditCardReportCode2":
          _settings.set({
            CreditCardReportCode2: model.get("ReportCode"),
            CreditCardReportName2: model.get("ReportName")
          });
          break;
        case "SalePaymentReportCode2":
          _settings.set({
            SalePaymentReportCode2: model.get("ReportCode"),
            SalePaymentReportName2: model.get("ReportName")
          });
          break;
        case "PickNoteReportCode2":
          _settings.set({
            PickNoteReportCode2: model.get("ReportCode"),
            PickNoteReportName2: model.get("ReportName")
          });
          break;
        case "InvoiceReportPrinter":
          _settings.set({
            InvoiceReportPrinter: model.get("ReportName")
          });
          break;
        case "InvoiceReportPrinter2":
          _settings.set({
            InvoiceReportPrinter2: model.get("ReportName")
          });
          break;
        case "CreditCardReportPrinter":
          _settings.set({
            CreditCardReportPrinter: model.get("ReportName")
          });
          break;
        case "OrderReportPrinter":
          _settings.set({
            CreditCardReportPrinter: model.get("ReportName")
          });
          break;
        case "PickNoteReportPrinter":
          _settings.set({
            CreditCardReportPrinter: model.get("ReportName")
          });
          break;
        case "QuoteReportPrinter":
          _settings.set({
            CreditCardReportPrinter: model.get("ReportName")
          });
          break;
        case "ReturnReportPrinter":
          _settings.set({
            CreditCardReportPrinter: model.get("ReportName")
          });
          break;
        case "SalePaymentReportPrinter":
          _settings.set({
            CreditCardReportPrinter: model.get("ReportName")
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
          case "InvoiceReportCode2":
          _reportCode = _settings.get("InvoiceReportCode2");
          break;
        case "ReturnReportCode2":
          _reportCode = _settings.get("ReturnReportCode2");
          break;
        case "OrderReportCode2":
          _reportCode = _settings.get("OrderReportCode2");
          break;
        case "QuoteReportCode2":
          _reportCode = _settings.get("QuoteReportCode2");
          break;
        case "CreditCardReportCode2":
          _reportCode = _settings.get("CreditCardReportCode2");
          break;
        case "SalePaymentReportCode2":
          _reportCode = _settings.get("SalePaymentReportCode2");
          break;
        case "PickNoteReportCode2":
          _reportCode = _settings.get("PickNoteReportCode2");
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
        case "DefaultPrinter":
        case "Receipt":
          this.UpdateReceiptPreference();
          break;
        case "ReceiptTypeListPage":
          this.UpdateReceiptPreference();
          break;
        case "PrintSetting":
        console.log("UpdatePrintSettings");
          // this.UpdatePrintSettings();
          break;
      }
      if (this.backToMain) this.SaveCompleted();
    },

    initialize: function() {
      this.AllowSilentSave = true;
      this.on('ReportLookup', this.SearchReport, this);
      this.render();
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
        case "AutoEmailReceipt":
          _self.autoEmailReceipt = isCheked;
          break;
        case "ShowPrintOptions":
          _self.showPrintOptions = isCheked;
          break;
        case "AutoPrintReceipt":
          _self.autoPrintReceipt = isCheked;
          if (isCheked) {
            isCheked = _self.autoPrintReceipt_change(isCheked);
          }
          break;
        case "IsSinglePageTransactionReceipt":
          _self.singlePageTransaction = isCheked;
          break;
        case "InvoiceReceiptAutoPrint":
          _self.invoiceReceiptAutoPrint = isCheked;
          break;
      }
      _self.ToggleCheckbox(setting, isCheked);
    },

    ToggleCheckboxes: function() {
      var _self = this;
      var _settings = this.preferenceCollection.at(0);
      var _booleanSettings = [
        "AutoEmailReceipt",
        "ShowPrintOptions",
        "AutoPrintReceipt",
        "IsSinglePageTransactionReceipt",
        "InvoiceReceiptAutoPrint"
      ];

      var _showPrintOptions = (_settings.get("PromptEmailAddress") || _settings.get("PromptToPrintReceipt"))
      _settings.set({
        ShowPrintOptions: _showPrintOptions
      });

      _.each(_booleanSettings,
        function(setting) {

          var elementID = "#" + setting;

          switch (setting) {
            case "IsSinglePageTransactionReceipt":
              _self.singlePageTransaction = _settings.attributes['IsSinglePageTransactionReceipt'];
              break;
            case "AutoEmailReceipt":
              _self.autoEmailReceipt = _settings.attributes['AutoEmailReceipt'];
              break;
            case "ShowPrintOptions":
              _self.showPrintOptions = _settings.attributes['ShowPrintOptions'];
              break;
            case "AutoPrintReceipt":
              _self.autoPrintReceipt = _settings.attributes['AutoPrintReceipt'];
              break;
            case "InvoiceReceiptAutoPrint":
              _self.invoiceReceiptAutoPrint = _settings.attributes['InvoiceReceiptAutoPrint'];
              break;
          };

          if (_settings.get(setting)) {
            _self.SetChkState(setting, true);
          } else {
            _self.SetChkState(setting, false);
          }

        });
    },

    autoPrintReceipt_change: function(checked) {
      if ((Global.Printer.IpAddress === "" || Global.Printer.IpAddress === null) && !Global.isBrowserMode) {
        navigator.notification.alert("Please set printer IP address first before enabling AutoPrint.", null, "Required Action", "OK");
        // checked.off();
        this.autoPrintReceipt = false;
        return false;
      }
      return true;
    },

    UpdatePreference: function() {
      var _self = this;
      var _settings = _self.preferenceCollection.at(0);
      var _receipt = [
        "AutoEmailReceipt",
        "ShowPrintOptions",
        "AutoPrintReceipt",
        "IsSinglePageTransactionReceipt",
        "InvoiceReceiptAutoPrint"
      ];
      _.each(_receipt, function(receipt) {
        var _checked = false;
        switch (receipt) {
          case "IsSinglePageTransactionReceipt":
            _checked = _self.singlePageTransaction;
            _settings.set({
              IsSinglePageTransactionReceipt: _checked
            });
            break;
          case "AutoEmailReceipt":
            _checked = _self.autoEmailReceipt;
            _settings.set({
              AutoEmailReceipt: _checked
            });
            break;
          case "ShowPrintOptions":
            _checked = _self.showPrintOptions;
            _settings.set({
              PromptEmailAddress: _checked,
              PromptToPrintReceipt: _checked
            });
            break;
          case "AutoPrintReceipt":
            _checked = _self.autoPrintReceipt;
            _settings.set({
              AutoPrintReceipt: _checked
            });
            break;
          case "InvoiceReceiptAutoPrint":
            _checked = _self.invoiceReceiptAutoPrint;
            _settings.set({
              InvoiceReceiptAutoPrint: _checked
            });
            break;
        }
      });

      // Print copies
      _settings.set({
        InvoiceReceiptCopies: $("#InvoiceReceiptCopies").val(),
        OrderReceiptCopies: $("#OrderReceiptCopies").val(),
        QuoteReceiptCopies: $("#QuoteReceiptCopies").val(),
        ReturnReceiptCopies: $("#ReturnReceiptCopies").val(),
        CreditCardReceiptCopies: $("#CreditCardReceiptCopies").val(),
        SalePaymentReceiptCopies: $("#SalePaymentReceiptCopies").val(),
        PickNoteReceiptCopies: $("#PickNoteReceiptCopies").val(),

        InvoiceReceiptCopies2: $("#InvoiceReceiptCopies2").val(),
        OrderReceiptCopies2: $("#OrderReceiptCopies2").val(),
        QuoteReceiptCopies2: $("#QuoteReceiptCopies2").val(),
        ReturnReceiptCopies2: $("#ReturnReceiptCopies2").val(),
        CreditCardReceiptCopies2: $("#CreditCardReceiptCopies2").val(),
        SalePaymentReceiptCopies2: $("#SalePaymentReceiptCopies2").val(),
        PickNoteReceiptCopies2: $("#PickNoteReceiptCopies2").val()
      });

      this.preferenceCollection.reset(_settings);

    },

    InitializeDisplay: function() {
      this.SetSelectedPage("Receipt");
      var _model = this.preferenceCollection.at(0);

      this.AssignAirprint(_model);

      $("#settings-report-search").remove();
      $("#right-pane-content").html('');
      $("#right-pane-content").css("padding", "");

      this.$el.html(this._template(_model.toJSON()));
      if (Global.isBrowserMode) $('.printerSettings').remove();
      this.ToggleCheckboxes();
      this.ConfigureListItems(_model);

      if (Global.isBrowserMode) Shared.UseBrowserScroll('.settings-left-pane #receipt-left-pane-content');
      else this.myScroll = new iScroll('scroll-wrapper');
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
      // this.$el.html("");
      // this.$el.append("<div id='receiptContainer'></div>");
      // this.printSettings = new PrintSettingsView({
      //   el: $("#receiptContainer"),
      //   model: _model
      // });
      // this.printSettings.on("SaveCompleted", this.SaveCompleted, this);
      // this.printSettings.SetPreferences(this.preferences);
      this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        model: _model,
        preferencetype: "Printer"
      });
      this.settingsModal.on('ModalClose', this.OnModalClose, this);
      this.settingsModal.printSettings.on("SaveCompleted", this.SaveCompleted, this);
      this.settingsModal.printSettings.SetPreferences(this.preferences);
    },

    OnModalClose: function(){
      $("#settings-modal-container").removeClass("settings-modal-receipt-printer");
      this.UpdatePrintSettings();
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
      this.settingsModal.printSettings.Save();
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
      var self = this;

      printerTool.getDefaultPrinter().then(function(systemDefaultPrinter) {
        preferences.DefaultPrinter = preferences.DefaultPrinter || systemDefaultPrinter;
        preferences.InvoiceReportPrinter = preferences.InvoiceReportPrinter || systemDefaultPrinter;
        preferences.InvoiceReportPrinter2 = preferences.InvoiceReportPrinter2 || systemDefaultPrinter;
        preferences.CreditCardReportPrinter = preferences.CreditCardReportPrinter || systemDefaultPrinter;
        preferences.OrderReportPrinter = preferences.OrderReportPrinter || systemDefaultPrinter;
        preferences.PickNoteReportPrinter = preferences.PickNoteReportPrinter || systemDefaultPrinter;
        preferences.QuoteReportPrinter = preferences.QuoteReportPrinter || systemDefaultPrinter;
        preferences.ReturnReportPrinter = preferences.ReturnReportPrinter || systemDefaultPrinter;
        preferences.SalePaymentReportPrinter = preferences.SalePaymentReportPrinter || systemDefaultPrinter;

        self.preferenceCollection.reset(preferences);
        self.InitializeDisplay();
      });
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
  return ReceiptSettingsView;
});
