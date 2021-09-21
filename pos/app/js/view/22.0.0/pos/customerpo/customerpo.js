define([
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'model/lookupcriteria',
  'collection/base',
  'text!template/22.0.0/pos/customerpo/customerpo.tpl.html',
  'js/libs/format.min.js'
], function(Backbone, Global, Service, Method, Shared,
  BaseModel, LookUpCriteriaModel,
  BaseCollection,
  template, reportListTemplate) {

  var drpPaymentTerm = "#paymentTerm";
  var drpPaymentTermDiv = "#paymentTerm-div";
  var lblPaymentTerm = "#paymentTermLabel";
  
  var drpShippingMethod = "#shippingMethod";
  var drpShippingMethodDiv = "#shippingMethod-div";
  var lblShippingMethod = "#shippingMethodLabel";

  var drpContact = "#contact";
  var drpContactDiv = "#contact-div";
  var lblContact = "#contactLabel";

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
      $("#customerPOSource-div > :first-child > :first-child").addClass("po-source-border");
      $("#customerPaymentTerm-div > :first-child > :first-child").addClass("paymentTerm-border");
      $("#customerShippingMethod-div > :first-child > :first-child").addClass("shippingMethod-border");
      $("#customerContact-div > :first-child > :first-child").addClass("contact-border");
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
      var _paymentTerm = this.$(drpPaymentTerm).val();
      var _shippingMethod = this.$(drpShippingMethod).val();
      var _contact = this.$(drpContact).val();

      if (this.hasShipDate == true) {
        if (this.IsNullOrWhiteSpace(_shipdate)) {
          navigator.notification.alert("Shipping Date is required", null, "Cannot Save Transaction", "OK");
          return;
        }
      }
      this.Save(_POCode, _shippingDate, _source, _paymentTerm, _shippingMethod, _contact);
    },
    Cancel: function(e) {
      e.preventDefault();
      $("#main-transaction-blockoverlay").hide();
      this.trigger("ResetCustomerPO");
      this.$el.hide();
    },
    Save: function(_POCode, _shipdate, _source, _paymentTerm, _shippingMethod, _contact) {
      this.model.set({
        POCode: _POCode,
        SourceCode: _source,
        ShippingDate: _shipdate,
        PaymentTerm: _paymentTerm,
        ShippingMethod: _shippingMethod,
        Contact: _contact
      });

      this.trigger('AddCustomerPO', this.model, this.type);
      this.Close();
    },
    Close: function() {
      //$("#main-transaction-blockoverlay").hide();
      this.$el.hide();
    },
    Show: function(model, type, customerSourceCode, customerPaymentTermCode, customerShippingMethodCode, customerContactCode, transactionModel) {
      this.$el.show();
      this.model = new BaseModel();
      this.model = model;
      this.type = "";
      this.sourceModel = new BaseModel();
      this.customerSourceCode = customerSourceCode;
      this.paymentTermModel = new BaseModel();
      this.customerPaymentTermCode = customerPaymentTermCode;
      this.shippingMethodModel = new BaseModel();
      this.customerShippingMethodCode = customerShippingMethodCode;
      this.contactModel = new BaseModel();
      this.customerContactCode = customerContactCode;

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
      this.$(drpPaymentTerm).removeClass('ui-disabled');
      this.$(lblPaymentTerm).removeClass('ui-disabled');
      this.$(drpShippingMethod).removeClass('ui-disabled');
      this.$(lblShippingMethod).removeClass('ui-disabled');
      this.$(drpContact).removeClass('ui-disabled');
      this.$(lblContact).removeClass('ui-disabled');
      this.PaymentTerm = true;
      this.ShippingMethod = true;
      this.Contact = true;
      this.hasCustomerPO = true;
      this.hasShipDate = true;
      this.Source = true;
      if (!Global.Preference.AskForPaymentTerm) {
        this.$(drpPaymentTermDiv).addClass('ui-disabled');
        this.$(lblPaymentTerm).addClass('ui-disabled');
        this.$(drpPaymentTerm + ' > option').remove();
        this.PaymentTerm = false;
      }
      if (!Global.Preference.AskForShippingMethod) {
        this.$(drpShippingMethodDiv).addClass('ui-disabled');
        this.$(lblShippingMethod).addClass('ui-disabled');
        this.$(drpShippingMethod + ' > option').remove();
        this.ShippingMethod = false;
      }
      if (!Global.Preference.AskForContact) {
        this.$(drpContactDiv).addClass('ui-disabled');
        this.$(lblContact).addClass('ui-disabled');
        this.$(drpContact + ' > option').remove();
        this.Contact = false;
      }
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
      this.InitializePaymentTerm();
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
        var paymentTerm = this.transactionModel.get("PaymentTermCode");
        var shippingMethod = this.transactionModel.get("ShippingMethodCode");
        var contact = this.transactionModel.get("ContactCode");
        var shippDate = this.JSONtoDate(this.transactionModel.get("ShippingDate"));
        if (this.IsNullOrWhiteSpace(poCode)) poCode = "";
        this.$(txtCustomerPO).val(poCode);
        this.$(txtShipDate).val(shippDate);
        this.$(drpSource).val(sourceCode);
        if (!this.IsNullOrWhiteSpace(sourceCode)) {
          this.$(drpSource + " > option[value='" + sourceCode + "']").attr("selected", "selected");
          this.$(drpSource).trigger('change');
        }
        this.$(drpPaymentTerm).val(paymentTerm);
        if (!this.IsNullOrWhiteSpace(paymentTerm)) {
          this.$(drpPaymentTerm + " > option[value='" + paymentTerm + "']").attr("selected", "selected");
          this.$(drpPaymentTerm).trigger('change');
        }
        this.$(drpShippingMethod).val(shippingMethod);
        if (!this.IsNullOrWhiteSpace(shippingMethod)) {
          this.$(drpShippingMethod + " > option[value='" + shippingMethod + "']").attr("selected", "selected");
          this.$(drpShippingMethod).trigger('change');
        }
        this.$(drpContact).val(contact);
        if (!this.IsNullOrWhiteSpace(contact)) {
          this.$(drpContact + " > option[value='" + contact + "']").attr("selected", "selected");
          this.$(drpContact).trigger('change');
        }
      }
    },

    InitializeSystemPaymentTerm: function(criteria) {
      this.sytemPaymentTermModel = new BaseModel();
      var _rowstoselect = 100;
      if (!this.IsNullOrWhiteSpace(criteria)) {
        this.sytemPaymentTermModel.set({
          StringValue: criteria
        });
      }
      var self = this;
      this.sytemPaymentTermModel.url = Global.ServiceUrl + Service.POS + Method.LOADSYSTEMPAYMENTTERM + _rowstoselect;
      this.sytemPaymentTermModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.LoadSytemPaymentTerm(response);
        }
      });
    },
    GetCustomerPaymentTermCode: function() {
      if (!this.IsNullOrWhiteSpace(this.customerPaymentTerm)) {
        var _defaultPaymentTerm = this.customerPaymentTerm;
        this.$(drpPaymentTerm).val(_defaultPaymentTerm);
        this.$(drpPaymentTerm + " > option[value='" + _defaultPaymentTerm + "']").attr("selected", "selected");
        this.$(drpPaymentTerm).trigger('change');
      }
      this.InitializePreviousTransction();
    },
    LoadSytemPaymentTerm: function(response) {
      this.$(drpPaymentTerm + ' > option').remove();
      var self = this;

      if (!this.IsNullOrWhiteSpace(response)) {
        this.systemPaymentTermCollection = new BaseCollection();
        this.systemPaymentTermCollection.reset(response.SystemSources);
        self.$(drpPaymentTerm).append(new Option("-Select Payment Term-", ""));
        this.systemPaymentTermCollection.each(function(model) {
          var paymentTermDescription = model.get("PaymentTermDescription");
          var paymentTermCode = model.get("PaymentTermCode");
          if (model.get("PaymentTermCode") == "Unknown") {
            _defaultPaymentTerm = model.get(paymentTermDescription);
          }
          self.$(drpPaymentTerm).append(new Option(paymentTermDescription, paymentTermCode));
        });

        this.GetCustomerPaymentTermCode();
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
