define([
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'model/lookupcriteria',
  'collection/base',
  'text!template/15.0.1/pos/customerpo/customerpo.tpl.html',
  'js/libs/format.min.js'
], function(Backbone, Global, Service, Method, Shared,
  BaseModel, LookUpCriteriaModel,
  BaseCollection,
  template, reportListTemplate) {

  var drpSource = "#customer-Source";
  var drpSourceDiv = "#customerPOSource-div";
  var lblSource = "#sourceLabel";
  var txtCustomerPO = "#customer-PO";
  var lblCustomerPO = "#POLabel";
  var txtShipDate = "#customer-ShipDate";
  var lblShipDate = "#shipdateLabel";

  var CustomerPOView = Backbone.View.extend({

    _template: _.template(template),

    events: {
      "tap #customer-po-btn-done ": "ValidateInputs",
      "tap #customer-po-btn-cancel ": "Cancel"
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(this._template);
      var _date = new Date();
      $(txtShipDate).val(this.JSONtoDate(_date));
      Shared.BrowserModeDatePicker("#customer-ShipDate", "datepicker");
      this.$el.trigger('create');
      return this;
    },
    InitializeChildViews: function() {

    },
    JsonToAspDate: function(value) {
      var oldDate = Date.parse(value);
      var newDate = new Date(oldDate);
      var m = newDate.getMonth();
      var d = newDate.getDate();
      var y = newDate.getFullYear();
      newDate = Date.UTC(y, m, d);
      newDate = "/Date(" + newDate + ")/";
      return newDate;
    },

    JSONtoDate: function(transactionDate) {
      var DateFormat = 'YYYY-MM-DD';
      var _tDate = moment(transactionDate).format(DateFormat);
      return _tDate;
    },
    ValidateInputs: function(e) {
      e.preventDefault();
      var _POCode = this.$(txtCustomerPO).val();
      var _shipdate = this.$(txtShipDate).val();
      var _shippingDate = this.JsonToAspDate(_shipdate);
      var _source = this.$(drpSource).val();

      if (this.hasShipDate == true) {
        if (this.IsNullOrWhiteSpace(_shipdate)) {
          navigator.notification.alert("Shipping Date is required", null, "Cannot Save Transaction", "OK");
          return;
        }
      }
      this.Save(_POCode, _shippingDate, _source);
    },
    Cancel: function(e) {
      e.preventDefault();
      $("#main-transaction-blockoverlay").hide();
      this.trigger("ResetCustomerPO");
      this.$el.hide();
    },
    Save: function(_POCode, _shipdate, _source) {
      this.model.set({
        POCode: _POCode,
        SourceCode: _source,
        ShippingDate: _shipdate
      });

      this.trigger('AddCustomerPO', this.model, this.type);
      this.Close();
    },
    Close: function() {
      //$("#main-transaction-blockoverlay").hide();
      this.$el.hide();
    },
    Show: function(model, type, customerSourceCode, transactionModel) {
      this.$el.show();
      this.model = new BaseModel();
      this.model = model;
      this.type = "";
      this.sourceModel = new BaseModel();
      this.customerSourceCode = customerSourceCode;

      this.transactionModel = new BaseModel();
      if (!this.IsNullOrWhiteSpace(transactionModel)) {
        this.transactionModel = transactionModel.at(0);
      }
      if (!this.IsNullOrWhiteSpace(type)) {
        this.type = type;
      }
      this.InitializeControls();
    },
    InitializeControls: function() {
      this.$(txtCustomerPO).removeClass('ui-disabled');
      this.$(lblCustomerPO).removeClass('ui-disabled');
      this.$(txtShipDate).removeClass('ui-disabled');
      this.$(lblShipDate).removeClass('ui-disabled');
      this.$(drpSource).removeClass('ui-disabled');
      this.$(lblSource).removeClass('ui-disabled');
      this.hasCustomerPO = true;
      this.hasShipDate = true;
      this.Source = true;
      if (!Global.Preference.AskForCustomerPO) {
        this.$(txtCustomerPO).addClass('ui-disabled');
        this.$(lblCustomerPO).addClass('ui-disabled');
        this.hasCustomerPO = false;
      }
      if (!Global.Preference.AskForShipDate) {
        this.$(txtShipDate).addClass('ui-disabled');
        this.$(lblShipDate).addClass('ui-disabled');
        this.hasShipDate = false;
      }
      if (!Global.Preference.AskForSource) {
        this.$(drpSourceDiv).addClass('ui-disabled');
        this.$(lblSource).addClass('ui-disabled');
        this.$(drpSource + ' > option').remove();
        //	this.$(drpSource).val("");
        this.Source = false;
        //this.$(drpSource).append(new Option("Source...",""));
      }
      this.InitializeSystemSource();


    },
    IsNullOrWhiteSpace: function(str) {
      return Shared.IsNullOrWhiteSpace(str);
    },
    InitializePreviousTransction: function() {
      var self = this;
      this.customerTransactionModel = new BaseModel();
      if (!this.IsNullOrWhiteSpace(this.transactionModel)) {
        var poCode = this.transactionModel.get("POCode");
        var sourceCode = this.transactionModel.get("SourceCode");
        var shippDate = this.JSONtoDate(this.transactionModel.get("ShippingDate"));
        if (this.IsNullOrWhiteSpace(poCode)) poCode = "";
        this.$(txtCustomerPO).val(poCode);
        this.$(txtShipDate).val(shippDate);
        this.$(drpSource).val(sourceCode);
        if (!this.IsNullOrWhiteSpace(sourceCode)) {
          this.$(drpSource + " > option[value='" + sourceCode + "']").attr("selected", "selected");
          this.$(drpSource).trigger('change');
        }

      }

    },

    InitializeSystemSource: function(criteria) {
      this.sytemSourceModel = new BaseModel();
      var _rowstoselect = 100;
      if (!this.IsNullOrWhiteSpace(criteria)) {
        this.systemSourceModel.set({
          StringValue: criteria
        });
      }
      var self = this;
      this.sytemSourceModel.url = Global.ServiceUrl + Service.POS + Method.LOADSYTEMSOURCE + _rowstoselect;
      this.sytemSourceModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.LoadSytemSource(response);
        }

      });
    },

    GetCustomerSourceCode: function() {
      if (!this.IsNullOrWhiteSpace(this.customerSourceCode)) {
        var _defaultSource = this.customerSourceCode;
        this.$(drpSource).val(_defaultSource);
        this.$(drpSource + " > option[value='" + _defaultSource + "']").attr("selected", "selected");
        this.$(drpSource).trigger('change');
      }
      this.InitializePreviousTransction();
    },
    LoadSytemSource: function(response) {
      this.$(drpSource + ' > option').remove();
      var self = this;

      if (!this.IsNullOrWhiteSpace(response)) {
        this.systemSourceCollection = new BaseCollection();
        this.systemSourceCollection.reset(response.SystemSources);
        self.$(drpSource).append(new Option("-Select Source-", ""));
        this.systemSourceCollection.each(function(model) {
          var sourceDescription = model.get("SourceDescription");
          var sourceCode = model.get("SourceCode");
          if (model.get("SourceCode") == "Unknown") {
            _defaultSource = model.get(sourceDescription);
          }
          self.$(drpSource).append(new Option(sourceDescription, sourceCode));
        });

        this.GetCustomerSourceCode();
      }

    }
  });

  return CustomerPOView;
});
