define([
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'model/reportsetting',
  'model/lookupcriteria',
  'collection/base',
  'collection/reportsettings',
  'view/19.1.0/pos/print/dynamicprint',
  'view/19.1.0/reports/print/printdialog',
  'text!template/19.1.0/reports/print/preview.tpl.html',
  'text!template/19.1.0/reports/print/printarea.tpl.html'
], function(Backbone, Global, Service, Method, Shared,
  BaseModel, LookUpCriteriaModel, ReportSettingModel,
  BaseCollection, ReportSettingCollection,
  PrintView, PrintDialogView,
  template, printAreaTemplate) {
  var printDialog_el = "#printDialog-div";
  var printDialog = "#printDialog";
  var printSetup_el = "#printerSetup-div";
  var spinner_el = "#reports-spinner";
  var spinner_label = "#spinnerLabel";
  var no_record_el = ".no-record-found";
  var reportOptions_el = "#previewControls";
  var cmdPrint = "#btn-print";
  var printAreaContainer = "#customizePrintContainer";
  var _currentForm = null;
  var _reportToPrintModel = null;

  var TransactionTypes = {
    SalesOrder: "Sales Order",
    Quote: "Quote",
    Sale: "Invoice",
    Return: "Credit Memo"
  }
  var TapeReports = {
    Xtape: "X-Tape",
    Ztape: "Z-Tape"
  }

  var ReportsPrintPreview = Backbone.View.extend({

    _template: _.template(template),
    _printAreaTemplate: _.template(printAreaTemplate),

    initialize: function() {
      this.render();
    },
    events: {
      "tap #btn-printDialog": "ShowPrintDialog",
      "tap #btn-print": "ShowPrintSetup",
      "tap #btn-printPreview": 'TogglePrintPreview'
    },
    render: function() {
      this.isLoaded = false;
      this.$el.html(this._template);
      _currentForm = this;
      return this;
    },
    InitializeChildViews: function() {
      if (Global.isBrowserMode) $(cmdPrint).hide();
    },
    InitializePrintDialog: function() {
      $(printDialog).html("<div id='printDialog-div' style='display: none;'></div>");
      if (Shared.IsNullOrWhiteSpace(this.printdialogView)) {

        this.printdialogView = new PrintDialogView({
          el: $(printDialog_el)
        });
      } else {
        this.printdialogView.remove();
        this.printdialogView = new PrintDialogView({
          el: $(printDialog_el)
        });
      }
      console.log("ShowPrintDialog");
      this.printdialogView.on('Apply', this.ApplyCriteria, this)
      this.printdialogView.on('ChangePreview', this.PrindailogOnChangePreview, this);
      this.printdialogView.InitializeChildViews(this.genReportDatasource, this.reportCode);
    },
    PrindailogOnChangePreview: function() {
      console.log("ChangePreview");
      this.printdialogView.unbind();
      this.printdialogView = null;
    },
    ApplyCriteria: function(reportCode, collection) {
      var transactionCode = "";
      var hasWorkStationID = false;
      var hasType = false;
      var self = this;
      this.hasPOSWorkStationID = false;
      this.isPreview = false;
      this.parameterCollection = new BaseCollection();
      this.parameterCollection.reset();
      collection.each(function(model) {
        switch (model.get("ColumnName").toString().toUpperCase()) {
          case "INVOICECODE":
          case "TRANSACTIONCODE ":
          case "SALESORDERCODE":
            transactionCode = model.get("CriteriaValue");
            self.parameterCollection.add(model);
            break;
          case "POSWORKSTATIONID":
            self.hasPOSWorkStationID = true;
            self.parameterCollection.add(model);
            break;
          case "WORKSTATIONID":
          case "@WORKSTATIONID":
            hasWorkStationID = true;
            self.parameterCollection.add(model);
            break;
          default:
            self.parameterCollection.add(model);
            break;
        }

      });
      var onSuccess = function(collection) {
        var transactionType = "";
        collection.each(function(model) {
          var _subCategory = model.get("SubCategory");
          var _reportCode = model.get("ReportCode");
          switch (_subCategory) {
            case TransactionTypes.SalesOrder:
              if (_reportCode == reportCode) {
                transactionType = TransactionTypes.SalesOrder;
              }
              break;
            case TransactionTypes.Quote:
              if (_reportCode == reportCode) {
                transactionType = TransactionTypes.Quote;
              }
              break;
            case TransactionTypes.Sale:
              if (_reportCode == reportCode) {
                transactionType = TransactionTypes.Sale;
              }
              break;
            case TransactionTypes.Return:
              if (_reportCode == reportCode) {
                transactionType = TransactionTypes.Return;
              }
              break;
          }
        });
        console.log("TRANSACTION TYPE : " + transactionType);
        self.GenerateReport(reportCode, transactionCode, hasWorkStationID, true, transactionType);
      }
      Shared.Reporting.GetReportSubCategory(onSuccess, reportCode);
    },
    ShowPrintDialog: function(e) {
      e.preventDefault();
      if (this.isLoaded == true) {
        this.InitializePrintDialog();
        this.printdialogView.Show();
      }
    },
    ShowPrintSetup: function(e) {
      e.preventDefault();
      if (this.isLoaded == true) {
        if (Global.Preference.IsAirprint == false) {
          if (this.IsNullOrWhiteSpace(this.noPreview) || this.noPreview == false) {
            $(printSetup_el).show();
          }
        }
      }
    },
    InitializeReportSettingModel: function() {
      if (!this.model) {
        this.model = new ReportSettingModel();
      } else {
        this.model.unbind();
        this.model = new ReportSettingModel();
      }
    },
    ChangeReportPreview: function(model, isPreview) {
      var _model = new BaseModel();
      _model.set(model);
      var _reportCode = _model.get("ReportCode");
      this.genReportDatasource = _model.get("DatasourceName");
      this.reportCode = _reportCode;
      this.reportName = _model.get("ReportName");
      if (!Shared.IsNullOrWhiteSpace(this.printdialogView)) this.printdialogView.trigger('ChangePreview');
      if (!Shared.IsNullOrWhiteSpace(isPreview)) {
        this.isPreview = isPreview;
      }
      this.GenerateReport(_reportCode);
    },

    GenerateReport: function(_reportCode, transactionCode, hasWorkstationID, isPrintByPrintDialog, transactionType) { //15x // jj
      $(no_record_el).hide();
      this.isLoaded = false;
      this.noPreview = false;
      var preference = Global.Preference;
      var reportService = Global.ServiceUrl + "ReportService.svc";
      var reportCode = _reportCode;
      var serviceContentUri;

      var myDate = new Date();
      var displayDate = (myDate.getMonth() + 1) + (myDate.getDate()) + myDate.getFullYear() + myDate.getHours() + myDate.getMinutes() + myDate.getSeconds();

      if (Shared.IsNullOrWhiteSpace(transactionCode)) {
        //generate temporary transaction code if transaction code is not supplied
        transactionCode = _reportCode + displayDate;
      }
      this.InitializeReportSettingModel();

      if (Global.isBrowserMode) {
        serviceContentUri = Global.ServiceUrl + Service.POS + Method.SAVEREPORT;
      } else {
        serviceContentUri = Global.ServiceUrl + Service.POS + Method.EXPORTREPORT;
      }

      this.reportFileName = transactionCode.toString().toUpperCase();
      var self = this;

      var _parameters = this.CreateReportSettingParameters(reportCode);

      this.transactionCode = transactionCode;
      var _reportModel = new BaseModel();
      var onSuccess = function(collection) {

        if (Shared.IsNullOrWhiteSpace(hasWorkstationID)) {
          if (self.AllowAutoAssignWorkstationID(transactionType)) {
            Shared.Reporting.AssignWorkstationID(_parameters, collection);
          }
        }

        if (Shared.IsNullOrWhiteSpace(self.HasPOSWorkStationID(_parameters)) && !Shared.IsNullOrWhiteSpace(hasWorkstationID)) {
          if (self.AllowAutoAssignWorkstationID(transactionType)) {
            Shared.Reporting.AssignPOSWorkstationID(_parameters, collection);
          }
        }

        if (!Shared.IsNullOrWhiteSpace(transactionType)) {
          var hasType = _.find(collection.models, function(model) {
            return (model.get('ColumnName') === 'Type');
          });

          if (hasType) {
            self.AssignTransactionType(transactionType, _parameters);
          }
        }

        _reportModel.set({
          ServiceUri: reportService,
          ServiceContentUri: serviceContentUri,
          ReportName: reportCode,
          UserName: Global.Username,
          Password: Global.Password,
          Parameters: _parameters,
          IsEmail: false,
          IsAirPrint: preference.IsAirprint,
          RecipientEmailAddress: Global.PrintOptions.EmailAddress,
          IsReportPreview: self.isPreview,
          IsGeneratedByReportingModule: true,
        });
        self.ProcessGenerateReport(_reportModel, (Shared.IsNullOrWhiteSpace(isPrintByPrintDialog)));
      }
      Shared.Reporting.GetReportCriterias(onSuccess, this.genReportDatasource, reportCode);
    },

    HasPOSWorkStationID: function(parameters) {
      if (parameters.length > 0) {
        for (var i = 0; i < parameters.length; i++) {
          if (parameters.models[i].attributes['Name'] == '[POSWorkstationID]') {
            return true;
          }
        }
      }
      return false;
    },

    AllowAutoAssignWorkstationID: function(transactionType) {
      var isAllow = false;
      switch (transactionType) {
        case TransactionTypes.SalesOrder:
        case TransactionTypes.Quote:
        case TransactionTypes.Sale:
        case TransactionTypes.Return:
          isAllow = true;
          break;
      }
      return isAllow;
    },

    AssignTransactionType: function(transactionType, _parameters) {
      var isExist = this.parameterCollection.find(function(model) {
        return (model.get("ColumnName") == "Type");
      });
      if (Shared.IsNullOrWhiteSpace(isExist)) {
        _parameters.add([{
          Name: "[Type]",
          Value: transactionType
        }]);
      }
      return _parameters;
    },

    ReportPreviewError: function() {
      this.RemoveSpinner();
      console.log("error");
    },
    RemoveSpinner: function() {
      $(spinner_el).hide();
    },

    PromtWarningMessage: function(response, reportModel) {
      if (!Shared.IsNullOrWhiteSpace(response.WarningMessage)) {
        _reportToPrintModel = new BaseModel();
        _reportToPrintModel = reportModel;
        var warningMessage = "You are about to load " + this.reportName + " report with more than a thousand records. For better performance, we recommend applying proper data filter. Do you want to continue?";
        navigator.notification.confirm(warningMessage, _processGeneratePreview, "Print Preview", ['Yes', 'No']);
      } else {
        this.RemoveSpinner();
        this.ReportSettingSaveSuccess(response);
      }
    },
    CancelApplyCriteria: function() {
      this.RemoveSpinner();
      this.ClosePrintDialogView();
    },
    ClosePrintDialogView: function() {
      if (!Shared.IsNullOrWhiteSpace(this.printdialogView)) {
        this.printdialogView.Close();
        this.isLoaded = true;
      }
    },
    ProcessGenerateReport: function(reportModel, skipValidateReport) {
      console.log("Processing Generate Report");
      $(spinner_el).show();
      if (!skipValidateReport) {
        $(spinner_label).text("Loading this may take a while...");
      } else {
        $(spinner_label).text("Loading...");
      }
      this.ClosePrintDialogView();
      var self = this;
      this.skipValidateReport = skipValidateReport;
      this.reportModel = new BaseModel();
      this.reportModel = reportModel;

      this.model.set({
        ServiceUri: reportModel.get("ServiceUri"),
        ServiceContentUri: reportModel.get("ServiceContentUri"),
        ReportName: reportModel.get("ReportName"),
        UserName: Global.Username,
        Password: Global.Password,
        Parameters: reportModel.get("Parameters"),
        IsEmail: false,
        IsAirPrint: reportModel.get("IsAirPrint"),
        RecipientEmailAddress: Global.PrintOptions.EmailAddress,
        IsReportPreview: self.isPreview,
        IsGeneratedByReportingModule: true,
        ReportFileName: self.reportFileName,
        IsSkipValidateReport: self.skipValidateReport
      });
      this.model.url = reportModel.get("ServiceContentUri");
      this.model.on('error', this.ProccessGenerateReportOnError, this);
      this.model.on('sync', this.ProccessGenerateReportOnSuccess, this);
      this.model.save(null, {
        timeout: 0
      });
    },
    ProccessGenerateReportOnSuccess: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (this.skipValidateReport) {
        this.ReportSettingSaveSuccess(response);
        this.RemoveSpinner();
      } else {
        this.PromtWarningMessage(response, this.reportModel);
      }
    },
    ProccessGenerateReportOnError: function(model, error, response) {
      var _errorMessage = "";
      switch (error.statusText) {
        case "timeout":
          _errorMessage = "Request timed Out. Check internet settings and try again.";
          break;
        case "abort":
          _errorMessage = "Unable to process request. Please check your internet settings.";
          break;
        default:
          _errorMessage = "Unable to generate report. For better performance, we recommend applying proper data filter or try again using Connected Business."
          break;
      }
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.ReportPreviewError();
      this.NoRecordFound();
      this.ShowPreviewMessage();
      $(cmdPrint).hide();
      this.ClosePrintDialogView();

      navigator.notification.alert(_errorMessage, null, "Unable to Generate report.", "OK");
      this.ClosePrintDialogView();
    },
    ReportSettingSaveSuccess: function(response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (Global.PrintOptions.CustomizePrint) {
        this.isReceiptPrinter = false;
      } else {
        this.isReceiptPrinter = true;
      }
      if (!Shared.IsNullOrWhiteSpace(response.ErrorMessage)) {
        navigator.notification.alert(response.ErrorMessage, null, "Unable to Generate Report", "OK");
        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        this.ReportPreviewError();
        this.NoRecordFound();
        this.ShowPreviewMessage();
        $(cmdPrint).hide();
        return;
      }
      this.PreviewReport_(response, this.transactionCode, "", this.isReceiptPrinter, false);

    },

    CreateReportSettingParameters: function(reportCode) {
      var _parameters = new ReportSettingCollection();
      if (!Shared.IsNullOrWhiteSpace(this.parameterCollection)) {
        _parameters = this.ApplyReportParameters(_parameters)
      }
      return _parameters;
    },

    ApplyReportParameters: function(parameter) {
      var _parameter = parameter;
      var self = this;
      if (this.parameterCollection.length > 0) {
        this.parameterCollection.each(function(model) {
          _parameter.add([{
            Name: "[" + model.get("ColumnName") + "]",
            Value: model.get("CriteriaValue"),
            DataType: model.get("Type")
          }]);
        });
      }

      this.parameterCollection.reset();
      return _parameter;
    },

    InitializePrintPreview: function(transactionCode, reportType) {
      if (!this.printView) {
        this.printView = new PrintView({
          el: $("#previewContainer"),
          model: transactionCode,
          reportType: reportType,
        });
      } else {
        $(reportOptions_el).show();
        this.$("#print-area").show();
      }
      $(printAreaContainer).html('');
      $(printAreaContainer).append(this._printAreaTemplate());
    },
    PreviewReport_: function(pageSettings, transactionCode, reportType, isReceiptPrinter, isWorkStation) {
      this.$("#print-preview-container > tbody").html('');
      Global.Printer.isPrintedinPrinter = false;
      this.DeletePreviousReport();

      this.prevPages = pageSettings.Pages;
      Global.prevPages = pageSettings.Pages;
      pages = pageSettings.Pages;


      Global.prevTransactionCode = transactionCode;
      this.prevTransactionCode = transactionCode;

      Global.ApplicationType = "Reports";

      this.InitializePrintPreview(transactionCode, reportType);

      if (Global.Preference.IsAirprint == true) {
        this.printView.IsReceiptPrinter = false;
      } else {
        this.printView.IsReceiptPrinter = true;
      }

      this.printView.IsWorkStation = isWorkStation || false;
      if (Global.Preference.IsAirprint == false && !this.IsNullOrWhiteSpace(Global.IsGenerateReport) && (!Global.isBrowserMode)) {
        Shared.Printer.ReleasePrinterObjects();
      }
      this.printView.Show(pageSettings, transactionCode, reportType);
      if (Global.isBrowserMode) {
        $("#print-area").html("<iframe id='printFrame' src='" + Global.ServiceUrl + "/Reports/ReportViewer.aspx?transactionCode=" + transactionCode + "'></iframe>");
        $("#printFrame").show();
        $("#print-preview-container").hide();
      }

      Global.IsGenerateReport = true;
      Global.HasPrevReport = true;
      this.isLoaded = true;
      this.NoPreviewAvailable(pageSettings.Pages);

    },
    NoPreviewAvailable: function(pages) {
      if (pages == 0) {
        this.ShowPreviewMessage("Preview Not Available");
        this.noPreview = true;
        if (Global.isBrowserMode) {
          $("#printFrame").hide();
        } else {
          $(cmdPrint).hide();
        }
      } else {
        if (!Global.isBrowserMode) $(cmdPrint).show();
      }
    },

    IsNullOrWhiteSpace: function(str) {
      if (!str) {
        return true;
      }
      if (str === "" || str === null || str === undefined) {
        return true;
      }
      return false;
    },

    DeletePreviousReport: function() {
      if (!this.IsNullOrWhiteSpace(Global.HasPrevReport) && !this.IsNullOrWhiteSpace(this.prevTransactionCode)) {
        if (Global.HasPrevReport == true) {
          Shared.Printer.DeleteReport(this.prevPages, this.prevTransactionCode);
          if (Global.Preference.IsAirprint == false && !this.IsNullOrWhiteSpace(Global.IsGenerateReport) && (!Global.isBrowserMode)) {
            Shared.Printer.ReleasePrinterObjects();
          }
        }
      }
    },
    ShowPreviewMessage: function(message) {
      $(no_record_el + "> span").removeClass("icon-ban-circle");
      $(no_record_el + "> span").removeClass("icon-bar-chart");
      if (!this.IsNullOrWhiteSpace(message)) {
        $(no_record_el + " > p").text(message);
        $(no_record_el + "> span").addClass("icon-bar-chart");
      } else {
        message = "No Record Found";
        $(no_record_el + " > p").text(message);
        $(no_record_el + "> span").addClass("icon-ban-circle");
      }
      $(no_record_el).show();
    },
    NoRecordFound: function() {
      this.$("#print-area").hide();
      $(reportOptions_el).hide()
    },

    TogglePrintPreview: function(e) {
      var self = this,
        printPreviewbtn = $("#btn-printPreview > span"),
        isFullScreen = printPreviewbtn.hasClass('icon-fullscreen');
      e.preventDefault();
      this.trigger('togglePreview', isFullScreen);
    },

    RefreshScroll: function() {
      this.printView.RefreshMyScroll();
    }


  });
  var _processGeneratePreview = function(button) {
    if (button === 1) {
      _currentForm.ProcessGenerateReport(_reportToPrintModel, true);
    } else {
      _currentForm.CancelApplyCriteria();
    }
  };

  return ReportsPrintPreview;
});
