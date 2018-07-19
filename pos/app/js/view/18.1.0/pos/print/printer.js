/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/enum',
  'shared/method',
  'shared/shared',
  'collection/base',
  'collection/printers',
  'view/18.1.0/pos/print/printpreview',
], function($, $$, _, Backbone, Global, Enum, Method, Shared, BaseCollection, PrinterCollection, PrintPreviewView) {
  var PrinterView = Backbone.View.extend({

    //Passes formatted data from javascript to SetInvoiceReceiptHeader function on cbReceiptPrint.m class
    InitializePrintPlugin: function() {
      //this.InitializePrinterCollection();
      Shared.Printer.InitializePrintPlugin();
      Shared.Printer.InitializePrintPluginArray();
    },

    //Passes formatted data from javascript to SetInvoiceReceiptHeader function on cbReceiptPrint.m class
    InitializePrintPreview: function(pages, code, isWorkstation, collection /*receipt, receiptDetails, receiptPayment, receiptCheck, receiptCoupons, receiptCreditCard, receiptType, receiptCode, receiptSerializeLot*/ ) {
      if (this.printPreview) {
        //this.printPreview.ProcessData(receipt, receiptDetails, receiptPayment, receiptCheck, receiptCoupons, receiptCreditCard, receiptType, receiptCode, receiptSerializeLot);
        this.printPreview.ProcessPreview(pages, code, isWorkstation, collection);
      } else {
        this.printPreview = new PrintPreviewView({
          el: this.$("#printPreviewContainer")
        });

        this.printPreview.on("printFinish", this.ProcessSignOut, this);
        this.printPreview.on("AutoSignOut", this.ProcessSignOut, this);
        this.printPreview.on("kioskPrint", this.ProcessReloadKiosk, this);

        //this.printPreview.ProcessData(receipt, receiptDetails, receiptPayment, receiptCheck, receiptCoupons, receiptCreditCard, receiptType, receiptCode, receiptSerializeLot);
        this.printPreview.ProcessPreview(pages, code, isWorkstation, collection);
      }

    },

    ProcessReloadKiosk: function() {
      this.trigger("kioskPrint", this.ReloadKiosk, this);
    },

    ProcessSignOut: function() {
      this.trigger("SignOut", this);
    },

    ProcessPrinting: function(pageSettings, code, isWorkstation, isPrintPickNote) {
      var images = new BaseCollection();
      $("#main-transaction-blockoverlay").hide();
      if (!Global.isBrowserMode) {
        this.InitializePrintPlugin();
        window.plugins.cbNetworkActivity.HideIndicator();
      }

      console.log('Global.isOkToOpenCashDrawer : ' + Global.isOkToOpenCashDrawer);

      //if(Global.isOkToOpenCashDrawer == undefined || Global.isOkToOpenCashDrawer == "") Global.isOkToOpenCashDrawer = false;
      if (!Global.isOkToOpenCashDrawer) Global.isOkToOpenCashDrawer = false;

      if (!Global.isBrowserMode) {
        images = this.LoadImages(pageSettings.Pages, code, images);
        this.ProcessPrintingImages(images);
      }

      //if(isWorkstation && Global.Preference.AutoPrintReceipt) Global.PrintOptions.SilentPrint = Global.Preference.AutoPrintReceipt; //rmved 7.29.13
      if (isWorkstation) Global.PrintOptions.SilentPrint = Global.Preference.AutoPrintReceipt //replaced code above : CSL - 13481 : 7.29.13

      var isPrinterOptionShown = (Global.Preference.PromptToPrintReceipt || Global.Preference.PromptEmailAddress);
      var autoPrintCondition1 = (!Global.PrintOptions.Reprint && Global.Preference.AutoPrintReceipt && !isWorkstation && isPrinterOptionShown && Global.PrintOptions.SilentPrint);
      var autoPrintCondition2 = (!Global.PrintOptions.Reprint && Global.Preference.AutoPrintReceipt && (isWorkstation || !isPrinterOptionShown));
      var autoPrintCondition3 = Global.PrintOptions.SilentPrint;

      /* Original Lines
            if((!Global.PrintOptions.Reprint && Global.Preference.AutoPrintReceipt) || (Global.PrintOptions.Reprint && Global.PrintOptions.SilentPrint)
			|| (!Global.PrintOptions.Reprint && Global.PrintOptions.SilentPrint)) {
            */
      if ((isPrintPickNote || autoPrintCondition1 || autoPrintCondition2 || autoPrintCondition3) && Global.ApplicationType != 'Reports') {
        if (!Global.isBrowserMode) {
          if (Shared.Printer.Validate(Global.Printer.IpAddress, Global.Printer.PrinterModel)) {
            Shared.LockTransactionScreen(true, "Printing");
            this.ProcessPrintReceipt();
          } else {
            if (!Global.isBrowserMode) navigator.notification.alert("Please Specify the IP Address of the Printer and Try again...", null, "Unable to print Receipt", "OK");
          }
        } else {
          this.ProcessPrintReceiptFromBrowser(pageSettings, code);
        }

        if (Global.ClosingWorkStation) {
          this.trigger("SignOut", this);
        }
        //CSL-6491 : 4.29.13
        if (!isWorkstation && Global.Preference.AutoSignOutUser) { //if(Global.Preference.AutoSignOutUser) { << revised : 5.27.13 : to prevent signing out if a workstation report is printed.
          if (!Global.PreviousReprintValue) {
            this.trigger("SignOut", this);
          } else {
            Global.PreviousReprintValue = false;
          }
        }
        //end CSL-6491
        if (Global.ApplicationType === "Kiosk") this.trigger("kioskPrint", this);
        if (Global.TransactionType === Enum.TransactionType.Suspend) Global.TransactionType = Enum.TransactionType.Sale;
        if (Global.PrintOptions.Reprint) Global.PrintOptions.Reprint = false;

        this.DeleteReport(pageSettings.Pages, code);
        this.trigger("PrintFinish", this);
      } else {
        this.trigger("ShowPreview", this);
        if (this.NoPreview) return;
        this.InitializePrintPreview(pageSettings.Pages, code, isWorkstation, images);
      }
    },

    DeleteReport: function(pages, code) {
      Shared.Printer.DeleteReport(pages, code);
      //$("#main-transaction-blockoverlay").hide();
      //if (!Global.isBrowserMode) {
      //    Shared.Printer.ClosePrinter();
      //    Shared.Printer.ReleasePrinterObjects();
      //}
    },

    LoadImages: function(pages, code, collection) {
      var reportUrl = Global.ServiceUrl + Method.REPORTS + code;

      for (var i = 1; i <= pages; i++) {
        retinaReport = reportUrl + i + ".png?" + Math.random();
        collection.add({
          "ImageURL": retinaReport,
          "ImageRetinaURL": retinaReport
        });
      }
      return collection;
    },

    ProcessPrintingImages: function(collection) {
      for (var i = 0; i < collection.length; i++) {
        Shared.Printer.SetReceiptPrintImage(collection.at(i).get("ImageRetinaURL"));
      }
    },

    InitializePrinterCollection: function() {
      if (!this.printerCollection) {
        this.printerCollection = new PrinterCollection();
        this.printerCollection.on('reset', this.SetValues, this);
      }
      this.printerCollection.fetch();
    },

    SetValues: function(collection) {
      var _model = collection.find(function(model) {
        return model.get("PrinterModel");
      });

      var _ip = collection.find(function(model) {
        return model.get("IpAddress");
      });

      if (_model) {
        Global.Printer.PrinterModel = _model.get("PrinterModel");
      }

      if (_ip) {
        Global.Printer.IpAddress = _ip.get("IpAddress");
      }
    },

    ProcessPrintReceipt: function() {
      if (!Global.isBrowserMode) {
        this.OpenPrinter();
        this.PrintReceipt();
      }
      Shared.LockTransactionScreen(false);
    },

    ProcessPrintReceiptFromBrowser: function(pageSettings, transactionCode) {
      //Shared.LockTransactionScreen(true, "Printing");
      if (Global.Preference.UseCashDrawer) Shared.PrintBrowserMode.PrintReceiptFromBrowser(pageSettings, transactionCode);
    },

    OpenPrinter: function() {
      Shared.Printer.OpenPrinter(Global.Printer.IpAddress);
    },

    PrintReceipt: function() {
      Shared.Printer.PrintReceipt();
      Global.isOkToOpenCashDrawer = false;
    },
  });
  return PrinterView;
});
