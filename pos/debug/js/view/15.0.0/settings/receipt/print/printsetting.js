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
  'shared/shared',
  'shared/method',
  'view/spinner',
  'collection/printers',
  'text!template/15.0.0/settings/receipt/print/printsetting.tpl.html',
  'js/libs/ui.checkswitch.min.js',
], function($, $$, _, Backbone, Global, Service, Shared, Method, Spinner, PrinterCollection, template) {
  var currentInstance = null;
  var PrintSettingsView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "change #radio-airprint-enabled": "airprintEnabled_changed",
      "tap #test-connect": "buttonConnect_tap",
      "change #radio-receipt-printer": "receiptPrinter_changed",
      "change #printer-address": "selectMenuIP_changed",
      "change #printer-address-url": "txtInputIP_changed"
    },

    /*ELEMENT CALLBACK*/
    airprintEnabled_changed: function(e) {
      var isAir = true;
      this.SetSelected(isAir);
    },

    buttonConnect_tap: function(e) {
      e.stopImmediatePropagation();
      var printerIp = $("#printer-address-url").val();
      var printerModel = $("#printModel").val();
      if (!Shared.IsNullOrWhiteSpace(printerIp) && !Shared.IsNullOrWhiteSpace(printerModel)) {
        //if(printerIp != "" && printerModel != "") {
        this.ShowActivityIndicator();
        this.Connect(printerIp, printerModel);
      } else {
        navigator.notification.alert("Please input Printer IP Address, choose printer model and tap 'Test Connection'", null, "Printer IP Address Empty", "OK");
      }
    },

    receiptPrinter_changed: function(e) {
      var isAir = false;
      this.SetSelected(isAir);
    },

    selectMenuIP_changed: function(e) {
      e.preventDefault();
      var printerIp = $("#printer-address").find(":selected").text();
      $("#printer-address option:first-child").attr("selected", true);
      $("#printer-address").selectmenu("refresh");
      $("#printer-address-url").val(printerIp);
      this.GetPrinterModel(printerIp);
    },

    txtInputIP_changed: function(e) {
      e.preventDefault();
      var ip = $("#printer-address-url").val();
      if ($("#printer-status span").text() != "No printer detected. Please turn on printer.") {
        if ($("#printer-address option[value='" + ip + "']").length === 0) {
          $("#printer-address").append(new Option(ip, ip));
        }
        if (this.ValidateIPAddressEntered(ip)) this.GetPrinterModel(ip);
      }
    },
    /*ELEMENT CALLBACK*/

    initialize: function() {
      if (!Shared.IsNullOrWhiteSpace(currentInstance)) currentInstance = this;
      this.model = this.options.model;
      this.InitializePrinterCollection();
      //this.InitializePrintPlugin();
      Shared.Printer.InitializePrintPlugin();
      this.render();
      $("#PrinterIpAddress").blur();
      $("#printer-setting-container div.ui-select").attr("style", "width:28% !important; position: relative; left: 12px;")
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);
      this.$el.trigger("create");
      this.AssignValues();
    },

    /*Added/Modified  by PR.Ebron ( 01.09.12 )
     *Task : AirPrint Settings >> JIRA ID : INTMOBA-390.*/
    AssignValues: function() {
      var isAir = this.model.get("IsAirprint");
      this.SetSelected(isAir);

      if (Global.Printer.PrinterModel != "") {
        this.SetDefaultPrinterModel(Global.Printer.PrinterModel);
      }
    },

    Connect: function(ip, model) {
      try {
        Shared.Printer.ConnectionTest(ip, model);
        this.HideActivityIndicator();
      } catch (e) {
        console.log("ERROR " + e);
      }

    },

    FindDeleteAndSave: function(type, collection, value) {
      var attr = "",
        attrib;

      switch (type) {
        case "ip":
          attr = "IpAddress";
          attrib = {
            IpAddress: value,
            IsValid: Global.Printer.IsValid
          };
          var ipAddress = collection.find(function(model) {
            return model.get(attr);
          });

          if (ipAddress) {
            ipAddress.destroy();
          }
          break;
        case "model":
          attr = "PrinterModel";
          attrib = {
            PrinterModel: value,
            IsValid: Global.Printer.IsValid
          };
          var printerModel = collection.find(function(model) {
            return model.get(attr);
          });

          if (printerModel) {
            printerModel.destroy();
          }
          break;
      }

      collection.create(attrib);
    },

    GetPrinterModel: function(ip) {
      var self = this;
      $("#printModel").prop("enabled", true);
      var element = $("#printModel");

      if (!Global.isBrowserMode) {
        window.plugins.cbReceiptPrint.GetPrinterModel(
          ip,
          function(result) {
            console.log("GETPRINTERMODEL[SUCCESS] - " + result);
            self.SetDefaultPrinterModel(result);
            if ($("#printer-address-url").val() === ip) {
              $("#printer-status span").text("Printer IP and Model found.");
            }
          },
          function(result) {
            console.log("GETPRINTERMODEL[ERROR] - " + result);
            self.SetDefaultPrinterModel("Printer model not found");
            $("#printer-status span").text(result);
            // if(!Shared.IsNullOrWhiteSpace(element.val())){
            // 	element.val("");
            // }
          }
        );
      } else {
        this.SetDefaultPrinterModel("Printer model not supported");
        $("#printer-status span").text(
          "Printer maybe offline or Printer IP address is not valid"
        );
      }
    },

    InitializePrinterCollection: function() {
      var self = this;
      if (!this.printerCollection) {
        this.printerCollection = new PrinterCollection();
        this.printerCollection.on('reset', this.SetValues, this);
        this.printerCollection.on('add', this.RetrieveAddValue, this);
      }

      this.printerCollection.fetch({
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          console.log(response);
          self.SetValues(model);
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Retrieving Printer List");
        }
      });
    },

    PopulatePrinterIpAddress: function(ip) {
      console.log("Global.Printer.IpAddress: " + ip);
      console.log("Global.Printer.PrinterModel: " + Global.Printer.PrinterModel);
      if (ip != "") {
        if (Global.Printer.PrinterModel != "Printer model not found") $("#printer-status span").text("Printer IP and Model found.");
        else $("#printer-status span").text("Printer maybe offline or Printer IP address is not valid");
        $("#printer-address-url").val(ip);
        if ($("#printer-address option[value='" + ip + "']").length === 0) {
          $("#printer-address").append(new Option(ip, ip));
        }
      }

      this.SearchPrinter(true);
    },

    PopulateSelectElement: function(isAirprint) {
      if (isAirprint) {
        $('#test-connect').addClass("ui-disabled");
        $("#printModel").addClass("ui-disabled");

        $("#printer-address-url").addClass("ui-disabled");

        $("#printer-address").selectmenu('disable');
        $("#btn-addUrl").addClass("ui-disabled");
      } else {
        this.PopulatePrinterIpAddress(Global.Printer.IpAddress);

        $("#test-connect").removeClass("ui-disabled");
        $("#printer-address-url").removeClass("ui-disabled");
        $("#printModel").removeClass("ui-disabled");
        $("#printer-address").selectmenu('enable');
      }
    },

    RetrieveAddValue: function(model) {
      if (model) {
        if (model.get("IpAddress") != "No Printer") Global.Printer.IpAddress = model.get("IpAddress");
        if (model.get("PrinterModel") != "Printer model found") Global.Printer.PrinterModel = model.get("PrinterModel");
      }
    },

    ResetLocalStorageCollection: function(collection) {
      for (var i = collection.length - 1; i >= 0; i--) {
        collection.at(i).destroy();
      }
    },

    Save: function() {
      var self = this;
      var printerIp = $("#printer-address-url").val();

      var printerModel = $("#printModel").val();
      if (printerModel != "Printer model not found" || printerIp != "No Printer") {
        this.ResetLocalStorageCollection(this.printerCollection);
        this.SavePrinterModel(printerModel); //don't save to localstorage if model is not supported
        this.SaveIpAddress(printerIp); //don't save to localstorage if there is no Printer found
      }
      this.UpdateReceiptPreference();
    },

    SaveIpAddress: function(ipAddress) {
      this.FindDeleteAndSave("ip", this.printerCollection, ipAddress);
    },

    SavePrinterModel: function(printerModel) {
      this.FindDeleteAndSave("model", this.printerCollection, printerModel);
    },

    SearchPrinter: function(type) {
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

      $("#test-connect").removeClass("ui-disabled");

      if (PrinterModel != "Printer model not found") Global.Printer.PrinterModel = PrinterModel;
    },

    SetPreferences: function(preferences) {
      //this is the collection that holds the entire POSPreferenceGroup
      this.preferences = preferences
    },

    SetSelected: function(isAirprint) {
      this.isAirprint = isAirprint;
      if (isAirprint) {
        $("#radio-airprint-enabled").attr('checked', true).checkboxradio("refresh");
        $('#radio-receipt-printer').attr('checked', false).checkboxradio("refresh");
      } else {
        $("#radio-airprint-enabled").attr('checked', false).checkboxradio("refresh");
        $('#radio-receipt-printer').attr('checked', true).checkboxradio("refresh");
      }

      this.PopulateSelectElement(isAirprint);
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
        console.log("SetValues - " + Global.Printer.IpAddress);
      }
    },

    UpdatePreference: function() {
      var _isAir = true;
      var printerAtrribute = {};
      _isAir = this.isAirprint;

      if (_isAir) printerAtrribute = {
        IsAirprint: _isAir,
        UseCashDrawer: false,
        AutoPrintReceipt: false
      };
      else printerAtrribute = {
        IsAirprint: _isAir
      };

      this.model.set(printerAtrribute);
    },

    UpdateReceiptPreference: function() {
      if (!this.model || !this.preferences || this.preferences.length === 0) {
        return;
      } else {
        this.UpdatePreference();
        var _self = this;
        var _preferenceModel = this.preferences.at(0)
        _preferenceModel.set({
          Preference: this.model
        });

        _preferenceModel.url = Global.ServiceUrl + Service.POS + Method.UPDATEPREFERENCE;
        _preferenceModel.save(null, {
          success: function(model, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            _self.trigger("SaveCompleted");
            _self.remove();
            _self.unbind();
          },
          error: function(model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.RequestError(error, "Error Saving Printer Preference");
          }
        });
      }
    },

    ValidateIPAddressEntered: function(ip) {
      if (!Shared.IsNullOrWhiteSpace(ip)) return true;
      return false;
    },

    /* Activity Indicator */
    ShowActivityIndicator: function() {
      var target = document.getElementById('test-connect');
      _spinner = Spinner;
      _spinner.opts.left = -8; // Left position relative to parent in px
      _spinner.opts.radius = 3;
      _spinner.opts.lines = 9;
      _spinner.opts.length = 4; // The length of each line
      _spinner.opts.width = 3; // The line thickness
      _spinner.opts.color = '#000';
      $("#test-connect").text("Connecting...   ");
      _spinner.spin(target, "Connecting...");
      $("#test-connect").css("text-align", "right");
      $("#test-connect").addClass("ui-disabled");
    },

    HideActivityIndicator: function() {
        _spinner = Spinner;
        _spinner.stop();
        $("#test-connect").removeClass("ui-disabled");
        $("#test-connect").text("Test Connection");
        $("#test-connect").css("text-align", "center");
      }
      /* Activity Indicator */
  });

  var allowSearchPrinter = function(button) {
    currentInstance.HideActivityIndicator();
    if (button === 1) {
      console.log(button + " Allowed Search");
      $("#printer-address-url").val("");
      currentInstance.SearchPrinter(true);
    }
  };

  return PrintSettingsView;
})
