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
  'shared/shared',
  'model/base',
  'collection/base',
  'model/reportsetting',
  'view/16.0.0/pos/print/printer',
  'view/16.0.0/pos/print/printpreview',
  'text!template/16.0.0/pos/print/dynamicprint.tpl.html',
  'text!template/16.0.0/pos/print/print.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Service, Method, Shared, BaseModel, BaseCollection, ReportSettingModel, PrinterView, PrintSetup, template, browserprintTemplate) {
  var reportURL = null,
    currentInstance;
  var DynamicPrintView = Backbone.View.extend({
    _template: _.template(template),
    _browserPrintTemplate: _.template(browserprintTemplate),
    events: {
      "tap #btn-print": "btnPrint",
      "tap #btn-cancel": "btnCancel"
    },

    btnCancel: function(e) {
      e.preventDefault();
      Global.PrintPluginLoaded = false; //added by pau 12.28.12
      this.Close();
    },

    btnPrint: function(e) {
      e.preventDefault();

      if (Global.isBrowserMode) this.ProcessPrintReceipt();
      else {
        //RECEIPT PRINTER
        if (this.IsReceiptPrinter) {
          this.ProcessPrintReceipt();
          return;
        }

        //AIR PRINT
        this.top = 87;
        if (Global.ApplicationType == "Reports") {
          this.top = 64;
        } else if (!Global.ApplicationType == "Reports") {
          this.on("closed", this.Close);
        }

        if (!Global.PrintPluginLoaded) {
          Global.PrintPluginLoaded = true;
          Shared.Printer.PrintAirPrintReceipt(this.pdfUrl, this);
        }
      }
    },

    initialize: function() {
      this.IsReceiptPrinter = this.options.IsReceiptPrinter;
      this.IsWorkstation = this.options.IsWorkstation;
    },

    render: function() {
      this.transactionCode = this.model;
      if ((Global.ApplicationType == 'Reports') == false) {
        if (Global.isBrowserMode) {
          this.InitializeBrowserPrintPreview();
        } else {
          this.$el.html(this._template);
          if (Global.isOkToOpenCashDrawer && Global.Preference.UseCashDrawer) {
            //Shared.Printer.DrawerKick();
          }
        }
      }

      $("#main-transaction-blockoverlay").show();

      this.reportType = this.options.reportType;
      if (!Global.isBrowserMode) {
        this.collection = this.LoadImages(this.pageSettings, this.transactionCode);
        var self = this;

        $("#print-area").css('overflow', 'hidden');

        var cnt = 0,
          imgLoaded = 0;
        var imgCnt = this.collection.models.length;
        var doFinalizer = function() {
          if (imgLoaded == imgCnt) self.RenderFinalize();
          else loadImageByModel();
        }

        var loadImageByModel = function() {
          cnt++;
          var model = self.collection.at(cnt - 1);
          if (!model) return;
          var imgID = "printImg" + cnt;
          var imgObj = new Image();

          imgObj.onload = function() {
            console.log('IMAGE LOADED: ' + imgID);
            self.$("#print-preview-container > tbody").append(imgObj);
            self.$("#print-preview-container > tbody").append("<br/>");
            imgLoaded++;
            doFinalizer();
          }

          imgObj.id = imgID;
          imgObj.src = model.get("ImageURL");
        }

        loadImageByModel();
      }
    },

    CheckReportType: function(reportType) {
      switch (reportType) {
        case Global.ReportCode.Invoice:
        case Global.ReportCode.Order:
        case Global.ReportCode.Quote:
        case Global.ReportCode.Payment:
          this.imgWidth = "290";
          break;
        default:
          this.imgWidth = "740";
          break;
      }
    },

    Close: function() {
      Global.PrintOptions.Reprint = false;
      Global.PrintPluginLoaded = false;

      Shared.Printer.DeleteReport(this.pageSettings.Pages, this.transactionCode);


      if (this.IsReceiptPrinter)
        if (!Global.isBrowserMode) this.ClosePrinter();

      this.$el.hide();
      if (!Global.isBrowserMode) $("#main-transaction-blockoverlay").hide();

      if (Global.ApplicationType === "Kiosk") {
        Global.Kiosk.Cart = null;
        Global.Kiosk.Total = null;
        Global.Kiosk.Customer = null;
        Global.Kiosk.SerialLot = null;
        window.location.hash = "kiosk";
      }

      if (!this.IsWorkstation && Global.Preference.AutoSignOutUser) {
        if (!Global.PreviousReprintValue) {
          this.trigger("AutoSignOut", this);
        } else {
          Global.PreviousReprintValue = false;
        }
      } else {
        this.trigger("formclosed", this);
      }

      if (this.printsetup) {
        this.printsetup.unbind();
        this.printsetup.remove();
      }

      Shared.FocusToItemScan();
      this.Dispose();
    },

    ClosePrinter: function() {
      //Shared.Printer.ClosePrinter();
      Shared.Printer.ReleasePrinterObjects();
    },

    Dispose: function() {
      if (Global.ApplicationType != "Reports") {
        if (!Global.isBrowserMode) $("#main-transaction-blockoverlay").hide();
        this.unbind();
        this.remove();
      } else {
        if (Global.isBrowserMode) {
          $("#previewContainer").attr('style', 'display: block');
          $(".arrow").remove();
        }
      }
    },

    InitializeBrowserPrintPreview: function() {
      if (Global.isBrowserMode && !(Global.ApplicationType == 'Reports')) {
        this.transactionCode = this.model;
        $("#main-transaction-blockoverlay").show();
        this.$el.html(this._browserPrintTemplate({
          transactionCode: this.transactionCode,
          ServiceUrl: Global.ServiceUrl
        }));
        Shared.PrintBrowserMode.DrawerKick();
      }
    },

    Show: function(pageSettings, transactionCode, reportType) {
      this.pageSettings = pageSettings;

      if (Global.ApplicationType == "Reports") {
        this.model = transactionCode;
        this.options.reportType = reportType;

        if (Global.isBrowserMode) {
          //Shared.UseBrowserScroll("#customizePrintContainer");
          $('#print-area').removeAttr('style');
        }
      }

      if (Global.isBrowserMode) {
        var isSilentPrint = ((Global.Preference.AutoPrintReceipt && Global.PrintOptions.SilentPrint) || Global.PrintOptions.SilentPrint);
        if (pageSettings.IsPrintPickNote) isSilentPrint = true;
        if (isSilentPrint) {
          var transactionCode = this.model;
          var pages = parseInt(this.pageSettings.Pages);
          if (!pageSettings.IsPrintPickNote && !this.IsWorkstation && Global.Preference.AutoSignOutUser && !Global.PrintOptions.Reprint) this.trigger("AutoSignOut", this);
          Shared.PrintBrowserMode.Print(transactionCode, pages);
          //if (!this.IsWorkstation && Global.Preference.AutoSignOutUser && !Global.PrintOptions.Reprint) this.trigger("AutoSignOut", this);
          Global.PrintOptions.Reprint = false;
        } else {
          this.InitializeBrowserPrintPreview();
        }
      } else {
        if (this.IsReceiptPrinter) {
          //RECEIPT PRINTER
          this.InitializeReceiptPrinter(pageSettings.IsPrintPickNote);
        } else {
          //AIR PRINT
          this.render();
          if (!Global.isBrowserMode) Shared.Printer.LoadAirPrintPlugin();
        }
      }
    },

    RenderFinalize: function() {
      this.$el.show();
      this.RetrieveImageWidth();
    },

    LoadImages: function(pageSettings, code) {
      var images = new BaseCollection();
      var reportUrl = Global.ServiceUrl + Method.REPORTS + code;
      this.pdfUrl = reportUrl + ".pdf?" + Math.random(); //Added Math.random() to prevent cached image from loading.
      for (var i = 1; i <= pageSettings.Pages; i++) {
        retinaReport = reportUrl + i + ".png?" + Math.random();
        if (this.IsReceiptPrinter) smallResReport = reportUrl + i + "@small.png?" + Math.random();
        else smallResReport = retinaReport;
        images.add({
          "ImageURL": smallResReport,
          "ImageRetinaURL": retinaReport
        });
      }
      return images;
    },

    RetrieveImageWidth: function() {
      var images = this.$('#print-preview-container').find("> tbody > img");

      for (var i = 0; i < images.length; i++) {
        //console.log("WIDTH: " + images[i].clientWidth);
        if (images[i].clientWidth >= 740) {
          $(images[i]).addClass('previewSizeToFit');

        } else {
          $(images[i]).removeClass('previewSizeToFit');
        }
      }
      this.RefreshMyScroll();
    },

    RefreshMyScroll: function() {
      if (Global.isBrowserMode) {
        //  Shared.UseBrowserScroll("#customizePrintContainer");
        $('#print-area').removeAttr('style');
      } else {
        if (!this.myScroll) {
          this.myScroll = new iScroll('print-area', {
            vScrollbar: true,
            vScroll: true,
            snap: false,
            momentum: true,
            zoom: true
          });
        } else {
          this.myScroll.destroy();
          this.myScroll = null;
          $("#print-preview-container").removeAttr("style");
          this.myScroll = new iScroll('print-area', {
            vScrollbar: true,
            vScroll: true,
            snap: false,
            momentum: true,
            zoom: true
          });
          this.myScroll.refresh();
        }
      }
    },

    //BEGIN - RECEIPT PRINTER FUNCTIONS
    InitializeReceiptPrinter: function(isPrintPickNote) {

      //For Z-Tape Drawer Kick - CSL-21683
      if (Global.ApplicationType == "Settings") {
        Shared.Printer.DrawerKick();
      } else {
        if (this.IsWorkstation && !Global.PreventDrawerKick && Global.Preference.UseCashDrawer) Shared.Printer.DrawerKick();
      }

      if (!this.receiptPrint) {
        this.receiptPrint = new PrinterView({
          el: this.$el
        });
        this.receiptPrint.NoPreview = true;
        this.receiptPrint.on("SignOut", this.ProcessSignOut, this);
        this.receiptPrint.on("ShowPreview", this.render, this);
        this.receiptPrint.on("PrintFinish", this.Dispose, this);
        this.receiptPrint.on("kioskPrint", this.ProcessReloadKiosk, this);
      }

      this.receiptPrint.ProcessPrinting(this.pageSettings, this.model, this.IsWorkstation, isPrintPickNote);
    },

    ProcessReloadKiosk: function() {
      this.trigger("kioskPrint", this);
    },

    ProcessSignOut: function() {
      this.trigger("AutoSignOut", this);
    },

    ProcessPrintFromBrowser: function() {
      var transactionCode = this.model;
      Shared.LockTransactionScreen(true, "Printing");
      Shared.PrintBrowserMode.PrintReceiptFromBrowser(this.pageSettings, transactionCode);
      this.Close();
    },

    ProcessPrintReceipt: function() {
      var self = this;
      $("#modalBg").show();
      $("#printSetupContainer").html('<div id="printSetupContainer-Wrapper"></div>');
      this.printsetup = new PrintSetup({
        el: "#printSetupContainer-Wrapper"
      });
      if (!Global.isBrowserMode) {
        this.printsetup.on('print', function() {
          self.printerIP = self.printsetup.printerIP;
          self.printerModel = self.printsetup.printerModel;

          console.log("ISOPEN: " + Global.Printer.isPrinterOpen);
          if (self.ValidatePrinter()) {
            self.OpenPrinter();
            self.PrintReceipt();
          }
        });
      } else {
        this.printsetup.on('print', function() {
          self.ProcessPrintFromBrowser();
        });
      }

      this.printsetup.Show();
      if (Global.ApplicationType == "Reports") {
        $("#printSetup-Pointer").hide();
      }
    },

    OpenPrinter: function() {
      Shared.Printer.OpenPrinter(this.printerIP);
    },

    PrintReceipt: function() {
      Shared.Printer.PrintReceipt();
      Global.isOkToOpenCashDrawer = false;
      if (Global.ApplicationType == "Reports") {
        $("#printerSetup-div").hide();
      }
    },

    SearchPrinter: function() {
      console.log("Searching");
      this.printsetup.ReSearchPrinter();
    },

    ValidatePrinter: function() {
      currentInstance = this;
      if (Shared.Printer.Validate(this.printerIP, this.printerModel)) return true;
      //else navigator.notification.confirm("IP address is invalid. Do you want to search the network for valid IP address instead?", allowSearchPrinter, "Unable to Print receipt", ['Ok', 'Cancel']); //navigator.notification.alert("Please Specify the correct IP address of the printer...", null, "Unable to print Receipt", "OK");
      return false;
    }
  });

  var allowSearchPrinter = function(button) {
    if (button === 1) {
      console.log(button + " Allowed Search");
      currentInstance.SearchPrinter();
    }
  };

  return DynamicPrintView;
})
