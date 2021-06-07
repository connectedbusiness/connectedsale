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
  'model/postal',
  'model/country',
  'model/customerschema',
  'model/lookupcriteria',
  'collection/postal',
  'collection/countries',
  'collection/classtemplates',
  'collection/base',
  'text!template/21.0.0/pos/item/header-info/customer/customerform.tpl.html',
  'view/spinner',
  'view/21.0.0/pos/postal/addpostal'
], function($, $$, _, Backbone, Global, Service, Method, Shared,
  BaseModel, PostalModel, CountryModel, CustomerSchemaModel, LookupCriteriaModel,
  PostalCollection, CountryCollection, ClassTemplateCollection, BaseCollection,
  CustomerFormTemplate, Spinner, AddPostalView) {

  var FormType = {
    NewCustomer: {
      FormTitle: "New Customer",
      AttribName: "CustomerName"
    },

    EditCustomer: {
      FormTitle: "Edit Customer",
      AttribName: "CustomerName"
    }
  };
  var _view;
  var confirmAddPostal = function(button) {
    if (button == 1) {
      _view.AddNewPostal();
    } else {
      _view.ClearPostalDetails();
    }
  }
  var chkLoyaltyPoints = "#chkloyalty-points";
  var _chkLoyaltyPointsState = false;

  var CustomerFormView = Backbone.View.extend({

    _template: _.template(CustomerFormTemplate),
    events: {
      "keypress #customer-PostalCode": "buttonLoadOnTap",
      "blur #customer-PostalCode": "buttonLoadOnFocus",
      "tap #customer-save-btn": "buttonSaveOnTap",
      "tap #customer-cancel-btn": "buttonCancelOnTap",
      "change #customer-City": "SetState",
      "tap #customer-country": "CountryTap",
      "change #customer-country": "CountryChanged",
      "change #cmb-customer-classtemplate": "ClassTemplateChanged",
      "change #cmb-shipto-classtemplate": "ShipToClassTemplateChanged",
      //"change #cmb-customer-customertype" 	: "CustomerTypeChanged",
      "focus #customer-Phone": "AssignNumericValidation",
      //"change #customer-PaymentTerm"			: "PaymentTermChanged",
      //"change #customer-TaxCode"				: "TaxCodeChanged",
      "tap #chkloyalty-points": "LoyaltyPointsCheck_Changed"

    },

    customerCode: "",
    classsCode: "",
    classTemplate: "",
    paymentTerm: "",
    paymentTermCode: "",
    taxCode: "",
    postal: "",
    customerName: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    website: "",
    country: "",
    formType: "",
    county: "",

    initialize: function() {
      this.formType = this.options.FormType;
      _view = this;
      this.render(this.formType);
    },

    render: function(type) {
      this.InitializeThings();

      switch (type) {
        case FormType.NewCustomer.FormTitle:
          this.$el.append(this._template({
            FormTitle: FormType.NewCustomer.FormTitle,
            Name: FormType.NewCustomer.AttribName
          }));
          $("#customerForm").trigger('create');
          $("#customerForm").css("top", "40%"); //JHZ!
          this.onLoad = false;
          break;
        case FormType.EditCustomer.FormTitle:
          this.$el.append(this._template({
            FormTitle: FormType.EditCustomer.FormTitle,
            Name: FormType.EditCustomer.AttribName
          }));
          $("#customerForm").trigger('create');
          $("#customerForm").css("top", "42%"); //JHZ!
          this.onLoad = true;
          break;
      }


      //$("#customerForm").trigger('create');
      //$("#customerForm").css("top","42%"); //JHZ!
      this.CheckProductEdition();
      this.EnableSaveButton();
    },

    EnableSaveButton: function(isEnable) {
      if (isEnable) {
        $("#customer-save-btn").removeClass("ui-disabled");
        $("#customer-save-btn").removeAttr("disabled", "true");
      } else {
        $("#customer-save-btn").addClass("ui-disabled");
        $("#customer-save-btn").attr("disabled", "true");
      }
    },

    InitializePostalModel: function() {
      this.postalmodel = new PostalModel();
    },

    InitializeCustomerSchemaModel: function() {
      this.customerschema = new CustomerSchemaModel();
      this.customerschema.url = Global.ServiceUrl + Service.CUSTOMER + Method.GETNEWCUSTOMERSCHEMA;
      this.LoadCustomerSchema();
    },

    InitializePostalCollection: function() {
      this.postalCollection = new PostalCollection();
    },

    InitializeThings: function() {
      this.InitializePostalModel();
      this.InitializePostalCollection();

      //Portion added by PR.Ebron (11.21.2012) >> Country Lookup Feature >> JIRA ID : INTMOBA-320
      this.InitializeCountryModel();
      this.InitializeCountryCollection();
      //end of added/ modified portion..

      this.InitializeCustomerSchemaModel();

    },

    //Portion added by PR.Ebron (11.21.2012) >> Country Lookup Feature >> JIRA ID : INTMOBA-320
    InitializeCountryModel: function() {
      _rows = 10000;
      this.countryModel = new CountryModel();
      this.countryModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.COUNTRYCODELOOKUP + _rows;
    },

    InitializeCountryCollection: function() {
      this.countryCollection = new CountryCollection();
      this.LoadCountries();
    },

    CheckProductEdition: function() {
      if (Global._UserIsCS) {
        //Shared.ShowHideClassTemplates("customer-ClassTemplate-container");
      }

      if (this.formType === FormType.EditCustomer.FormTitle) {
        Shared.ShowHideClassTemplates("customer-ClassTemplate-container");
        Shared.ShowHideClassTemplates("shipto-ClassTemplate-container");
        Shared.ShowHideClassTemplates("customer-PaymentTerm-container");
        Shared.ShowHideClassTemplates("customer-TaxCode-container");
        Shared.ShowHideClassTemplates("customer-CustomerType-container");

      }
    },

    LoadCountries: function() {
      var _self = this;
      this.index = 0;
      this.countryModel.set({
        Criteria: ""
      });

      this.countryModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.countryCollection.reset(response.Countries);
          _self.DisplayCountries();
          _self.EnableSaveButton(true);
        },

        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Loading Country List");
          _self.EnableSaveButton(true);
        }
      });
    },

    IsPrioritizeFromPostalCode: function(collection, country) {
      var isPriority = collection.find(function(model) {
        return (model.get("CountryCode") === country &&
          (model.get("IsRetailCustomerBillToClassPostal") === true || model.get("IsWholesaleCustomerBillToClassPostal") === true));
      });

      if (isPriority) {
        if (isPriority.get("IsRetailCustomerBillToClassPostal") === true) {
          this.priorityPostalType = "Retail";
        } else if (isPriority.get("IsWholesaleCustomerBillToClassPostal") === true) {
          this.priorityPostalType = "Wholesale";
        }
      }


      return (isPriority) ? true : false;
    },

    DisplayCountries: function() {
      if (this.countryCollection.length === 0) {
        console.log("no countries available.");
        navigator.notification.alert("No country available.", null, "No Country Found", "OK");
      } else {
        $('#customer-country > option[val !=""]').remove();
        this.LoadRetrievedCountry();

        if (this.formType == FormType.EditCustomer.FormTitle) this.trigger("formLoaded", this);
        else this.SetSelectedCountry();
      }
    },

    LoadRetrievedCountry: function() {
      this.countryCollection.each(this.SetCountryOptions, this);
    },

    SetCountryOptions: function(country) {
      var _country = country.get("CountryCode");
      $('#customer-country').append(new Option(_country, _country));
    },

    SetSelectedCountry: function() {
      if (!this.countryCollection) return;
      if (this.countryCollection.length == 0) return;
      $("#customer-country option:selected").removeAttr('selected');
      $("#customer-country > option[value='" + this.countrySelected + "']").attr("selected", "selected");
      $("#customer-country").trigger('change');
      $("#customer-name").focus();
    },

    CountryTap: function() {
      this.isCountryTapped = true;
    },


    RemoveInvalidPostals: function(model) {
      var _country = model.get("CountryCode");
      if (_country === this.countrySelected) {
        this.newCollection.add(model);
      }
    },

    AddNewPostal: function() {
      var _postal = this.postal;
      var _el = $("#addPostalCodeContainer");
      $(_el).html("<div id='addPostalContainer' style='display: none'></div>");
      var _postalContainer = $("#addPostalContainer");
      if (Shared.IsNullOrWhiteSpace(this.newPostalView)) {
        this.newPostalView = new AddPostalView({
          el: _postalContainer
        });
      } else {
        this.newPostalView.remove();
        this.newPostalView = new AddPostalView({
          el: _postalContainer
        });
      }
      this.newPostalView.on("AcceptPostal", this.AcceptPostal, this);
      this.newPostalView.on("ClearPostal", this.ClearPostalDetails, this);
      this.newPostalView.Show(_postal, this.countrySelected, this.countryCollection);
    },

    AcceptPostal: function(response) { //cust
      this.countrySelected = response.CountryCode;
      this.SetSelectedCountry();
      $("#customer-PostalCode").val(response.PostalCode);
      this.postal = response.PostalCode
      this.city = response.City;
      $("#customer-State").val(response.StateCode);
      this.LoadPostal(this.postal, this.city);
    },

    ClearPostalDetails: function() {
      $("#customer-PostalCode").val("");
      $("#customer-State").val("");
      this.ClearCity();
      this.postal = $("#customer-PostalCode").val();
    },

    DisplayResultOnPostal: function(postal, city) {
      this.newCollection = new PostalCollection();
      this.postalCollection.each(this.RemoveInvalidPostals, this);
      this.postalCollection = this.newCollection;
      if (this.postalCollection.length === 0) {
        navigator.notification.confirm("The Postal Code '" + postal + "' does not exist in the Country selected. Do you want to add '" + postal + "' ?", confirmAddPostal, "Postal Not Found", ['Yes', 'No']);
      } else {
        $('#customer-City > option[val !=""]').remove();
        this.LoadRetrievedPostal();
        if (city == "") {
          $("#customer-City").prop("selectedIndex", 0);
        } else {
          $("#customer-City option[value='" + city + "']").attr("selected", "selected");
        }
        $("#customer-City").trigger('change');
      }

    },

    LoyaltyPointsCheck_Changed: function() {
      _chkLoyaltyPointsState = Shared.CustomCheckBoxChange(chkLoyaltyPoints, _chkLoyaltyPointsState);
    },

    CountryChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      var _postalVal = $('#customer-PostalCode').val();
      if (this.countrySelected != _val) {
        if (_postalVal.length > 0) {
          this.ClearPostalDetails();
        }
      }
      this.countrySelected = _val;
      if (this.formType == FormType.NewCustomer.FormTitle) this.LoadClassTemplatesByCountry(_val); // this.ChangeClassCode(_val);
      this.PreviousCountrySelected = _val;
    },


    //Begin : CSL-1452 : 04.02.13 : EBRON
    FetchClassCodes: function(country) {
      if (!country || country == "") return;
      var self = this;
      var classTemplate = new LookupCriteriaModel();
      classTemplate.url = Global.ServiceUrl + Service.CUSTOMER + Method.CLASSTEMPLATELOOKUP + 100 + "/false";
      classTemplate.set({
        StringValue: country
      })
      classTemplate.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.ResetClassTemplates(response.ClassTemplates);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Fetching Class Template List");
          self.SetDefaultClassCode();
        }
      });
    },

    ResetClassTemplates: function(classtemplates) {
      if (!this.classTemplateCollection) this.classTemplateCollection = new ClassTemplateCollection()
      this.classIndex = 0;
      this.classTemplateCollection.reset(classtemplates);

      if (this.classTemplateCollection.length === 0) return;
      $('#cmb-customer-classtemplate > option[val !=""]').remove();
      this.classTemplateCollection.each(this.FillClassTemplateComboBox, this);

      if (!Global.Preference.AllowChangeClassTemplate || Global.Preference.AllowChangeClassTemplate === undefined || Global.Preference.AllowChangeClassTemplate === null) {
        $('#cmb-customer-classtemplate').addClass('ui-disabled');
        $("#cmb-customer-classtemplate").attr("disabled", "true");
      } else {
        $('#cmb-customer-classtemplate').removeClass('ui-disabled');
        $("#cmb-customer-classtemplate").removeAttr("disabled");
      }

      if (this.formType === FormType.EditCustomer.FormTitle) this.trigger("formLoaded", this);
    },

    FillClassTemplateComboBox: function(model) {
      var _classDescription = model.get("ClassDescription");
      var _classCode = model.get("ClassCode");
      $('#cmb-customer-classtemplate').append(new Option(_classCode + ' | ' + _classDescription, _classCode)); //value , option
      if (_classCode === Global.DefaultClassCode) {
        $("#cmb-customer-classtemplate").prop("selectedIndex", this.classIndex);
        this.selectedClassCode = _classCode;
        $("#cmb-customer-classtemplate").trigger('change');
      }
      this.classIndex++;
    },

    CustomerTypeChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      if (this.SelectedClassCode === _val) return;
      if (_val && _val != "") {
        this.businessType = _val;

        var _model;
        if (_val == "Wholesale") _model = this.WholesaleClass;
        else _model = this.RetailClass;

        if (!_model) return;
        this.paymentTermCode = _model.get("PaymentTermCode");
        this.paymentTermGroup = _model.get("PaymentTermGroup");
        this.SetSelectedTaxCode(_model.get("TaxCode"));

        if (Global._UserIsCS) {
          this.SelectedClassCode = _model.get("ClassCode");
          this.FindCTemplate(_model);
        }

        this.FetchPaymentTerms(this.paymentTermGroup);
      }
    },

    ClassTemplateChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      if (this.SelectedClassCode === _val) return;
      this.SelectedClassCode = _val
        //if(this.classTemplateCollection === undefined || this.classTemplateCollection.length === 0) return
        //this.classTemplateCollection.each(this.FindCTemplate, this);
      if (this.customerClassTemplateCollection === undefined || this.customerClassTemplateCollection.length === 0) return
      this.customerClassTemplateCollection.each(this.FindCTemplate, this);
    },

    ShipToClassTemplateChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      if (this.SelectedShipToClassCode === _val) return;
      this.SelectedShipToClassCode = _val
      if (this.shipToClassTemplateCollection === undefined || this.shipToClassTemplateCollection.length === 0) return
      this.shipToClassTemplateCollection.each(this.FindShipToClassTemplate, this);
    },

    FindCTemplate: function(model) {
      if (this.SelectedClassCode !== model.get("ClassCode")) return;
      console.log(model.get("ClassDescription") + ' | ' + model.get("ClassCode"));
      this.classCode = model.get("ClassCode");
      this.classTemplate = model.get("ClassCode");
      //if(model.get("TaxCode")) this.SetSelectedTaxCode(model.get("TaxCode"));
      //if(model.get("PaymentTermCode")) this.paymentTermCode = model.get("PaymentTermCode");
      //if(model.get("PaymentTermGroup")) this.paymentTermGroup = model.get("PaymentTermGroup");
      //if(!model.get("DefaultPrice")) this.FetchPaymentTerms(this.paymentTermGroup);
    },

    FindShipToClassTemplate: function(model) {
      if (this.SelectedShipToClassCode !== model.get("ClassCode")) return;
      console.log(model.get("ClassDescription") + ' | ' + model.get("ClassCode"));
      this.shipToClassCode = model.get("ClassCode");
      if (model.get("TaxCode")) this.SetSelectedTaxCode(model.get("TaxCode"));
      if (model.get("PaymentTermCode")) this.paymentTermCode = model.get("PaymentTermCode");
      if (model.get("PaymentTermGroup")) this.paymentTermGroup = model.get("PaymentTermGroup");
      //if(!model.get("DefaultPrice")) this.FetchPaymentTerms(this.paymentTermGroup);
    },

    SetDefaultClassCode: function() {
      $('#cmb-customer-classtemplate > option[val !=""]').remove();
      $('#cmb-customer-classtemplate').append(new Option(this.classCode, this.classCode));
      $("#cmb-customer-classtemplate").prop("selectedIndex", 0);
      $("#cmb-customer-classtemplate").trigger('change');
    },
    //END : CSL-1452 : EBRON


    LoadClassTemplatesByCountry: function(country) {
      if (this.formType === FormType.EditCustomer.FormTitle) return;
      this.LoadCustomerClassTemplatesByCountry(country);
      this.LoadShipToClassTemplatesByCountry(country);
    },

    LoadCustomerClassTemplatesByCountry: function(country) {
      if (!country) return;
      if (country == "") return;
      var self = this;
      var tmp = new BaseModel({
        StringValue: country
      });
      tmp.url = Global.ServiceUrl + Service.CUSTOMER + 'getcustomerclasstemplatebycountry/';
      tmp.save(tmp, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!model.get("ClassTemplates")) return;
          if (model.get("ClassTemplates").length == 0) return;
          var classTemplates = model.get("ClassTemplates");
          self.PopulateCustomerClassTemplates(classTemplates);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },

    LoadShipToClassTemplatesByCountry: function(country) {
      if (!country) return;
      if (country == "") return;
      var self = this;
      var tmp = new BaseModel({
        StringValue: country
      });
      tmp.url = Global.ServiceUrl + Service.CUSTOMER + 'getshiptoclasstemplatebycountry/';
      tmp.save(tmp, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!model.get("ClassTemplates")) return;
          if (model.get("ClassTemplates").length == 0) return;
          var classTemplates = model.get("ClassTemplates");
          self.PopulateShipToClassTemplates(classTemplates);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },

    PopulateCustomerClassTemplates: function(classtemplates) {
      var self = this;
      var classIndex = 0;
      var defaultIndex = 0;
      var clsCollection = new ClassTemplateCollection()
      clsCollection.reset(classtemplates);

      if (!this.customerClassTemplateCollection) this.customerClassTemplateCollection = new ClassTemplateCollection();
      this.customerClassTemplateCollection.reset(classtemplates);

      Global.DefaultClassCode = null;
      $('#cmb-customer-classtemplate').html("");

      clsCollection.each(function(model) {
        var _classDescription = model.get("ClassDescription");
        var _classCode = model.get("ClassCode");
        if (model.get("IsDefault")) {
          Global.DefaultClassCode = _classCode;
          self.selectedClassCode = _classCode;
          defaultIndex = classIndex;
        }
        classIndex++;
        $('#cmb-customer-classtemplate').append(new Option(_classCode + ' | ' + _classDescription, _classCode));
      });

      $("#cmb-customer-classtemplate").prop("selectedIndex", defaultIndex);
      $("#cmb-customer-classtemplate").trigger('change');
    },

    PopulateShipToClassTemplates: function(classtemplates) {
      var self = this;
      var classIndex = 0;
      var defaultIndex = 0;
      var clsCollection = new ClassTemplateCollection()
      clsCollection.reset(classtemplates);

      if (!this.shipToClassTemplateCollection) this.shipToClassTemplateCollection = new ClassTemplateCollection();
      this.shipToClassTemplateCollection.reset(classtemplates);

      $('#cmb-shipto-classtemplate').html("");
      clsCollection.each(function(model) {
        var _classDescription = model.get("ClassDescription");
        var _classCode = model.get("ClassCode");
        if (model.get("IsDefault")) {
          defaultIndex = classIndex;
        }
        classIndex++;
        $('#cmb-shipto-classtemplate').append(new Option(_classCode + ' | ' + _classDescription, _classCode));
      });

      $("#cmb-shipto-classtemplate").prop("selectedIndex", defaultIndex);
      $("#cmb-shipto-classtemplate").trigger('change');
    },

    //BEGIN ADD - MAR.08.2013 - FIGUEROA
    ChangeClassCode: function(country) {
      //if (this.PreviousCountrySelected === country) return;
      if (!country) return;
      if (country == "") return;

      var tmp = new BaseModel({
        StringValue: country
      });
      var self = this;

      tmp.url = Global.ServiceUrl + Service.CUSTOMER + 'getcustomerclasstemplatebycountry/'; //Method.GETDEFAULTCLASSTEMPLATESBYCOUNTRY + 'false';
      tmp.save(tmp, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!model.get("ClassTemplates")) return;
          if (model.get("ClassTemplates").length == 0) return;

          var classTemplates = model.get("ClassTemplates");
          self.RetailClass = new BaseModel();
          self.WholesaleClass = new BaseModel();
          for (var i = 0; i < classTemplates.length; i++) {
            if (classTemplates[i].BusinessType == "Wholesale") {
              self.WholesaleClass = new BaseModel(classTemplates[i]);
              self.WholesaleClass.set({
                ClassDescription: "Wholesale"
              });
              self.paymentTermCode = classTemplates[i].PaymentTermCode;
              self.paymentTermGroup = classTemplates[i].PaymentTermGroup;
            }
            if (classTemplates[i].BusinessType == "Retail") {
              self.RetailClass = new BaseModel(classTemplates[i]);
              self.RetailClass.set({
                ClassDescription: "Retail"
              });
              Global.DefaultClassCode = classTemplates[i].ClassCode;
              self.classCode = classTemplates[i].ClassCode;
              self.classTemplate = classTemplates[i].ClassCode;
              self.paymentTerm = classTemplates[i].PaymentTermCode;
              self.paymentTermGroup = classTemplates[i].PaymentTermGroup;
              self.paymentTermCode = classTemplates[i].PaymentTermCode;
              self.taxCode = classTemplates[i].TaxCode;
            }
          }
          self.ClassCodeCompleted();
          //self.SetCustomerSchemaFields(self.classCode,self.paymentTerm,self.taxCode);
          //self.FetchPaymentTerms(self.paymentTermGroup);

          if (Global._UserIsCS) { //JHZ!
            //if(self.formType === FormType.EditCustomer.FormTitle) self.trigger("formLoaded", self); //6.27.13
            if (self.formType === FormType.EditCustomer.FormTitle) return;
          }
          self.FetchClassCodes(country);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          //	model.RequestError(error, "Error Fetching Class Code");
        }
      });
    },
    //END ADD - MAR.08.2013 - FIGUEROA

    //BEGIN : CSL-1439 : 06.27.13
    ClassCodeCompleted: function() {
      $('#cmb-customer-customertype').trigger('change')
    },

    FetchPaymentTerms: function(paymentTermGroup, criteria) {
      var _mdl = new BaseModel();

      _mdl.on('sync', this.FetchSuccess, this)
      _mdl.on('error', this.FetchFailed, this)

      _mdl.url = Global.ServiceUrl + Service.CUSTOMER + Method.PAYMENTTERMLOOKUP + 100;
      _mdl.set({
        PaymentTermGroup: paymentTermGroup,
        StringValue: criteria
      });
      _mdl.save();
    },

    FetchSuccess: function(model, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (!this.IsNullOrWhiteSpace(response.ErrorMessage)) {
        navigator.notification.alert(response.ErrorMessage, null, "Error", "OK");
        return;
      }
      this.ResetPaymentTerms(response);
    },

    FetchFailed: function(error, xhr, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      model.RequestError(error, "Error Fetching Payment Terms ");
    },

    ResetPaymentTerms: function(response) {
      if (!this.paymentTermCollection) this.paymentTermCollection = new BaseCollection();
      this.paymentTermCollection.reset(response.SystemPaymentTerms);
      if (this.paymentTermCollection.length === 0) return;

      $('#customer-PaymentTerm > option[val !=""]').remove();
      this.paymentTermCollection.each(this.FillPaymentTermComboBox, this);
      $("#customer-PaymentTerm").val(this.paymentTermCode).change();

      if (self.formType === FormType.EditCustomer.FormTitle) this.trigger("formLoaded", this);
    },

    FillPaymentTermComboBox: function(model) {
      var _paymentTermDescription = model.get("PaymentTermDescription");
      var _paymentTermCode = model.get("PaymentTermCode");
      $('#customer-PaymentTerm').append(new Option(_paymentTermDescription, _paymentTermCode)); //value , option
    },

    PaymentTermChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      this.paymentTerm = _val;
      this.paymentTermCode = _val;
      // var model = this.paymentTermCollection.find(function(model) { return model.get('PaymentTermCode') == _val; }); //finds the model on collection
      // if(!model) return;
      // this.paymentTerm 	 = model.get("PaymentTermCode");
      // this.paymentTermCode = model.get("PaymentTermCode");
    },

    IsNullOrWhiteSpace: function(str) {
      if (!str || str === null || str.trim() === "") return true;
      return false;
    },
    //END : CSL-1439 : 06.27.13



    AddCustomer: function(customer) {
      var self = this;

      switch (this.options.FormType) {
        case FormType.NewCustomer.FormTitle:
          var serverUrl = Global.ServiceUrl + Service.CUSTOMER + Method.CREATECUSTOMER;
          break;
        case FormType.EditCustomer.FormTitle:
          var serverUrl = Global.ServiceUrl + Service.CUSTOMER + Method.UPDATECUSTOMER;
          break;
      }

      this.postalmodel.url = serverUrl;
      this.postalmodel.set(customer);
      this.postalmodel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.DisplayResult(response);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Creating Customer");
        }
      });
    },

    buttonCancelOnTap: function(e) {
      e.preventDefault();
      this.HideCustomerForm();
    },

    IsViewOnLoad: function() {
      if (!Shared.IsNullOrWhiteSpace(this.onLoad)) {
        if (!Shared.IsNullOrWhiteSpace(this.city) && this.city != "Please enter city") {
          $('#customer-City > option[val !=""]').remove();
          $('#customer-City').append(new Option(this.city, this.city));
          $("#customer-City").prop("selectedIndex", 0);
          $("#customer-City").trigger('change');
        }
        if (!Shared.IsNullOrWhiteSpace(this.state) && this.state != "Please enter state code") {
          $("#customer-State").val(this.state);
        }
        console.log("CITY : " + this.city + " , STATE :" + this.state);
        this.onLoad = false;
        return true;
      }
      return false;
    },

    buttonLoadOnFocus: function() {
      if (this.IsViewOnLoad()) return;
      if (this.postal === $("#customer-PostalCode").val()) return;
      this.ResetVariable();
      this.postal = $("#customer-PostalCode").val();
      this.LoadPostal(this.postal, this.city);
    },

    buttonLoadOnTap: function(e) {
      if (e.keyCode === 13) {
        if (this.postal === $("#customer-PostalCode").val()) return;
        this.ResetVariable();
        this.postal = $("#customer-PostalCode").val();
        this.LoadPostal(this.postal);
      }
    },

    buttonSaveOnTap: function(e) {
      e.stopPropagation();
      this.ResetVariable();
      this.ValidateFields();
    },

    ClearFields: function() {
      $("#customer-PostalCode").val("");
      $("#customer-name").val("");
      $("#customer-Address").val("");
      $("#customer-State").val("");
      $("#customer-Phone").val("");
      $("#customer-Email").val("");
      $("#customer-Site").val("");
      this.ClearCity();
    },

    GetCity: function(model) {
      this.ResetVariable();
      this.postal = $("#customer-PostalCode").val();
      var city = model.get("City");
      this.LoadPostal(this.postal, city);
    },

    EditCustomer: function(model) {
      if (Global.EditCustomerLoaded) return;
      Global.EditCustomerLoaded = true;
      var _classcode, _paymentTerm, _taxCode;

      this.ClearCity();

      this.GetCity(model);
      if (!Shared.IsNullOrWhiteSpace(model.get("TrackLoyaltyPoints"))) {
        _chkLoyaltyPointsState = false;
        this.LoyaltyPointsCheck_Changed();
      } else {
        _chkLoyaltyPointsState = true;
        this.LoyaltyPointsCheck_Changed();
      }
      $("#customer-name").val(model.get("CustomerName"));
      $("#customer-Address").val(model.get("Address"));

      $("#customer-Phone").val(model.get("Telephone"));
      $("#customer-Email").val(model.get("Email"));
      $("#customer-Site").val(model.get("Website"));

      this.customerCode = model.get("CustomerCode");

      this.countrySelected = model.get("Country");

      this.classCode = model.get("ClassCode");
      this.paymentTerm = model.get("PaymentTerm");
      this.taxCode = model.get("TaxCode");

      this.postalCode = model.get("PostalCode");
      this.city = model.get("City");
      this.state = model.get("State");
      this.county = model.get("County");
      this.businessType = model.get("BusinessType");
      $("#cmb-customer-customertype").html('<option selected>' + this.businessType + '</option>');
      $("#cmb-customer-customertype").selectmenu("refresh");
      $("#cmb-customer-customertype").addClass('ui-disabled');
      this.SetSelectedCountry();

      this.originalModel = new BaseModel();
      this.originalModel.set(model.attributes);

      $('#customer-PostalCode').val(this.postalCode).blur();
    },

    DisplayResult: function(model) {
      if (model.ErrorMessage) {
        console.log(model.ErrorMessage);

        //Added to Prevent Repeating error message thrown from webservice.
        var errMsg;
        if (model.ErrorMessage.indexOf("Invalid E-mail address") !== -1) errMsg = "Invalid E-mail Address";
        if (!errMsg && model.ErrorMessage.indexOf("Invalid URL") !== -1) errMsg = "Invalid URL";
        if (!errMsg) errMsg = model.ErrorMessage;

        //if(!Global.isBrowserMode)
        navigator.notification.alert(errMsg, null, "Error Saving", "OK");
        this.HideActivityIndicator();
      } else {

        //BEGIN - GEMINI: CSL-5652 APR-18-2013
        var tempCollection = new PostalCollection();
        tempCollection.add(model);
        if (this.options.FormType == FormType.NewCustomer.FormTitle) {
          this.trigger('createdCustomer', tempCollection.at(0), FormType.NewCustomer.FormTitle); //this.headerInfo.SetSelectedCustomer(tempCollection.at(0));
        } else {
          this.trigger('updatedCustomer', tempCollection.at(0), FormType.EditCustomer.FormTitle);
        }

        Global.CurrentCustomer = model;
        Global.ShipTo.ShipToCode = model.ShipToCode;
        //if(this.options.FormType == FormType.NewCustomer.FormTitle) this.headerInfo.RecalculatePrice();
        this.HideActivityIndicator();
        this.HideCustomerForm();
      } //END
    },

    ProcessResult: function() {
      Global.CurrentCustomer = model;
      if (model.ShipToName === null && model.ShipToAddress === null) {
        this.SetCustomerName(model.CustomerName, model.CustomerCode, model.DefaultShipToName, model.Address);
      } else {
        this.SetCustomerName(model.CustomerName, model.CustomerCode, model.ShipToName, model.ShipToAddress);
      }

      Global.ShipTo.ShipToCode = model.ShipToCode;
      //if(this.options.FormType == FormType.NewCustomer.FormTitle) this.headerInfo.RecalculatePrice();
      this.HideActivityIndicator();
      this.HideCustomerForm();
    },

    HideCustomerForm: function() {
      _chkLoyaltyPointsState = false; //reset

      Shared.FocusToItemScan();
      this.remove();
      this.unbind();
      this.ClearFields();
      this.HideActivityIndicator();
      $("#main-transaction-blockoverlay").hide();
      // this.unbind();
    },

    LoadRetrievedPostal: function() {
      this.postalCollection.each(this.SetFields, this);
    },

    LoadPostal: function(postal, city) {
      if (postal == "") {
        this.ClearCity();
      } else {
        var self = this;
        Shared.LoadPostalByCode(postal,
          function(collection) {
            self.postalCollection.reset(collection);
            self.DisplayResultOnPostal(postal, city);

            var isPriority = self.IsPrioritizeFromPostalCode(self.countryCollection, self.countrySelected);

            switch (isPriority) {
              case true:
                self.LoadClasscodeFromPostal();
                break;
            }

          },
          function(error) {
            self.postalCollection.reset();
            self.postalCollection.RequestError(error, "Error Loading Postal Code");
            $("#customer-PostalCode").val("");
          });
      }
    },

    LoadClasscodeFromPostal: function() {
      var model = this.postalCollection.at(0);
      if (!Shared.IsNullOrWhiteSpace(this.postalCollection) && this.postalCollection.length > 0) {
        var model = this.postalCollection.at(0);
        var defaultRetail = model.get("DefaultRetailCustomerBillToClassTemplate");
        var defaultRetailShipto = model.get("DefaultRetailCustomerShipToClassTemplate");
        var defaultWholesale = model.get("DefaultWholesaleCustomerBillToClassTemplate");
        var defaultWholesalShipto = model.get("DefaultWholesaleCustomerShipToClassTemplate");

        if ((!Shared.IsNullOrWhiteSpace(defaultRetail) && !Shared.IsNullOrWhiteSpace(defaultRetailShipto)) ||
          (!Shared.IsNullOrWhiteSpace(defaultWholesale) && !Shared.IsNullOrWhiteSpace(defaultWholesalShipto))) {
          if (this.priorityPostalType === "Retail") {
            $("#cmb-customer-classtemplate option[value='" + defaultRetail + "']").attr("selected", "selected");
            $("#cmb-shipto-classtemplate option[value='" + defaultRetailShipto + "']").attr("selected", "selected");

            this.SelectedClassCode = defaultRetail;
            this.SelectedShipToClassCode = defaultRetailShipto;
          } else {
            $("#cmb-customer-classtemplate option[value='" + defaultWholesale + "']").attr("selected", "selected");
            $("#cmb-shipto-classtemplate option[value='" + defaultWholesalShipto + "']").attr("selected", "selected");

            this.SelectedClassCode = defaultWholesale;
            this.SelectedShipToClassCode = defaultWholesalShipto;
          }
        } else {
          $("#cmb-customer-classtemplate option[value='" + this.classCode + "']").attr("selected", "selected");
          $("#cmb-shipto-classtemplate option[value='" + this.shipToClassCode + "']").attr("selected", "selected");
        }
      }

      $("#cmb-customer-classtemplate").selectmenu("refresh");
      $("#cmb-shipto-classtemplate").selectmenu("refresh");
    },

    LoadCustomerSchema: function() {
      var self = this;
      this.customerschema.fetch({
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.SetCustomerSchema(response);
        }
      });
    },

    ResetVariable: function() {
      this.postal = "";
      this.customerName = "";
      this.address = "";
      //this.city         = "",
      //this.state        = "",
      this.phone = "";
      this.email = "";
      this.website = "";
      this.country = "";
    },

    SetCustomerSchema: function(model) {
      if (this.formType == FormType.NewCustomer.FormTitle) {
        this.businessType = model.BusinessType;
        this.classCode = model.ClassCode;
        this.classTemplate = model.ClassCode;
        this.paymentTerm = model.PaymentTermCode;
        this.taxCode = model.TaxCode;

        this.countrySelected = model.Country;
        this.SetSelectedCountry();
      }
      if (this.formType == FormType.NewCustomer.FormTitle) this.FetchTaxSchemes();
    },
    // Begin : CSL-1442 : 07.04.2013

    FetchTaxSchemes: function() {
      var _mdl = new BaseModel();

      _mdl.on('sync', this.FetchTaxSchemeSuccess, this)
      _mdl.on('error', this.FetchTaxSchemeFailed, this)

      _mdl.url = Global.ServiceUrl + Service.CUSTOMER + Method.TAXSCHEMELOOKUP + 100 + '/' + Global.Preference.CompanyCountry;
      _mdl.set({
        StringValue: ""
      });
      _mdl.save();
    },

    FetchTaxSchemeSuccess: function(model, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (!this.IsNullOrWhiteSpace(response.ErrorMessage)) {
        navigator.notification.alert('Fetching Tax Response : ' + response.ErrorMessage, null, "Error", "OK");
        return;
      }
      this.ResetTaxSchemes(response.SystemTaxSchemes);
      this.EnableDisableClassTemplates();
    },

    FetchTaxSchemeFailed: function(error, xhr, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      model.RequestError(error, "Error Fetching Tax Schemes ");
    },

    ResetTaxSchemes: function(taxSchemes) {
      $('#customer-TaxCode > option[val !=""]').remove();

      this.taxSchemeCollection = new BaseCollection();
      this.taxSchemeCollection.reset(taxSchemes);
      this.taxSchemeCollection.each(this.FillTaxCombobox, this);
      this.SetSelectedTaxCode();
    },

    FillTaxCombobox: function(model) {
      var _taxDesctiption = model.get('TaxDescription');
      var _taxCode = model.get('TaxDescription');
      $('#customer-TaxCode').append(new Option(_taxDesctiption, _taxCode))
    },

    TaxCodeChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      this.taxCode = _val;
    },

    SetSelectedTaxCode: function(taxCode) {
      if (taxCode) $('#customer-TaxCode').val(taxCode).change();
      else $('#customer-TaxCode').val(this.taxCode).change()
    },
    // END : CSL-1442 : 07.04.2013

    EnableDisableClassTemplates: function() {
      if (!Global.Preference.AllowChangeClassTemplate || Global.Preference.AllowChangeClassTemplate === undefined || Global.Preference.AllowChangeClassTemplate === null) {
        $('#customer-ClassTemplate-container .ui-icon-arrow-d').addClass('ui-disabled');
        $('#shipto-ClassTemplate-container .ui-icon-arrow-d').addClass('ui-disabled');
        $('#cmb-shipto-classtemplate').attr('disabled', 'disabled');
        $('#cmb-customer-classtemplate').attr('disabled', 'disabled');


      } else {
        $('#cmb-customer-classtemplate').removeAttr('disabled');
        $('#cmb-shipto-classtemplate').removeAttr('disabled');
        $('#customer-ClassTemplate-container .ui-icon-arrow-d').removeClass('ui-disabled');
        $('#shipto-ClassTemplate-container .ui-icon-arrow-d').removeClass('ui-disabled');
      }
    },

    SetCustomerDetails: function() {
      this.postal = $("#customer-PostalCode").val();
      this.customerName = $("#customer-name").val();
      this.address = $("#customer-Address").val();
      this.city = $("#customer-City").val();
      this.state = $("#customer-State").val();
      this.country = $("#customer-country").val(); //Portion added by PR.Ebron (11.21.2012) >> Country Lookup Feature Task >> JIRA ID : INTMOBA-320
      this.phone = $("#customer-Phone").val();
      this.email = $("#customer-Email").val();
      this.website = $("#customer-Site").val();
      this.selectedClassCode = $('#cmb-customer-classtemplate').val();
      this.selectedShipToClassCode = $('#cmb-shipto-classtemplate').val();
      //if(this.formType === FormType.EditCustomer.FormTitle) this.classCode    = $("#cmb-customer-classtemplate option:selected").val();

      var _customer = new BaseModel();
      _customer.set({
        CustomerCode: this.customerCode,
        CustomerName: this.customerName,
        Country: this.country,
        Address: this.address,
        City: this.city,
        State: this.state,
        County: this.county,
        PostalCode: this.postal,
        Telephone: this.phone,
        Website: this.website,
        PaymentTerm: this.paymentTerm,
        PaymentTermCode: this.paymentTerm,
        Email: this.email,
        DefaultClassTemplate: this.classTemplate,
        BusinessType: this.businessType,
        TaxCode: this.taxCode,
        TrackLoyaltyPoints: _chkLoyaltyPointsState,
        AssignedTo: Global.Username,
        ClassCode: (this.selectedClassCode) ? this.selectedClassCode : this.classCode,
        ShipToClassCode: (this.selectedShipToClassCode) ? this.selectedShipToClassCode : this.shipToClassCode
      });

      if (this.options.FormType != FormType.NewCustomer.FormTitle) {
        _customer.set({
          ClassCode: this.classCode,
          ShipToClassCode: this.shipToClassCode
        });
      }

      this.AddCustomer(_customer);
    },

    ClearCity: function() {
      $('#customer-City > option[val !=""]').remove();
      $('#customer-City').append(new Option("City...", ""));
      $("#customer-City").prop("selectedIndex", 0);
      $("#customer-City").trigger('change');
      $("#customer-State").val("");
    },

    SetState: function() {
      this.county = "";
      var _city = $("#customer-City option:selected").val();

      if (this.state != null && this.state != undefined && this.state != "") {
        $("#customer-State").val(this.state);
        this.state = "";
        this.city = "";
        return;
      }

      if (_city != "") {
        var _model = this.postalCollection.find(function(model) {
          return _city = model.get("City");
        });
        if (!Shared.IsNullOrWhiteSpace(_model.get("County"))) {
          this.county = _model.get("County");
        }
        var _state = _model.get("StateCode");
        $("#customer-State").val(_state);
      } else {
        $("#customer-State").val("");
      }

    },

    SetFields: function(postal) {
      var city = postal.get("City");
      $('#customer-City').append(new Option(city, city));
    },

    SetCustomerName: function(CustomerName, CustomerCode, ShipToName, ShipToAddress) {
      //Global.CustomerName = CustomerName;
      //Global.CustomerCode = CustomerCode;

      $("#label-customername").html(Shared.TrimCustomerName());
      $("#lbl-customerName").html(Shared.TrimCustomerName());

      //CSL - 8889 : 06.06.2013
      //Global.DefaultShipTo = ShipToName + ",<br/>"+ShipToAddress;  << original code
      //start modification 06.06.13
      Global.DefaultShipTo = ShipToName + ",";
      Global.DefaultShipToAddress = ShipToAddress;
      $("#label-shipto i").html(Shared.TrimDefaultShipTo());
      $("#label-shipto i").append('<br/>' + Shared.Escapedhtml(Global.DefaultShipToAddress))
        //end modification.
    },

    /*
     * Show Customer Form
     */
    Show: function() {
      $("#customerForm").show();
      this.InitializeThings();
      //this.$el.append( this._template );
      $("#customerForm").trigger('create');
    },

    ShowSpinner: function() {
      $("#spin").remove();
      $("#main-transaction-blockoverlay").addClass('z3000');
      target = document.getElementById('customerForm');
      this.ShowActivityIndicator(target);
      $("<h5>Saving...</h5>").appendTo($("#spin"));
    },

    ShowActivityIndicator: function(target) {
      $("<div id='spin'></div>").appendTo(target);
      var _target = document.getElementById('spin');
      _spinner = Spinner;
      _spinner.opts.color = '#fff'; //The color of the spinner
      _spinner.opts.lines = 13; // The number of lines to draw
      _spinner.opts.length = 7; // The length of each line
      _spinner.opts.width = 4; // The line thickness
      _spinner.opts.radius = 10; // The radius of the inner circle
      _spinner.opts.top = 'auto'; // Top position relative to parent in px
      _spinner.opts.left = 'auto';
      _spinner.spin(_target);
    },

    HideActivityIndicator: function() {
      $("#main-transaction-blockoverlay").removeClass('z3000');
      _spinner = Spinner;
      _spinner.stop();
      $("#spin").remove();
    },

    ValidateFields: function() {
      var postal = $("#customer-PostalCode").val();
      var customerName = $("#customer-name").val();
      var email = $("#customer-Email").val();
      var site = $("#customer-Site").val();
      var isAllowByPassValidation = (this.customerCode === "DefaultPOSShopper" || this.customerCode === "DefaultECommerceShopper");

      if (postal === "" && !isAllowByPassValidation) {
        navigator.notification.alert("Please input a valid Zip Code.", null, "Zip Code is Required", "OK");
        //console.log("postal");
      } else if (customerName === "") {
        navigator.notification.alert("Please enter a Customer Name.", null, "Customer Name is Required", "OK");
        //console.log("name");
      }
      //  else if (this.IsCheckEmail(email) && email === "" && !isAllowByPassValidation) {
      //   navigator.notification.alert("Please input a valid Email.", null, "Email is Required", "OK");
      //   //console.log("email");
      // }
       else if ((email != null && email != "") && Shared.ValidateEmailFormat(email) && !isAllowByPassValidation) {
        navigator.notification.alert("Email format is invalid.", null, "Invalid Email", "OK");
      } else if (Shared.ValidateUrlFormat(site, true) && !isAllowByPassValidation) {
        navigator.notification.alert("Url format is invalid.", null, "Invalid Url", "OK");
      } else {
        this.ShowSpinner();
        this.SetCustomerDetails();
      }
    },

    IsCheckEmail: function(email) {
      if (this.formType != FormType.EditCustomer.FormTitle) return true;
      if (!this.originalModel) return true;
      if ((!this.originalModel.get("Email") || this.originalModel.get("Email") == "") && (!email || email == "")) return false;
      if (this.originalModel.get("Email") == email) return false;
      return true;
    },

    AssignNumericValidation: function(e) {
      Shared.Input.NonNegativeInteger('#' + e.target.id);
    }
  });
  return CustomerFormView;
});
