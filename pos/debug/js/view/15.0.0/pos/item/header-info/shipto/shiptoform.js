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
  'shared/enum',
  'model/base',
  'model/postal',
  'model/country',
  'model/customerschema',
  'model/lookupcriteria',
  'collection/postal',
  'collection/countries',
  'collection/classtemplates',
  'collection/base',
  'text!template/15.0.0/pos/item/header-info/shipto/shiptoform.tpl.html',
  'view/spinner',
  'view/15.0.0/pos/postal/addpostal'
], function($, $$, _, Backbone,
  Global, Service, Method, Shared, Enum, BaseModel,
  PostalModel, CountryModel, CustomerSchemaModel, LookupCriteriaModel,
  PostalCollection, CountryCollection, ClassTemplateCollection, BaseCollection,
  template,
  Spinner, AddPostalView) {

  var FormType = {
    NewShipTo: {
      FormTitle: "New Ship To",
      AttribName: "Ship To Name"
    },

    EditShipTo: {
      FormTitle: "Edit Ship To",
      AttribName: "Ship To Name"
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

  var chkSetAsDefault = false;
  var chkIsDefaultShipTo = "#shipto-IsDefaultshipto";

  var ShipToFormView = Backbone.View.extend({
    _template: _.template(template),

    classCode: "",
    classTemplate: "",
    paymentTerm: "",
    paymentTermCode: "",
    taxCode: "",
    postal: "",
    name: "",
    address: "",
    country: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    website: "",
    formType: "",
    county: "",

    events: {
      "keyup #shipto-PostalCode": "buttonLoadOnTap",
      "blur #shipto-PostalCode": "buttonLoadOnBlur",
      "focus #shipto-PostalCode": "buttonLoadOnFocus",
      "tap #shipto-save-btn": "buttonSaveOnTap",
      "tap #shipto-cancel-btn": "buttonCancelOnTap",
      "change #shipto-City": "SetState",
      "change #shipto-country": "CountryChanged",
      "change #cmb-shipto-classtemplate": "ClassTemplateChanged",
      "change #shipto-PaymentTerm": "PaymentTermChanged",
      "focus #shipto-Phone": "AssignNumericValidation",
      "change #shipto-TaxCode": "TaxCodeChanged",

      "tap #shipto-IsDefaultshipto": "IsDefaultShipToChecked"
    },

    /*
     * Button events
     */
    buttonCancelOnTap: function(e) {
      e.preventDefault();
      this.CloseForm();
    },

    IsViewOnLoad: function() {
      if (!Shared.IsNullOrWhiteSpace(this.onLoad)) {
        if (!Shared.IsNullOrWhiteSpace(this.city) && this.city != "Please enter city") {
          $('#shipto-City > option[val !=""]').remove();
          $('#shipto-City').append(new Option(this.city, this.city));
          $("#shipto-City").prop("selectedIndex", 0);
          $("#shipto-City").trigger('change');
        }
        if (!Shared.IsNullOrWhiteSpace(this.state) && this.state != "Please enter state code") {
          $("#shipto-State").val(this.state);
        }
        console.log("CITY : " + this.city + " , STATE :" + this.state);
        this.onLoad = false;
        return true;
      }
      return false;
    },
    buttonLoadOnBlur: function() {
      if (this.IsViewOnLoad()) return;
      if (this.postal === $("#shipto-PostalCode").val()) return;
      this.ResetVariable();
      this.postal = $("#shipto-PostalCode").val();
      this.LoadPostal(this.postal, this.city);
    },

    buttonLoadOnFocus: function(e) {
      this.state = "";
      this.city = "";
    },

    buttonSaveOnTap: function(e) {
      e.stopPropagation();
      if (this.AllowToChangeShipto()) {
        this.ResetVariable();
        this.ValidateFields();
      }
    },

    ClearFields: function() {
      $("#shipto-PostalCode").val("");
      $("#shipto-name").val("");
      $("#shipto-Address").val("");
      $("#shipto-State").val("");
      $("#shipto-Phone").val("");
      $("#shipto-Email").val("");
      $("#shipto-Site").val("");
      this.ClearCity();
    },

    IsDefaultShipToChecked: function() {
      chkSetAsDefault = Shared.CustomCheckBoxChange(chkIsDefaultShipTo, chkSetAsDefault);
    },

    initialize: function() {
      this.formType = this.options.FormType;
      this.render(this.formType);
      _view = this;
    },

    render: function(type) {
      chkSetAsDefault = false;
      this.InitializeThings();

      switch (type) {
        case FormType.NewShipTo.FormTitle:
          this.$el.append(this._template({
            FormTitle: FormType.NewShipTo.FormTitle,
            Name: FormType.NewShipTo.AttribName
          }));
          $("#shiptoForm").trigger('create');
          $("#shiptoForm").css("top", "40%");
          this.onLoad = false;
          break;
        case FormType.EditShipTo.FormTitle:
          this.$el.append(this._template({
            FormTitle: FormType.EditShipTo.FormTitle,
            Name: FormType.EditShipTo.AttribName
          }));
          $("#shiptoForm").trigger('create');
          $("#shiptoForm").css("top", "42%");
          this.onLoad = true;
          break;
      }

      //$("#shiptoForm").trigger('create');
      this.CheckProductEdition();

      if (!Global.Preference.AllowChangePaymentTerm) {
        $("#shipto-PaymentTerm").attr("disabled", "true");
        $(".shipto-PaymentTerm-container .ui-icon-arrow-d").addClass("ui-disabled");
      }

      if (!Global.Preference.AllowChangeTaxCode) {
        $("#shipto-TaxCode").attr("disabled", "true");
        $(".shipto-TaxCode-container .ui-icon-arrow-d").addClass("ui-disabled");
      }

      this.EnableSaveButton();
    },

    EnableSaveButton: function(isEnable) {
      if (isEnable) {
        $("#shipto-save-btn").removeClass("ui-disabled");
        $("#shipto-save-btn").removeAttr("disabled", "true");
      } else {
        $("#shipto-save-btn").addClass("ui-disabled");
        $("#shipto-save-btn").attr("disabled", "true");
      }
    },

    /*
     * Initialize Models and Collections
     */
    InitializeThings: function() {
      var self = this,
        doInit = function() {
          self.InitializePostalModel();
          self.InitializePostal();
          self.InitializeCountryModel();
          self.InitializeCountry();
          self.ispostalTriggered = false;
          self.InitializeCustomerSchemaModel();
        };

      if (Global.CurrentCustomer.Country) {
        doInit();
        return;
      }
      var tmpModel = new BaseModel();
      tmpModel.url = Global.ServiceUrl + Service.CUSTOMER + "loadcustomerbycode/" + Global.CurrentCustomer.CustomerCode;
      tmpModel.fetch({
        success: function(model, response) {
          if (response.Customers)
            if (response.Customers.length > 0) Global.CurrentCustomer.Country = response.Customers[0].Country;
          doInit();
        },
        error: function(model, error, response) {
          doInit();
        }
      })
    },

    InitializeCountryModel: function() {
      _rows = 1000;
      this.countryModel = new CountryModel();
      this.countryModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.COUNTRYCODELOOKUP + _rows;
    },

    InitializeCountry: function() {
      this.countryCollection = new CountryCollection();
      this.LoadCountries();
    },

    CheckProductEdition: function() {
      if (Global._UserIsCS) {
        Shared.ShowHideClassTemplates("shipto-ClassTemplate-container");
      }

      if (this.formType === FormType.EditShipTo.FormTitle) {
        Shared.ShowHideClassTemplates("shipto-ClassTemplate-container");
      }
    },

    LoadCountries: function() {
      var _self = this;
      this.index = 0;
      this.countryModel.set({
        Criteria: ""
      })

      this.countryModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.countryCollection.reset(response.Countries);
          _self.DisplayCountries();
          _self.EnableSaveButton(true);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Loading Countries");
          _self.EnableSaveButton(true);
        }
      });
    },

    DisplayCountries: function() {
      this.defaultCountry = "United States of America";
      if (this.countryCollection.length === 0) {
        console.log("no countries available.");
        navigator.notification.alert("No country available.", null, "No Country Found", "OK");
      } else {
        $('#shipto-country > option[val !=""]').remove();
        this.LoadRetrievedCountry();
        if (this.formType == FormType.NewShipTo.FormTitle) {
          this.SetSelectedCountry();
          if (!this.GetCountryByCustomer()) {
            $("#shipto-country").val(this.defaultCountry).change();
          } else {
            $("#shipto-country").val(this.GetCountryByCustomer()).change();
          }
        } else {
          this.FetchTaxSchemes();
        }
      }
    },

    LoadRetrievedCountry: function() {
      this.countryCollection.each(this.SetCountryOptions, this);
    },

    SetCountryOptions: function(country) {
      var _country = country.get("CountryCode");
      $('#shipto-country').append(new Option(_country, _country));
    },

    GetCountryByCustomer: function() {
      if (Global.CurrentCustomer)
        if (Global.CurrentCustomer.Country)
          if (Global.CurrentCustomer.Country != "") {
            return Global.CurrentCustomer.Country;
          }
      return;
    },

    SetSelectedCountry: function() {
      if (!this.countryCollection) return;
      if (this.countryCollection.length == 0) return;
      $("#shipto-country option:selected").removeAttr('selected');
      $("#shipto-country > option[value='" + this.countrySelected + "']").attr("selected", "selected");
      $("#shipto-country").trigger('change');
      $("#shipto-name").focus();
    },

    ClearPostalInfo: function() {
      $("#shipto-PostalCode").val("");
      $("#shipto-State").val("");
      this.ClearCity();
      this.postal = $("#shipto-PostalCode").val("");
    },

    RemoveInvalidPostals: function(model) {
      var _country = model.get("CountryCode");
      console.log("RemoveInvalidPostals: " + this.countrySelected);
      if (_country === this.countrySelected) {
        this.newCollection.add(model);
      }
    },
    AddNewPostal: function() {
      var _postal = $("#shipto-PostalCode").val();
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
    AcceptPostal: function(response) {
      this.countrySelected = response.CountryCode;
      this.SetSelectedCountry();
      $("#shipto-PostalCode").val(response.PostalCode);
      $("#shipto-State").val(response.StateCode);
      this.postal = response.PostalCode;
      this.city = response.City;
      this.LoadPostal(this.postal, this.city);
    },
    ClearPostalDetails: function() {
      $("#shipto-PostalCode").val("");
      this.postal = "";
      this.ClearCity();
    },
    DisplayResultOnPostal: function(postal, city) {
      //console.log(JSON.stringify(this.postalCollection));
      this.newCollection = new PostalCollection();
      this.postalCollection.each(this.RemoveInvalidPostals, this);
      this.postalCollection = this.newCollection;
      if (this.postalCollection.length === 0) {
        navigator.notification.confirm("The Postal Code '" + postal + "' does not exist in the Country selected. Do you want to add '" + postal + "' ?", confirmAddPostal, "Postal Not Found", ['Yes', 'No']);
      } else {
        $('#shipto-City > option[val !=""]').remove();
        this.LoadRetrievedPostal();
        if (city == "") {
          $("#shipto-City").prop("selectedIndex", 0);
        } else {
          $("#shipto-City option[value='" + city + "']").attr("selected", "selected");
        }
        $("#shipto-City").trigger('change');
      }
    },

    CountryChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      var _postalVal = $('#shipto-PostalCode').val();


      if (this.countrySelected != _val)
        if (_postalVal.length > 0) this.ClearPostalInfo();
      this.countrySelected = _val;
      if (this.formType == FormType.NewShipTo.FormTitle) this.ChangeClassCode(_val);
      this.PreviousCountrySelected = _val;
    },

    //Begin : CSL-1452 : 04.01.13 : EBRON
    FetchClassCodes: function(country) {
      if (!country || country == "") return;
      var self = this;
      var classTemplate = new LookupCriteriaModel();
      classTemplate.url = Global.ServiceUrl + Service.CUSTOMER + Method.CLASSTEMPLATELOOKUP + 100 + "/true";
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
      $('#cmb-shipto-classtemplate > option[val !=""]').remove();
      this.classTemplateCollection.each(this.FillClassTemplateComboBox, this);

      if (!Global.Preference.AllowChangeClassTemplate || Global.Preference.AllowChangeClassTemplate === undefined || Global.Preference.AllowChangeClassTemplate === null) {
        $('#cmb-shipto-classtemplate').addClass('ui-disabled');
      } else {
        $('#cmb-shipto-classtemplate').removeClass('ui-disabled');
      }
    },

    FillClassTemplateComboBox: function(model) {
      var _classDescription = model.get("ClassDescription");
      var _classCode = model.get("ClassCode");
      $('#cmb-shipto-classtemplate').append(new Option(_classCode + ' | ' + _classDescription, _classCode)); //value , option
      if (_classCode === Global.DefaultClassCode) {
        $("#cmb-shipto-classtemplate").prop("selectedIndex", this.classIndex);
        this.selectedClassCode = _classCode;
        $("#cmb-shipto-classtemplate").trigger('change');
      }
      this.classIndex++;
    },

    ClassTemplateChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      if (this.SelectedClassCode === _val) return;
      this.SelectedClassCode = _val;
      if (this.classTemplateCollection === undefined || this.classTemplateCollection.length === 0) return;
      this.classTemplateCollection.each(this.FindCTemplate, this);
    },

    FindCTemplate: function(model, valueToFind) {
      if (model.get("ClassCode") !== this.SelectedClassCode) return;
      //console.log("Found!" + model.get("ClassDescription"));
      this.classCode = model.get("ClassCode");
      this.classTemplate = model.get("ClassCode");
      this.paymentTerm = model.get("PaymentTermCode");
      this.paymentTermCode = model.get("PaymentTermCode");
      this.taxCode = model.get("TaxCode");
      this.SetSelectedTaxCode();

      var paymentTermGroup = model.get("PaymentTermGroup");
      this.FetchPaymentTerms(paymentTermGroup, "");
    },

    SetDefaultClassCode: function() {
      $('#cmb-shipto-classtemplate > option[val !=""]').remove();
      $('#cmb-shipto-classtemplate').append(new Option(this.classCode, this.classCode));
      $("#cmb-shipto-classtemplate").prop("selectedIndex", 0);
      $("#cmb-shipto-classtemplate").trigger('change');
    },

    //BEGIN : CSL-1439 : 06.27.13
    FetchPaymentTerms: function(paymentTermGroup, criteria) {
      if (this.IsNullOrWhiteSpace(paymentTermGroup)) return;
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
      $('#shipto-PaymentTerm > option[val !=""]').remove();
      this.paymentTermCollection.each(this.FillPaymentTermComboBox, this);
      $("#shipto-PaymentTerm").val(this.paymentTermCode).change();
      if (this.formType === FormType.EditShipTo.FormTitle)
        if (Global.EditShipToLoaded) $('#shipto-PaymentTerm').val(this.originalPTCode).change();
    },

    FillPaymentTermComboBox: function(model) {
      var _paymentTermDescription = model.get("PaymentTermDescription");
      var _paymentTermCode = model.get("PaymentTermCode");
      $('#shipto-PaymentTerm').append(new Option(_paymentTermDescription, _paymentTermCode)); //value , option
    },

    PaymentTermChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      this.paymentTerm = _val;
      this.paymentTermCode = _val;
    },

    IsNullOrWhiteSpace: function(str) {
      if (!str || str === null || str.trim() === "") return true;
      return false;
    },
    //END : CSL-1439 : 06.27.13

    //BEGIN ADD - MAR.08.2013 - FIGUEROA
    ChangeClassCode: function(country) {
      if (!country) return;
      if (country == "") return;

      tmp = new BaseModel();
      var self = this;

      tmp.url = Global.ServiceUrl + Service.CUSTOMER + Method.GETCLASSTEMPLATEBYCOUNTRY + country + "/true";
      tmp.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!model.get("ClassCode")) return;
          if (model.get("ClassCode") == "") return;
          Global.DefaultClassCode = model.get("ClassCode")
          console.log(Global.DefaultClassCode);
          if (self.formType == FormType.NewShipTo.FormTitle) {
            self.classCode = model.get("ClassCode");
            self.classTemplate = model.get("ClassCode");
            self.paymentTerm = model.get("PaymentTermCode");
            self.paymentTermCode = model.get("PaymentTermCode");
            self.taxCode = model.get("TaxCode");
          }
          self.FetchClassCodes(country);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          //model.RequestError(error, "Error Fetching Class Code");
        }
      });

    },
    //END ADD - MAR.08.2013 - FIGUEROA

    LoadPostal: function(postal, city) {
      if (postal == "") {
        this.ClearCity();
      } else {
        var self = this;
        Shared.LoadPostalByCode(postal,
          function(collection) {
            self.postalCollection.reset(collection);
            self.DisplayResultOnPostal(postal, city);
          },
          function(error) {
            self.postalCollection.reset();
            self.postalCollection.RequestError(error, "Error Loading Postal Code");
            $("#shipto-PostalCode").val("");
          });
      }
    },

    SetState: function() { /*jj*/
      var _city = $("#shipto-City option:selected").val();
      this.country = "";
      if (this.state != null && this.state != undefined && this.state != "") {
        $("#shipto-State").val(this.state);
        this.state = "";
        this.city = "";
        return;
      }

      if (_city != "") {
        var _model = this.postalCollection.find(function(model) {
          return _city = model.get("City");
        });

        if (_model == null) return;

        if (!Shared.IsNullOrWhiteSpace(_model.get("County"))) {
          this.county = _model.get("County");
        }
        var _state = _model.get("StateCode");
        $("#shipto-State").val(_state);
      } else {
        $("#shipto-State").val("");
      }
    },

    SetFields: function(postal) {
      var city = postal.get("City");
      $('#shipto-City').append(new Option(city, city)); /*jj-2*/
    },

    buttonLoadOnTap: function(e) {
      if (e.keyCode === 13) {
        //if(this.postal === $("#shipto-PostalCode").val()) return;
        this.ResetVariable();
        this.postal = $("#shipto-PostalCode").val();
        this.LoadPostal(this.postal);
      }
    },

    InitializePostalModel: function() {
      this.postalmodel = new PostalModel();
      this.postalmodel.on('remove', this.remove);
    },

    InitializePostal: function() {
      this.postalCollection = new PostalCollection();
    },

    InitializeCustomerSchemaModel: function() {
      this.shiptoschema = new CustomerSchemaModel();
      this.shiptoschema.url = Global.ServiceUrl + Service.CUSTOMER + Method.GETNEWSHIPTOSCHEMA;
      this.LoadCustomerSchema();
    },

    LoadCustomerSchema: function() {
      var self = this;
      this.shiptoschema.fetch({
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.SetCustomerSchema(response);
        }
      });
    },

    LoadRetrievedPostal: function() {
      this.postalCollection.each(this.SetFields, this);
    },

    ClearCity: function() {
      $('#shipto-City > option[val !=""]').remove();
      $('#shipto-City').append(new Option("City...", "")); /*jj-1*/
      $("#shipto-City").prop("selectedIndex", 0);
      $("#shipto-City").trigger('change');
    },

    /*
     * Set Customer Schema
     */
    SetCustomerSchema: function(model) {
      this.classTemplate = model.ClassCode;
      this.paymentTerm = model.PaymentTermCode;
      this.taxCode = model.TaxCode;
      this.classCode = model.ClassCode;
      this.paymentTermCode = model.PaymentTermCode;

      if (this.formType == FormType.NewShipTo.FormTitle) {
        if (!this.GetCountryByCustomer()) this.countrySelected = model.Country;
        else if (this.GetCountryByCustomer() === model.Country) this.countrySelected = this.GetCountryByCustomer();
        this.SetSelectedCountry();
      }
      if (this.formType == FormType.NewShipTo.FormTitle) this.FetchTaxSchemes();
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
    },

    FetchTaxSchemeFailed: function(error, xhr, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      navigator.notification.alert(error, "Error Fetching Tax Schemes");
    },

    ResetTaxSchemes: function(taxSchemes) {
      $('#shipto-TaxCode > option[val !=""]').remove();
      this.taxSchemeCollection = new BaseCollection();
      this.taxSchemeCollection.reset(taxSchemes);
      this.taxSchemeCollection.each(this.FillTaxCombobox, this);
      if (this.formType == FormType.EditShipTo.FormTitle) {
        if (!Global.EditShipToLoaded) this.trigger("formLoaded", this);
      } else {
        this.SetSelectedTaxCode();
      }
    },

    FillTaxCombobox: function(model) {
      var _taxDesctiption = model.get('TaxDescription');
      var _taxCode = model.get('TaxCode');
      $('#shipto-TaxCode').append(new Option(_taxDesctiption, _taxCode))
    },

    TaxCodeChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      this.taxCode = _val;
    },

    SetSelectedTaxCode: function(taxCode) {
      if (taxCode) $('#shipto-TaxCode').val(taxCode).change();
      else $('#shipto-TaxCode').val(this.taxCode).change()
    },

    // END : CSL-1442 : 07.04.2013

    /*
     * Save ShipTo
     */

    SetShipToDetails: function() {
      this.postal = $("#shipto-PostalCode").val();
      this.customerName = $("#shipto-name").val();
      this.address = $("#shipto-Address").val();
      this.city = $("#shipto-City").val();
      this.state = $("#shipto-State").val();
      this.phone = $("#shipto-Phone").val();
      this.email = $("#shipto-Email").val();
      this.country = $("#shipto-country").val();
      this.website = $("#shipto-Site").val();
      this.isDefaultShipTo = chkSetAsDefault;
      //if(this.formType === FormType.EditShipTo.FormTitle) this.classCode = $("#cmb-shipto-classtemplate option:selected").val();

      var _shipto = {
        ShipToCode: this.shipToCode,
        ShipToName: this.customerName,
        CustomerCode: Global.CustomerCode,
        Country: this.country,
        ClassCode: this.classCode,
        Address: this.address,
        City: this.city,
        County: this.county,
        State: this.state,
        PostalCode: this.postal,
        Telephone: this.phone,
        WebSite: this.website,
        PaymentTermCode: this.paymentTermCode,
        Email: this.email,
        //DefaultClassTemplate : this.classTemplate,
        TaxCode: this.taxCode,
        IsDefaultShipTo: this.isDefaultShipTo
      };
      console.log(JSON.stringify(_shipto));

      this.AddShipTo(_shipto);
    },

    AddShipTo: function(shipto) {
      var self = this;
      switch (this.options.FormType) {
        case FormType.NewShipTo.FormTitle:
          var serverUrl = Global.ServiceUrl + Service.CUSTOMER + Method.CREATESHIPTO;
          break;
        case FormType.EditShipTo.FormTitle:
          var serverUrl = Global.ServiceUrl + Service.CUSTOMER + Method.UPDATESHIPTO;
          break;
      }

      this.postalmodel.url = serverUrl;
      this.postalmodel.set(shipto);
      this.postalmodel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.DisplayResult(response);
        }
      });
    },

    GetCity: function(model) {
      this.ResetVariable();
      this.postal = $("#shipto-PostalCode").val();
      var city = model.get("City");
      this.LoadPostal(this.postal, city);
    },

    EditShipTo: function(model) {
      if (Global.EditShipToLoaded) return;
      Global.EditShipToLoaded = true;
      this.ClearCity();

      //$("#shipto-PostalCode").val(model.get("PostalCode"));
      this.GetCity(model);

      if (!Shared.IsNullOrWhiteSpace(model.get("IsDefaultShipTo"))) {
        chkSetAsDefault = false;
        this.IsDefaultShipToChecked();
      } else {
        chkSetAsDefault = true;
        this.IsDefaultShipToChecked();
      }

      $("#shipto-name").val(model.get("ShipToName"));
      $("#shipto-Address").val(model.get("Address"));

      $("#shipto-Phone").val(model.get("Telephone"));
      $("#shipto-Email").val(model.get("Email"));
      $("#shipto-Site").val(model.get("WebSite"));
      $("#shipto-IsDefaultShipTo").prop("checked", model.get("IsDefaultShipTo")).checkboxradio("refresh");

      this.countrySelected = model.get("Country");
      console.log("EditShipTo: " + this.countrySelected + "/n " + this.PreviousCountrySelected);

      this.paymentTermCode = model.get("PaymentTermCode");
      this.paymentTerm = this.paymentTermCode;

      this.taxCode = model.get("TaxCode");

      this.shipToCode = model.get("ShipToCode");
      this.classCode = model.get("ClassCode");

      this.originalPTCode = this.paymentTermCode;
      this.postalCode = model.get("PostalCode");
      this.city = model.get("City");
      this.state = model.get("State");
      this.county = model.get("County");
      this.SetSelectedCountry();
      $('#shipto-PostalCode').val(this.postalCode).blur();
      this.SetSelectedTaxCode();
      //this.FetchTaxSchemes();
      this.FetchPaymentTerms(model.get("PaymentTermGroup"));
    },

    DisplayResult: function(model) {
      this.HideActivityIndicator();
      if (model) {
        if (model.ErrorMessage) {
          console.log(model.ErrorMessage);
          navigator.notification.alert(model.ErrorMessage, null, "Error", "OK");
          return;
        }

        var tempCollection = new PostalCollection();
        tempCollection.add(model);
        if (this.options.FormType == FormType.NewShipTo.FormTitle) this.trigger("createdShipTo", tempCollection.at(0));
        else this.trigger("updatedShipto", tempCollection.at(0));

        this.CloseForm();
      }
    },

    /*
     * Show Ship To Form
     */
    Show: function() {
      $("#shiptoForm").show();
      this.InitializeModel();
      $("#shiptoForm").trigger('create');
    },

    /*
     * Hide Ship To Form
     */
    CloseForm: function() {
      Shared.FocusToItemScan();
      this.remove();
      this.unbind();
      this.ClearFields();
      this.HideActivityIndicator();
      $("#main-transaction-blockoverlay").hide();
    },

    ValidateFields: function() {
      var postal = $("#shipto-PostalCode").val();
      var name = $("#shipto-name").val();
      var email = $("#shipto-Email").val();
      var site = $("#shipto-Site").val();
      var isAllowByPassValidation = (this.shipToCode === "DefaultPOSShopperShipTo" || this.shipToCode === "SHIP-000001");
      if (name === "") {
        navigator.notification.alert("Please enter a Ship To Name.", null, "Ship To Name is Required", "OK");
        //console.log("name");
      } else if (postal === "" && !isAllowByPassValidation) {
        navigator.notification.alert("Please input a valid Zip Code.", null, "Zip Code is Required", "OK");
        //console.log("postal");
      } else if (email === "" && !isAllowByPassValidation) {
        navigator.notification.alert("Please input a valid Email.", null, "Email is Required", "OK");
        //console.log("email");
      } else if (this.ValidateEmailFormat(email) && !isAllowByPassValidation) {
        navigator.notification.alert("Email format is invalid.", null, "Invalid Email", "OK");
      } else if (Shared.ValidateUrlFormat(site, true) && !isAllowByPassValidation) {
        navigator.notification.alert("Url format is invalid.", null, "Invalid Url", "OK");
      } else {
        this.ShowSpinner();
        this.SetShipToDetails();
      }
    },
    AllowToChangeShipto: function() {
      var msg;
      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesPayment:
          break;
        case Enum.TransactionType.SalesRefund:
          break;
        case Enum.TransactionType.Recharge:
          break;
        default:
          return true; //if allowed to change shipTo address
          break;
      }
      msg = "Your action is not allowed for '" + Global.TransactionType + "'."
      navigator.notification.alert(msg, null, "Action Not Allowed", "OK");
      return false;
    },
    ResetVariable: function() {
      this.postal = "",
        this.name = "",
        this.address = "",
        //this.city    = "",
        //this.state   = "",
        this.country = "",
        this.phone = "",
        this.email = "",
        this.website = ""
    },

    /*
     * Show Spinner (Loading..)
     */
    ShowSpinner: function() {
      $("#spin").remove();
      $("#main-transaction-blockoverlay").show();
      target = document.getElementById('main-transaction-page');
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
      _spinner = Spinner;
      _spinner.stop();
      $("#spin").remove();
    },

    ValidateEmailFormat: function(email) {
      var emailcheck = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      return (email.search(emailcheck) == -1);
    },

    // CSL : 8822 >> 06.05.13 >> PREBRON
    AssignNumericValidation: function(e) {
      var elem = '#' + e.target.id;
      Shared.Input.NonNegativeInteger(elem);
    }
  });
  return ShipToFormView;
});
