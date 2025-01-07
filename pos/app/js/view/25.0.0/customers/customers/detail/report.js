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
    'text!template/25.0.0/customers/customers/detail/report.tpl.html',
    'js/libs/iscroll.js'
  ], function(
    $,
    $$,
    _,
    Backbone,
    Global,
    Service,
    Method,
    Shared,
    BaseModel,
    ReportTemplate
) {
    var ReportView = Backbone.View.extend({
      _reportTemplate: _.template(ReportTemplate),

      CustomerCode: "",

      events: {
        "tap #sale-autoprint, #order-autoprint, #quote-autoprint, #return-autoprint, #credit-card-autoprint": "checkbox_tap",
        "change #sale-report-code, #order-report-code, #quote-report-code, #return-report-code, #credit-card-report-code": "reportCode_changed"
      },

      IsNew: false,

      initialize: function() {
        this.$el.show();
      },

      render: function() {
        this.onLoad = true;
        this.$el.html(this._reportTemplate());
        return this;
      },

      Show: function() {
        this.InitializeReportSetting();
        this.render();
        this.RefreshiScroll();
      },

      EnableRow: function(reportRow, enable) {
        reportRow.removeClass("disabled");
        if (!enable) reportRow.addClass("disabled");
        reportRow.find(".printer select").prop("disabled", !enable);
        reportRow.find(".copies input").prop("disabled", !enable);
        reportRow.find(".autoprint input").prop("disabled", !enable);
      },

      RenderReportData: function(result) {
        var self = this;

        if (result) {
          _.each(result, function(data) {
            var reportRow;

            switch(data.TransactionType) {
              case "InvoiceReportCode":
                reportRow = $("#sale-row");
                break;
              case "OrderReportCode":
                reportRow = $("#order-row");
                break;
              case "QuoteReportCode":
                reportRow = $("#quote-row");
                break;
              case "ReturnReportCode":
                reportRow = $("#return-row");
                break;
              case "CreditCardReportCode":
                reportRow = $("#credit-card-row");
                break;
            }

            if (reportRow) {
              reportRow.find(".report-code select").val(data.ReportCode);

              if (data.ReportCode) {
                reportRow.find(".printer select").val(data.Printer);
                reportRow.find(".copies input").val(data.Copies);

                reportRow.find(".autoprint input").prop("checked", data.IsAutoPrint);
                Shared.CustomCheckBoxChange("#" + reportRow.find(".autoprint .custom-check").prop("id"), !data.IsAutoPrint);

                self.EnableRow(reportRow, true);
              }
              else {
                self.EnableRow(reportRow, false);
              }
            }
          });
        }
        else {
          $(".table-customer-report tbody tr").each(function(index, current) {
            self.EnableRow($(current), false);
          })
          .toArray();
        }
      },

      InitializeReportSetting: function() {
        this.InitializeAvailablePrinters();
        this.InitializeReceiptSelections();
        this.InitializeData();
      },

      InitializeData: function() {
        var self = this;
        var reportModel = new BaseModel();
        reportModel.url = Global.ServiceUrl + Service.POS + Method.LOADCUSTOMERPOSREPORT
              + "?workstationID=" + Global.Preference.WorkstationID + "&customerCode=" + this.CustomerCode;


        reportModel.fetch({
          success: function(model, response, options) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            self.customerPOSReports = response.CustomerPOSReports;
            self.RenderReportData(self.customerPOSReports);
          },
          error: function(model, xhr, options) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.RequestError(error, "Error Loading Customer Report Settings", "An error was encountered when trying to load.");
          }
        });
      },

      InitializeAvailablePrinters: function()
      {
        printerTool.getPrinters()
          .then(function(printers) {
            printers = printers || {}
            printers.unshift("");
            printers.forEach(function(printer) {
              $(".table-customer-report .printer select").append($("<option>", {
                selected: false,
                value: printer,
                text: printer
              }));
            });
          });
      },

      InitializeReceiptSelections: function() {
        var receiptModel = new BaseModel();
        receiptModel.url = Global.ServiceUrl + Service.POS + Method.REPORTCODELOOKUP + "CustomerReport/100";

        var self = this;

        var populateReceiptSelection = function(reports, input, filter) {
          input.append($("<option>", { value: "", text: "" }));
          reports.filter(filter)
            .forEach(function(report) {
              input.append($("<option>", {
                selected: false,
                value: report.ReportCode,
                text: report.ReportName
              }));
            });
        };

        receiptModel.save(null, {
          success: function(model, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();

            var reports = response.ReportViews || [];

            //Sales report
            populateReceiptSelection(reports, $("#sale-report-code"), function(report) {
              return report.SubCategory.toLowerCase() == "invoice";
            });

            //Order report
            populateReceiptSelection(reports, $("#order-report-code"), function(report) {
              return report.SubCategory.toLowerCase() == "sales order";
            });

            //Quote report
            populateReceiptSelection(reports, $("#quote-report-code"), function(report) {
              return report.SubCategory.toLowerCase() == "quote";
            });

            //Return report
            populateReceiptSelection(reports, $("#return-report-code"), function(report) {
              return report.SubCategory.toLowerCase() == "refund" || report.SubCategory.toLowerCase() == 'credit memo';
            });

            //Credit Card report
            populateReceiptSelection(reports, $("#credit-card-report-code"), function(report) {
              return report.SubCategory.toLowerCase() == "credit card";
            });

            self.RenderReportData(self.customerPOSReports);
          },
          error: function(model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.RequestError(error, "Error Retrieving Report Codes");
          }
        });
      },

      InitializeModelsAndCollections: function() {
        // var _rows = 10000;
        // if (!this.countryModel) {
        //   this.countryModel = new LookUpCriteriaModel();
        //   this.countryModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.COUNTRYCODELOOKUP + _rows;
        // }

        // if (!this.postalmodel) {
        //   this.postalmodel = new BaseModel();
        // }

        // if (!this.postalCollection) this.postalCollection = new BaseCollection();
        // if (!this.countryCollection) this.countryCollection = new CountryCollection();
      },

      RefreshiScroll: function() {
        // if (this.myScroll) {
        //   this.myScroll.refresh();
        // } else {
        //   this.myScroll = new iScroll("detail-body", {
        //     vScrollbar: true,
        //     vScroll: true,
        //     snap: true,
        //     momentum: true,
        //     onBeforeScrollStart: function(e) {
        //       var target = e.target;
        //       while (target.nodeType != 1) target = target.parentNode;

        //       if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
        //         e.preventDefault();
        //     }
        //   });
        // }
      },

      ValidData: function() {
        this.GetUpdatedModelAttributes();
        return true;
      },

      GetUpdatedModelAttributes: function() {
        var reports = $(".table-customer-report tbody tr").map(function(index, current) {
          var report = $(current);
          var copies = parseInt(report.find(".copies input").val());

          return {
            ReportCode: report.find(".report-code select").val(),
            TransactionType: report.attr("data-row-transaction"),
            Printer: report.find(".printer select").val(),
            Copies: isNaN(copies) ? 0 : copies,
            IsAutoPrint: report.find(".autoprint input").is(':checked'),
          };
        })
        .toArray();

        this.model.set({
          CustomerPOSReports: reports,
          WorkstationID: Global.Preference.WorkstationID,
          CustomerCode: this.CustomerCode
        });

        return this.model.attributes;
      },

      checkbox_tap: function(event) {
        var reportCode = $(event.srcElement).closest("tr").find(".report-code select").val();

        if (reportCode) {
          var checkBox = $(event.srcElement).find("input")[0];
          checkBox.checked = Shared.CustomCheckBoxChange("#" + event.srcElement.id, checkBox.checked);
        }
      },

      reportCode_changed: function(event) {
        var reportCode = $(event.srcElement).val();
        this.EnableRow($(event.srcElement).closest("tr"), reportCode != "");
      }
    });
    return ReportView;
  });
