/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'collection/printers',
  'model/reportsetting',
  'text!template/19.1.0/pos/print/printpreview.tpl.html',
  'js/libs/iscroll.js',
], function($, $$, _, Backbone, Global, Shared, PrinterCollection, ReportSettingModel, template) {
  var _isOpen = false;
  var PrintPreviewView = Backbone.View.extend({

    _template: _.template(template),

    events: {
      "tap #print-btn": "buttonPrint_tap",
      "change #printer-address": "selectMenuIP_changed",
      "change #printer-address-url": "txtInputIP_changed",
    },

    buttonPrint_tap: function(e) {
      e.preventDefault();
      if (!Global.isBrowserMode) this.GetValues();
      else Global.Printer.SelectedPrinter = $("#printer-address").find(":selected").text();
      $("#main-transaction-blockoverlay").trigger("click");
      this.trigger("print");
    },

    selectMenuIP_changed: function(e) {
      e.preventDefault();
      $("#print-btn").removeClass("ui-disabled");
      var printerIp = $("#printer-address").find(":selected").text();

      if (!Global.isBrowserMode) {
        $("#printer-address option:first-child").attr("selected", true);
        $("#printer-address").selectmenu("refresh");
        $("#printer-address-url").val(printerIp);
        this.GetPrinterModel(printerIp);
      } else {
        $("#printer-address option[value='" + printerIp + "']").attr("selected", true);
        $("#printer-address").selectmenu("refresh");
      }
    },

    txtInputIP_changed: function(e) {
      e.stopImmediatePropagation();
      var ip = $("#printer-address-url").val();
      if ($("#printer-status span").text() != "No printer detected. Please turn on printer.") {
        if ($("#printer-address option[value='" + ip + "']").length === 0) {
          $("#printer-address").append(new Option(ip, ip));
        }

        if (this.ValidateIPAddressEntered(ip)) this.GetPrinterModel(ip);
      }

    },

    render: function() {
      this.$el.html(this._template);
      this.$el.trigger("create");

      this.OverrideCSS();

      if (!Global.isBrowserMode) {
        this.PopulatePrinterIpAddress(Global.Printer.IpAddress);
        this.PopulatePrinterModel(Global.Printer.PrinterModel);
      } else {
        $('#printer-address-url').remove();
        $('#printModel').remove();
        if ($('.ui-select').hasClass('ui-select')) {
          $("#printer-address option:first-child").remove();
          $('.ui-select').attr('style', 'width: 310px !important');
        }
        $('#print-btn').attr('style', 'margin-left: 0px !important; width: 275px; text-align: center;');
        $('#print-btn').addClass("ui-disabled");
        //this.PopulateAvailablePrinters();
        // this.InitializeApplet();
      }
    },

    GetValues: function() {
      this.printerIP = $("#printer-address-url").val();
      this.printerModel = $("#printModel").val();
    },

    GetPrinterModel: function(ip) {
      var self = this;
      $("#printModel").prop("enabled", true);
      var element = $("#printModel");

      if (!Global.isBrowserMode) {
        window.plugins.cbReceiptPrint.GetPrinterModel(
          ip,
          function(result) {
            console.log(result);
            self.SetDefaultPrinterModel(result);
            $("#printer-status span").text(
              "Printer IP and Model found."
            );
          },
          function(result) {
            console.log(result);
            self.SetDefaultPrinterModel("Printer model not supported");
            //$("#printer-status span").text(result);
            // if(!Shared.IsNullOrWhiteSpace(element.val())){
            //     element.val("");
            // }
          }
        );
      } else {
        this.SetDefaultPrinterModel("Printer model not supported");
      }
    },

    InitializePrinterCollection: function() {
      if (!this.printerCollection) {
        this.printerCollection = new PrinterCollection();
        this.printerCollection.on('add', this.SetValues, this);
      }

      this.printerCollection.fetch();
      $("#main-transaction-blockoverlay").show();
    },

    MonitorFindingDefaultPrinter: function() {
      var applet = document.jzebra;
      var self = this;
      if (applet != null) {
        if (!applet.isDoneFinding()) {
          console.log("isDoneFindingDP FALSE");
          window.clearInterval(this.findingDPinterval);
          this.findingDPinterval = window.setInterval(function() {
            self.MonitorFindingDefaultPrinter()
          }, 250);
        } else {
          console.log("isDoneFindingDP TRUE");
          window.clearInterval(this.findingDPinterval);
          var printerList = applet.getPrinters().split(",");
          var defaultPrinter = applet.getPrinter();
          var printerDropdown = document.getElementById("printer-address");

          if (printerList.length > 0 && printerList[0] != "") {
            $('#printer-address option[value=\'No Printer\']').remove();
            for (i in printerList) {
              var option = document.createElement("option");
              option.id = printerList[i];
              option.text = printerList[i];
              option.value = printerList[i];
              printerDropdown.appendChild(option);
              if (printerDropdown.options[i].innerHTML.indexOf(defaultPrinter) != -1) option.setAttribute('selected', 'selected');
            }
            $("#printer-address").selectmenu("refresh");
          }
          if (printerDropdown.value != "" && printerDropdown.value != "No Printer") $("#print-btn").removeClass("ui-disabled");
        }
      } else navigator.notification.alert("Applet is not loaded properly.", null, "Printing Failed");
    },

    InitializeApplet: function() {
      var jzebraApplet = "<applet name=\"jzebra\" code=\"jzebra.PrintApplet.class\" archive=\"js/libs/jzebra.jar\" width=\"0px\" height=\"0px\" style=\"position: absolute;\"></applet>";
      $('#jzebraApplet-container').html(jzebraApplet);
      console.log("Applet Loaded");
      var self = this;
      setTimeout(function() {
        self.PopulateAvailablePrinters();
      }, 1000);

    },

    MonitorFindingPrinters: function() {

      var applet = document.jzebra;
      var self = this;
      if (applet != null) {
        if (!applet.isDoneFinding()) {
          console.log("isDoneFindingPrinters FALSE");
          window.clearInterval(this.findingInterval);
          this.findingInterval = window.setInterval(function() {
            self.MonitorFindingPrinters()
          }, 250);
        } else {
          console.log("isDoneFindingPrinters TRUE");
          window.clearInterval(this.findingInterval);
          applet.findPrinter();
          this.MonitorFindingDefaultPrinter();
        }
      } else navigator.notification.alert("Applet is not loaded properly.", null, "Printing Failed");
    },

    OverrideCSS: function() {
      $("#main-transaction-blockoverlay").show();
      $("#print-details div.ui-select").attr("style", "width:40% !important; position: relative; left: 10px;");
      $("#print-btn").attr("style", "width: 12% !important; padding: 7px 42px !important; margin-left: 10px !important;");
      this.$("input").attr("style", "width:50% !important;");
    },

    PopulateAvailablePrinters: function() {
      var applet = document.jzebra;
      if (applet != null) {
        applet.findPrinter("\\{dummy printer name for listing\\}");
        this.MonitorFindingPrinters();
      } else navigator.notification.alert("Applet is not loaded properly.", null, "Printing Failed");
    },

    PopulatePrinterIpAddress: function(ip) {
      if (ip != "") {
        //$("#print-btn").removeClass("ui-disabled");
        $("#print-status span").text("Printer IP and Model found.");
        $("#printer-address-url").val(ip);
        if ($("#printer-address option[value='" + ip + "']").length === 0) {
          $("#printer-address").append(new Option(ip, ip));
        }
      }

      this.SearchPrinter(true);
    },

    PopulatePrinterModel: function(model) {
      console.log('Loaded - ' + model);
      if (model != "") {
        this.SetDefaultPrinterModel(Global.Printer.PrinterModel);
      } else {
        this.SetDefaultPrinterModel("No Printer Model specified");
      }
    },

    SearchPrinter: function(type) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();

      switch (type) {
        case true:
          if (!Global.isBrowserMode) {
            window.plugins.cbReceiptPrint.SearchPrinterIP();
            $("#print-status span").text("Searching for Printers within the network...");
          } else {
            $("#printer-address-url").val("No Printer");
          }
          break;
        default:
          if (!Global.isBrowserMode) {
            window.plugins.cbReceiptPrint.SearchPrinter();
            $("#print-status span").text("Searching for Printers within the network...");
          } else {
            $("#printer-address").trigger("change");
          }
          break;
      }
    },

    SetDefaultPrinterModel: function(PrinterModel) {
      $("#printModel").val(PrinterModel);
      /*
       * COMMENTED OUT TO PREVENT CHANGING PRINTERMODEL VALUE
       * SINCE IT MUST ALWAYS USE THE Global.Printer.IpAddress and Global.Printer.PrinterModel values set from SETTINGS
       */
      //if (PrinterModel != "Printer model not supported") Global.Printer.PrinterModel = PrinterModel;
    },

    SetValues: function(model) {
      if (model.get("PrinterModel")) {
        Global.Printer.PrinterModel = model.get("PrinterModel");
      }

      if (model.get("IpAddress")) {
        Global.Printer.IpAddress = model.get("IpAddress");
      }
    },

    ValidateIPAddressEntered: function(ip) {
      if (ip != "") return true;
      return false;
    },

    Show: function() {
      this.render();
      var hideMe = function(e) {
        $("#main-transaction-blockoverlay").off("click", hideMe);
        $("#printPreviewContainer").off("click", hideMe);
        $("#printSetupContainer-Wrapper").html("");
      }

      $("#main-transaction-blockoverlay").on("click", hideMe);
      $("#printPreviewContainer").on("click", hideMe);
    },

    Hide: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (!Global.isBrowserMode) Shared.Printer.ReleasePrinterObjects();
      this.$("#printPreview").remove();
      $("#main-transaction-blockoverlay").hide();

      Global.PrintOptions.Reprint = false;
    },

    isWorkstation: function() {
      if (this.receipt.get("SourceTransactionType") === "Workstation") return true;
      return false;
    },

    ReSearchPrinter: function() {
      this.Show();
      this.SearchPrinter(true);
    }


  });
  return PrintPreviewView;
});
