define([
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'model/lookupcriteria',
  'collection/base',
  'view/21.0.0/reports/reports-form',
  'text!template/21.0.0/reports/reports.tpl.html',
  'text!template/21.0.0/reports/header.tpl.html'
], function(Backbone, Global, Service, Method, Shared,
  BaseModel, LookUpCriteriaModel,
  BaseCollection,
  ReportPageView,
  template, headerTemplate) {

  var reportPage_el = "#reportsPageContainer";
  var header_el = "#header";
  var printDialog_el = "#printDialog-div";
  var printSetup_el = "#printerSetup-div";
  var ReportsView = Backbone.View.extend({

    _template: _.template(template),
    _headerTemplate: _.template(headerTemplate),

    events: {
      "tap #reports-back": "BackToDashBoard",
      "tap #modalBg": "outsideMenuHandler"
    },
    BackToDashBoard: function(e) {
      e.preventDefault();
      Global.Printer.isPrintedinPrinter = false;
      this.DeletePreviousReport();
      Global.HasPrevReport = false;
      window.location.hash = "dashboard"
    },
    DeletePreviousReport: function() {
      if (!Global.HasPrevReport == false) {
        if (Global.HasPrevReport == true) {
          Shared.Printer.DeleteReport(Global.prevPages, Global.prevTransactionCode);
        }
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
    outsideMenuHandler: function() {
      if (this.IsNullOrWhiteSpace(Global.isPrintDialog) || Global.isPrintDialog == false) {
        $("#modalBg").hide();
        $(printDialog_el).hide();
        $(printSetup_el).hide();
      }

    },
    render: function() {
      this.$el.html(this._template());
      Global.Printer.isPrintedinPrinter = false;
      return this;
    },
    InitializeChildViews: function() {
      this.$(header_el).html(this._headerTemplate());
      this.InitializeReportsPage();
    },
    InitializeReportsPage: function() {

      if (!this.reportsView) {
        this.reportsView = new ReportPageView({
          el: $(reportPage_el)
        });
      } else {
        this.reportsView.unbind();
        this.reportsView = new ReportPageView({
          el: $(reportPage_el)
        });
      }
      this.reportsView.InitializeChildViews();
    }

  });

  return ReportsView;
});
