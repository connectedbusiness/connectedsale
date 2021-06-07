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
  'model/postal',
  'model/country',
  'model/customerschema',
  'collection/postal',
  'collection/countries',
  'text!template/20.0.0/pos/item/header-info/customer/customerform.tpl.html',
  'view/spinner',
], function($, $$, _, Backbone, Global, Service, Method, Shared,
  PostalModel, CountryModel, CustomerSchemaModel, PostalCollection, CountryCollection, CustomerFormTemplate, Spinner) {
  var isFirstTimeLoaded = null;
  var chkLoyaltyPoints = "#chkloyalty-points";
  var _chkLoyaltyPointsState = false;
  var EditCustomerFormView = Backbone.View.extend({
    _template: _.template(CustomerFormTemplate),
    events: {
      //"keyup #editcustomer-PostalCode" 	: "buttonLoadOnTap",
      "keypress #editcustomer-PostalCode": "buttonLoadOnTap",
      "blur #editcustomer-PostalCode": "buttonLoadOnFocus",
      "tap #editcustomer-save-btn": "buttonSaveOnTap",
      "tap #editcustomer-cancel-btn": "buttonCancelOnTap",
      "change #editcustomer-City": "SetState",
      "tap #editcustomer-country": "CountryTap",
      "change #editcustomer-country": "CountryChanged",
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

    initialize: function() {
      this.render();
    },

    render: function() {
      isFirstTimeLoaded = true;
      this.InitializeThings();
      this.$el.append(this._template({
        FormTitle: "Edit Customer",
        Name: "CustomerName"
      }));
      $("#editcustomerForm").trigger('create');
    },

    InitializePostalModel: function() {
      this.postalmodel = new PostalModel();
    },

    InitializeCustomerSchemaModel: function() {
      this.customerschema = new CustomerSchemaModel();
      this.customerschema.url = Global.ServiceUrl + Service.CUSTOMER + Method.GETNEWCUSTOMERSCHEMA;
      this.LoadCustomerSchema();
    },

    InitializePostal: function() {
      this.postalCollection = new PostalCollection();
    },

    InitializeThings: function() {
      this.InitializePostalModel();
      this.InitializePostal();
      //Portion added by PR.Ebron (11.21.2012) >> Country Lookup Feature >> JIRA ID : INTMOBA-320
      this.InitializeCountryModel();
      this.InitializeCountry();
      //end of added/ modified portion..
      this.InitializeCustomerSchemaModel();
      $("#editcustomer-name").focus();
    },

    //Portion added by PR.Ebron (11.21.2012) >> Country Lookup Feature >> JIRA ID : INTMOBA-320
    InitializeCountryModel: function() {
      _rows = 10000;
      this.countryModel = new CountryModel();
      this.countryModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.COUNTRYCODELOOKUP + _rows;
    },

    InitializeCountry: function() {
      this.countryCollection = new CountryCollection();
      this.LoadCountries();
    },

    LoadCountries: function() {
      var self = this;
      this.index = 0;
      this.countryModel.set({
        Criteria: ""
      })

      this.countryModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.countryCollection.reset(response.Countries);
          self.DisplayCountries();
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Loading Country List");
        }
      });
    },


    DisplayCountries: function() {
      if (this.countryCollection.length === 0) {
        console.log("no countries available.");
        navigator.notification.alert("No country available.", null, "No Country Found", "OK");
      } else {
        $('#editcustomer-country > option[val !=""]').remove();
        this.LoadRetrievedCountry();
      }
    },

    LoadRetrievedCountry: function() {
      this.countryCollection.each(this.SetCountryOptions, this);
    },

    SetCountryOptions: function(country) {
      var _country = country.get("CountryCode");
      $('#editcustomer-country').append(new Option(_country, _country));
    },

    SetSelectedCountry: function(model) {
      var _CountryCode = model.get("CountryCode");
      $("#editcustomer-country").val(_CountryCode);
      $("#editcustomer-country").trigger('change');
    },


    LoyaltyPointsCheck_Changed: function() {
      _chkLoyaltyPointsState = Shared.CustomCheckBoxChange(chkLoyaltyPoints, _chkLoyaltyPointsState);
    },

    CountryTap: function() {
      this.isCountryTapped = true;
    },

    ClearPostalInfo: function() {
      $("#editcustomer-PostalCode").val("");
      $("#editcustomer-State").val("");
      this.ClearCity();
    },

    RemoveInvalidPostals: function(model) {
      var _country = model.get("CountryCode");
      console.log(_country);
      if (_country === this.countrySelected) {
        this.newCollection.add(model);
      }
    },

    //modified method and events as of :12.4.12 By PR. Ebron : for CountryLookup
    DisplayResultOnPostal: function(postal, city) {
      if (!isFirstTimeLoaded) {

        this.newCollection = new PostalCollection();
        this.postalCollection.each(this.RemoveInvalidPostals, this);
        this.postalCollection = this.newCollection;
      }
      if (this.postalCollection.length === 0) {
        navigator.notification.alert("The Zip Code " + postal + " does not exist in the Country selected.", null, "Zip Code Not Found", "OK");
        $("#editcustomer-PostalCode").val("");
        this.ClearCity();
      } else {
        $('#editcustomer-City > option[val !=""]').remove();
        this.LoadRetrievedPostal();
        if (city == "") {
          $("#editcustomer-City").prop("selectedIndex", 0);
        } else {
          $("#editcustomer-City option[value='" + city + "']").attr("selected", "selected");
        }
        $("#editcustomer-City").trigger('change');
      }
    },

    CountryChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      var _postalVal = $('#editcustomer-PostalCode').val();
      if (this.countrySelected != _val) {
        if (isFirstTimeLoaded) {} else if (_postalVal.length > 0) {
          this.ClearPostalInfo();
        }
      }
      this.countrySelected = _val;
    },

    //end of added/modified portion of PR.Ebron (11.21.2012)

    AddCustomer: function(customer) {
      var self = this;
      this.postalmodel.url = Global.ServiceUrl + Service.CUSTOMER + Method.UPDATECUSTOMER;
      this.postalmodel.set(customer);
      this.postalmodel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.DisplayResult(response);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Updating Customer");
        }
      });
    },

    buttonCancelOnTap: function(e) {
      e.preventDefault();
      this.HideCustomerForm();
    },

    buttonLoadOnFocus: function() {
      this.ResetVariable();
      this.postal = $("#editcustomer-PostalCode").val();
      var city = "";
      this.LoadPostal(this.postal, city);
    },

    buttonLoadOnTap: function(e) {
      if (e.keyCode === 13) {
        this.ResetVariable();
        this.postal = $("#editcustomer-PostalCode").val();
        var city = "";
        this.LoadPostal(this.postal, city);
      }
    },

    buttonSaveOnTap: function(e) {
      e.stopPropagation();
      this.ResetVariable();
      this.ValidateFields();
    },

    ClearFields: function() {
      $("#editcustomer-PostalCode").val("");
      $("#editcustomer-name").val("");
      $("#editcustomer-Address").val("");
      $("#editcustomer-State").val("");
      $("#editcustomer-Phone").val("");
      $("#editcustomer-Email").val("");
      $("#editcustomer-Site").val("");
      this.ClearCity();
    },

    GetCity: function(model) {
      this.ResetVariable();
      this.postal = $("#editcustomer-PostalCode").val();
      var city = model.get("City");
      this.LoadPostal(this.postal, city);
    },

    EditCustomer: function(model) {
      this.ClearCity();
      console.log("trackLoyaltyPoints: " + model.get("TrackLoyaltyPoints"));
      if (!Shared.IsNullOrWhiteSpace(model.get("TrackLoyaltyPoints"))) { //editcustv14
        this.LoyaltyPointsCheck_Changed();
      }
      $("#editcustomer-PostalCode").val(model.get("PostalCode"));

      this.GetCity(model);

      $("#editcustomer-name").val(model.get("CustomerName"));
      $("#editcustomer-Address").val(model.get("Address"));

      $("#editcustomer-Phone").val(model.get("Telephone"));
      $("#editcustomer-Email").val(model.get("Email"));
      $("#editcustomer-Site").val(model.get("Website"));

      this.customerCode = model.get("CustomerCode");
      this.classCode = model.get("ClassCode");
      this.country = model.get("Country");
      var _classcode, _paymentTerm, _taxCode;
      _classcode = model.get("ClassCode");
      _paymentTerm = model.get("PaymentTerm");
      _taxCode = model.get("TaxCode");
      this.SetCustomerSchemaFields(_classcode, _paymentTerm, _taxCode);
    },

    DisplayResult: function(model) {
      if (model.ErrorMessage) {
        console.log(model.ErrorMessage);
        this.HideActivityIndicator();
      } else {
        Global.CurrentCustomer = model;
        if (model.ShipToName === null && model.ShipToAddress === null) {
          this.SetCustomerName(model.CustomerName, model.CustomerCode, model.DefaultShipToName, model.Address);
        } else {
          this.SetCustomerName(model.CustomerName, model.CustomerCode, model.ShipToName, model.ShipToAddress);
        }

        this.HideActivityIndicator();
      }
    },

    HideCustomerForm: function() {
      $("#editcustomer-name").blur();
      $("#editcustomerForm").unbind('create');
      $("#editcustomerForm").remove();
      this.ClearFields();
      this.HideActivityIndicator();
      $("#main-transaction-blockoverlay").hide();

      this.undelegateEvents();
    },

    LoadCustomerSchemaDetails: function() {
      if (this.customerschema) {
        console.log(this.customerschema.get("ClassCode"));
        this.LoadRetrievedCustomerSchema(this.customerschema);
        this.InitializePostalModel();
        this.InitializePostal();
        $("#editcustomer-name").focus();
      } else {
        console.log("else");
        this.InitializeThings();
      }
    },

    LoadRetrievedCustomerSchema: function(model) {
      this.classCode = model.get("ClassCode");
      this.classTemplate = model.get("ClassCode");
      this.paymentTerm = model.get("PaymentTerm");
      this.taxCode = model.get("TaxCode");
      this.SetCustomerSchemaFields(this.classTemplate, this.paymentTerm, this.taxCode);
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
          },
          function(error) {
            self.postalCollection.reset();
            self.postalCollection.RequestError(error, "Error Loading Postal Code");
            $("#customer-PostalCode").val("");
          });
      }
    },

    LoadCustomerSchema: function() {
      var self = this;
      this.customerschema.fetch({
        success: function(model, response) {
          self.SetCustomerSchema(response);
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },

    ResetVariable: function() {
      this.postal = "",
        this.customerName = "",
        this.address = "",
        this.city = "",
        this.state = "",
        this.phone = "",
        this.email = "",
        this.website = "",
        this.country = ""
    },

    SetCustomerSchema: function(model) {
      this.classCode = model.ClassCode;
      this.classTemplate = model.ClassCode;
      this.paymentTerm = model.PaymentTermCode;
      this.taxCode = model.TaxCode;
      this.SetCustomerSchemaFields(this.classTemplate, this.paymentTerm, this.taxCode);
    },

    SetCustomerSchemaFields: function(classCode, paymentTerm, TaxCode) {
      $("#editcustomer-ClassTemplate").val(classCode);
      $("#editcustomer-PaymentTerm").val(paymentTerm);
      $("#editcustomer-TaxCode").val(TaxCode);
    },

    SetCustomerDetails: function() {
      this.postal = $("#editcustomer-PostalCode").val();
      this.customerName = $("#editcustomer-name").val();
      this.address = $("#editcustomer-Address").val();
      this.city = $("#editcustomer-City").val();
      this.state = $("#editcustomer-State").val();
      this.phone = $("#editcustomer-Phone").val();
      this.email = $("#editcustomer-Email").val();
      this.website = $("#editcustomer-Site").val();
      this.country = $("#editcustomer-country").val();

      var _customer = {
        CustomerCode: this.customerCode,
        CustomerName: this.customerName,
        Country: this.country,
        ClassCode: this.classCode,
        Address: this.address,
        City: this.city,
        State: this.state,
        PostalCode: this.postal,
        Telephone: this.phone,
        Website: this.website,
        PaymentTerm: this.paymentTerm,
        Email: this.email,
        DefaultClassTemplate: this.classTemplate,
        TaxCode: this.taxCode,
      };

      this.AddCustomer(_customer);
    },

    ClearCity: function() {
      $('#editcustomer-City > option[val !=""]').remove();
      $('#editcustomer-City').append(new Option("City...", ""));
      $("#editcustomer-City").prop("selectedIndex", 0);
      $("#editcustomer-City").trigger('change');
      $("#editcustomer-State").val("");
    },

    SetState: function() {
      var _self = this;
      var _city = $("#editcustomer-City option:selected").val();
      if (_city != "") {
        var _model = this.postalCollection.find(function(model) {
          return _city = model.get("City");
        });
        var _state = _model.get("StateCode");
        $("#editcustomer-State").val(_state);
        if (isFirstTimeLoaded) {
          setTimeout(function() {
            _self.SetSelectedCountry(_model); // Portion added by PR.Ebron (11.21.2012) >> Country Lookup Feature Task >> JIRA ID : INTMOBA-320
            console.log("isFirstTymLoaded" + isFirstTimeLoaded);
            isFirstTimeLoaded = false;
          }, 200);

        }
      } else {
        $("#editcustomer-State").val("");
      }

    },

    SetFields: function(postal) {
      var city = postal.get("City");
      $('#editcustomer-City').append(new Option(city, city));
    },

    SetCustomerName: function(CustomerName, CustomerCode, ShipToName, ShipToAddress) { //15X
      Global.CustomerName = CustomerName;
      Global.CustomerCode = CustomerCode;

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
      $("#editcustomerForm").show();
      this.InitializeThings();
      this.isFirstTymLoaded = true;
      //this.$el.append( this._template );

      $("#editcustomerForm").trigger('create');
    },

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

    ValidateFields: function() {
        var postal = $("#editcustomer-PostalCode").val();
      var customerName = $("#editcustomer-name").val();
      var email = $("#editcustomer-Email").val();

      if (postal === "") {
        navigator.notification.alert("Please input a valid Zip Code.", null, "Zip Code is Required", "OK");
        //console.log("postal");
      } else if (customerName === "") {
        navigator.notification.alert("Please enter a Customer Name.", null, "Customer Name is Required", "OK");
        //console.log("name");
      }
      //  else if (email === "") {
      //   navigator.notification.alert("Please input a valid Email.", null, "Email is Required", "OK");
      //   //console.log("email");
      // } 
      else if ((email != null && email != "")  && this.ValidateEmailFormat(email)) {
        navigator.notification.alert("Email format is invalid.", null, "Invalid Email", "OK");
      } else {
        this.ShowSpinner();
        this.SetCustomerDetails();
        this.HideCustomerForm();
      }
    },

    ValidateEmailFormat: function(email) {
      var emailcheck = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      return (email.search(emailcheck) == -1);
    }

  });
  return EditCustomerFormView;
});
