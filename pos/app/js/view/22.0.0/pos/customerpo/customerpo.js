define([
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'model/lookupcriteria',
  'collection/base',
  'text!template/23.0.0/pos/customerpo/customerpo.tpl.html',
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
      $("#paymentTerm-div > :first-child > :first-child").addClass("po-source-border");
      $("#shippingMethod-div > :first-child > :first-child").addClass("po-source-border");
      $("#contact-div > :first-child > :first-child").addClass("po-source-border");
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
      var _paymentTerm = this.$(drpPaymentTerm).val().split('|');
      var _shippingMethod = this.$(drpShippingMethod).val().split('|');
      var _contact = this.$(drpContact).val();

      if (this.hasShipDate == true) {
        if (this.IsNullOrWhiteSpace(_shipdate)) {
          navigator.notification.alert("Shipping Date is required", null, "Cannot Save Transaction", "OK");
          return;
        }
      }
      this.Save(_POCode, _shippingDate, _source, _paymentTerm[1], _paymentTerm[0], _shippingMethod[1], _shippingMethod[0], _contact);
    },
    Cancel: function(e) {
      e.preventDefault();
      $("#main-transaction-blockoverlay").hide();
      this.trigger("ResetCustomerPO");
      this.$el.hide();
    },
    Save: function(_POCode, _shipdate, _source, _paymentTermGroup, _paymentTerm, _shippingMethodGroup, _shippingMethod, _contact) {
      debugger;
      this.model.set({
        POCode: _POCode,
        SourceCode: _source,
        ShippingDate: _shipdate,
        PaymentTermGroup: _paymentTermGroup,
        PaymentTermCode: _paymentTerm,
        ShippingMethodGroup: _shippingMethodGroup,
        ShippingMethodCode: _shippingMethod,
        ContactCode: _contact
      });

      this.trigger('AddCustomerPO', this.model, this.type);
      this.Close();
    },
    Close: function() {
      //$("#main-transaction-blockoverlay").hide();
      this.$el.hide();
    },
    Show: function(model, type, customerSourceCode, paymentTermCode, shippingMethodCode, contactCode, transactionModel) {
      this.$el.show();
      this.model = new BaseModel();
      this.model = model;
      this.type = "";
      this.sourceModel = new BaseModel();
      this.customerSourceCode = customerSourceCode;
      this.paymentTermModel = new BaseModel();
      this.paymentTermCode = paymentTermCode;
      this.shippingMethodModel = new BaseModel();
      this.shippingMethodCode = shippingMethodCode;
      this.contactModel = new BaseModel();
      this.contactCode = contactCode;

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
        this.Source = false;
      }
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
      this.InitializeSystemSource();
      this.InitializeSystemPaymentTerm(Global.CustomerCode);
      this.InitializeSystemShippingMethod(Global.CustomerCode);
      this.InitializeCRMContact(Global.CustomerCode);
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
    GetPaymentTermCode: function() {
      if (!this.IsNullOrWhiteSpace(this.paymentTermCode)) {
        var _defaultPaymentTerm = this.paymentTermCode;
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
        this.systemPaymentTermCollection.reset(response.SystemPaymentTerms);
        self.$(drpPaymentTerm).append(new Option("-Select Payment Term-", ""));
        this.systemPaymentTermCollection.each(function(model) {
          var paymentTermDescription = model.get("PaymentTermDescription");
          var paymentTermCode = model.get("PaymentTermCode");
          var paymentTermGroup = model.get("PaymentTermGroup");
          if (model.get("PaymentTermCode") == "Unknown") {
            _defaultPaymentTerm = model.get(paymentTermDescription);
          }
          self.$(drpPaymentTerm).append(new Option(paymentTermDescription, paymentTermCode + '|' + paymentTermGroup));
        });
        this.GetPaymentTermCode();
      }
    },
    InitializeSystemShippingMethod: function(criteria) {
      this.sytemShippingMethodModel = new BaseModel();
      var _rowstoselect = 100;
      if (!this.IsNullOrWhiteSpace(criteria)) {
        this.sytemShippingMethodModel.set({
          StringValue: criteria
        });
      }
      var self = this;
      this.sytemShippingMethodModel.url = Global.ServiceUrl + Service.POS + Method.LOADSYSTEMSHIPPINGMETHOD + _rowstoselect;
      this.sytemShippingMethodModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.LoadSytemShippingMethod(response);
        }
      });
    },
    GetShippingMethoCode: function() {
      if (!this.IsNullOrWhiteSpace(this.shippingMethodCode)) {
        var _defaultShippingMethod = this.shippingMethodCode;
        this.$(drpShippingMethod).val(_defaultShippingMethod);
        this.$(drpShippingMethod + " > option[value='" + _defaultShippingMethod + "']").attr("selected", "selected");
        this.$(drpShippingMethod).trigger('change');
      }
      this.InitializePreviousTransction();
    },
    LoadSytemShippingMethod: function(response) {
      this.$(drpShippingMethod + ' > option').remove();
      var self = this;

      if (!this.IsNullOrWhiteSpace(response)) {
        this.systemShippingMethodCollection = new BaseCollection();
        this.systemShippingMethodCollection.reset(response.SystemShippingMethods);
        self.$(drpShippingMethod).append(new Option("-Select Shipping Method-", ""));
        this.systemShippingMethodCollection.each(function(model) {
          var shippingMethodDescription = model.get("ShippingMethodDescription");
          var shippingMethodCode = model.get("ShippingMethodCode");
          var shippingMethodGroup = model.get("ShippingMethodGroup");
          if (model.get("ShippingMethodCode") == "Unknown") {
            _defaultShippingMethod = model.get(shippingMethodDescription);
          }
          self.$(drpShippingMethod).append(new Option(shippingMethodDescription, shippingMethodCode + '|' + shippingMethodGroup));
        });
        this.GetShippingMethodCode();
      }
    },
    InitializeCRMContact: function(criteria) {
      this.crmContactModel = new BaseModel();
      var _rowstoselect = 100;
      if (!this.IsNullOrWhiteSpace(criteria)) {
        this.crmContactModel.set({
          StringValue: criteria
        });
      }
      var self = this;
      this.crmContactModel.url = Global.ServiceUrl + Service.POS + Method.LOADCRMCONTACT + _rowstoselect;
      this.crmContactModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.LoadCRMContact(response);
        }
      });
    },
    GetContactCode: function() {
      if (!this.IsNullOrWhiteSpace(this.contactCode)) {
        var _defaultContact = this.contactCode;
        this.$(drpContact).val(_defaultContact);
        this.$(drpContact + " > option[value='" + _defaultContact + "']").attr("selected", "selected");
        this.$(drpContact).trigger('change');
      }
      this.InitializePreviousTransction();
    },
    LoadCRMContact: function(response) {
      this.$(drpContact + ' > option').remove();
      var self = this;

      if (!this.IsNullOrWhiteSpace(response)) {
        this.contactCollection = new BaseCollection();
        this.contactCollection.reset(response.CRMContacts);
        self.$(drpContact).append(new Option("-Select Contact-", ""));
        this.contactCollection.each(function(model) {
          var contactName = model.get("ContactFullName");
          var contactCode = model.get("ContactCode");
          if (model.get("ContactCode") == "Unknown") {
            _defaultContact = model.get(contactName);
          }
          self.$(drpContact).append(new Option(contactName, contactCode));
        });
        this.GetContactCode();
      }
    }
  });

  return CustomerPOView;
});
