/** 
 * @author PREBRON | 05-07-2013
 * Required: el, collection
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
  'model/lookupcriteria',
  'collection/base',
  'collection/countries',
  'collection/postal',
  'text!template/20.1.0/customers/customers/detail/contacts.tpl.html',
  'view/20.1.0/pos/postal/addpostal',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Service, Method, Shared,
  BaseModel, LookUpCriteriaModel,
  BaseCollection, CountryCollection, PostalCollection,
  ContactTemplate, AddPostalView) {

  var _view;
  var confirmAddPostal = function(button) {
    if (button == 1) {
      _view.AddNewPostal();
    } else {
      _view.ClearPostalDetails();
    }
  }
  var ContactView = Backbone.View.extend({

    _contactTemplate: _.template(ContactTemplate),

    events: {
      "tap #btn-search-entity-name": "seachBtn_Tapped",
      "change #data-city": "SetState",
      "change #data-postal-code": "buttonLoadOnFocus",
      "change #data-country": "CountryChanged",
      "keyup #data-postal-code": "Postal_keyup",
      "keydown #data-business-phone": "AssignNumericValidation",
    },

    IsNew: false,

    initialize: function() {
      this.$el.show();
      _view = this;
    },

    render: function() {
      this.onLoad = true;
      this.FormatContactName();
      this.$el.html(this._contactTemplate(this.model.toJSON()));
      this.DisplayCityOnLoad();
      return this;
    },

    FormatContactName: function() {
      var formattedModel = Shared.EscapedModel(this.model);
      this.model.set({
        FormattedName: formattedModel.get("ContactFullName"),
        FormattedEntityName: formattedModel.get("EntityName")
      });
    },

    Show: function() {
      console.log('contactview');
      this.InitializeThings();
      this.render();
      this.RefreshiScroll();
      this.LoadDrapDowns();
      this.ManageButtons();
    },

    ManageButtons: function() {
      if (this.IsNew) $('#data-contact-full-name').val(""); // this.DisableButtons();
    },

    EnableButtons: function() {
      $('#data-contact-full-name').val("");
      $('#data-postal-code').attr('readonly', false);

      $('#data-city').removeClass('ui-disabled');
      $('#data-country').removeClass('ui-disabled');
      $('#data-contact-full-name').attr('readonly', false);
      $('#data-postal-code').attr('readonly', false);
      $('#data-address').attr('readonly', false);
      $('#data-email').attr('readonly', false);
      $('#data-business-phone').attr('readonly', false);
      $('#data-state').attr('readonly', false);
    },

    InitializeThings: function() {
      this.countrySelected = this.model.get("Country");
      this.ContactCode = this.model.get("ContactCode");
      this.county = this.model.get("County");
      this.timeZone = this.model.get("TimeZone");
      this.InitializeModelsAndCollections();
    },

    InitializeModelsAndCollections: function() {
      var _rows = 10000;
      if (!this.countryModel) {
        this.countryModel = new LookUpCriteriaModel();
        this.countryModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.COUNTRYCODELOOKUP + _rows;
      }

      if (!this.postalmodel) {
        this.postalmodel = new BaseModel();
      }

      if (!this.postalCollection) this.postalCollection = new BaseCollection();
      if (!this.countryCollection) this.countryCollection = new CountryCollection();
    },
    DisplayCityOnLoad: function() {
      console.log("onload : " + this.onLoad);
      if (!Shared.IsNullOrWhiteSpace(this.onLoad)) {
        this.onLoad = false;
        var city = this.model.get("City");
        var state = this.model.get("State");
        if (!Shared.IsNullOrWhiteSpace(city) && city != "Please enter city") {
          $('#data-city > option[val !=""]').remove();
          $('#data-city').append(new Option(city, city));
          $("#data-city").prop("selectedIndex", 0);
          // $("#data-city").trigger('change');
          console.log("Change City");
        } else {
          this.ClearCity();
        }
        if (!Shared.IsNullOrWhiteSpace(state) && state != "Please enter state code") {
          $("#data-state").val(state);
        } else {
          $("#data-state").val('');
        }
        console.log("CITY : " + city + " , STATE :" + state);
        console.log("onload : " + this.onLoad);
      }
    },
    buttonLoadOnFocus: function() {
      this.postal = $("#data-postal-code").val();
      this.LoadPostal(this.postal);
      // /this.DisplayResultOnPostal(this.postal);

    },

    ClearPostalInfo: function() {
      $("#data-postal-code").val("");
      $("#data-state").val("");
      this.ClearCity();
    },

    ClearCity: function() {
      $('#data-city > option[val !=""]').remove();
      $('#data-city').append(new Option("City", ""));
      //$("#data-city").prop("selectedIndex",0);
      $("#data-city").val("");
      $("#data-state").val("");
    },

    LoadPostal: function(postal) {
      //if(postal == "") {
      //	this.ClearCity();
      //}else{

      //	var self = this;
      //    Shared.LoadPostalByCode(postal,
      //        function(collection){
      //            self.DisplayResultOnPostal(collection);
      //        },
      //        function(error){
      //            self.postalCollection.reset();
      //            self.postalCollection.RequestError(error, "Error Loading Postal Code");
      //            if(self.model) $("#data-postal-code").val(self.model.get("PostalCode"));
      //            else $("#data-postal-code").val("");
      //        });
      //}
      if (postal == "") {
        this.ClearCity();
      } else {

        var self = this;
        Shared.LoadPostalByCode(postal,
          function(collection) {
            self.DisplayResultOnPostal(collection);

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
            if (self.model) $("#data-postal-code").val(self.model.get("PostalCode"));
            else $("#data-postal-code").val("")
          });

      }
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
            $("#data-class-template option[value='" + defaultRetail + "']").attr("selected", "selected");
            $("#data-shiptoclass-template option[value='" + defaultRetailShipto + "']").attr("selected", "selected");

            this.SelectedClassCode = defaultRetail;
            this.SelectedShipToClassCode = defaultRetailShipto;
          } else {
            $("#data-class-template option[value='" + defaultWholesale + "']").attr("selected", "selected");
            $("#data-shiptoclass-template option[value='" + defaultWholesaleShipto + "']").attr("selected", "selected");

            this.SelectedClassCode = defaultWholesale;
            this.SelectedShipToClassCode = defaultWholesaleShipto;
          }
        } else {
          $("#data-class-template option[value='" + this.SelectedClassCode + "']").attr("selected", "selected");
          $("#data-shiptoclass-template option[value='" + this.SelectedShipToClassCode + "']").attr("selected", "selected");
        }
      }
    },

    Postal_keyup: function() {
      Global.ListJustTapped = false;
    },

    RemoveInvalidPostals: function(model) {
      var _country = model.get("CountryCode");
      if (_country === this.countrySelected) {
        this.newCollection.add(model);
      }
    },
    AddNewPostal: function() {
      var _el = $("#addPostalCodeContainer");
      var _postal = $("#data-postal-code").val();
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
      $("#data-country").trigger('change');
      $("#data-postal-code").val(response.PostalCode);
      $("#data-state").val(response.StateCode);
      this.postal = response.PostalCode;
      this.city = response.City;
      this.LoadPostal(this.postal);
    },
    ClearPostalDetails: function() {
      $("#data-postal-code").val("");
      this.postal = "";
      this.ClearCity();
    },
    DisplayResultOnPostal: function(postals) {
      var _postal = $("#data-postal-code").val();
      this.newCollection = new PostalCollection();
      this.postalCollection.reset(postals);
      this.postalCollection.each(this.RemoveInvalidPostals, this);
      this.postalCollection = this.newCollection;
      if (this.postalCollection.length === 0) {
        if (Global.ListJustTapped) return;
        //Shared.Customers.ShowNotification("The Postal Code "+ _postal +" does not exist in the Country selected.",true);
        navigator.notification.confirm("The Postal Code '" + _postal + "' does not exist in the Country selected. Do you want to add '" + _postal + "' ?", confirmAddPostal, "Postal Not Found", ['Yes', 'No']);
      } else {
        $('#data-city > option[val !=""]').remove();
        this.LoadRetrievedPostal();
        $("#data-city").prop("selectedIndex", 0);
        $("#data-city").trigger("change");
      }
    },

    SetFields: function(postal) {
      var city = postal.get("City");
      this.SetCounty(postal);
      $('#data-city').append(new Option(city, city));
    },

    SetState: function() {
      var _city = $("#data-city option:selected").val();
      if (_city != "") {
        var _model = this.postalCollection.find(function(model) {
          return _city = model.get("City");
        });

        if (!_model) {
          $("#data-state").val("");
          return;
        }

        var _state = _model.get("StateCode");
        $("#data-state").val(_state);
      } else {
        $("#data-state").val("");
      }
    },

    SetCounty: function(model) {
      this.county = model.get("County");
      this.timeZone = model.get("TimeZone");
    },

    LoadRetrievedPostal: function() {
      this.postalCollection.each(this.SetFields, this);
    },

    RefreshiScroll: function() {
      if (this.myScroll) {
        this.myScroll.refresh();
      } else {
        this.myScroll = new iScroll("detail-body", {
          vScrollbar: true,
          vScroll: true,
          snap: true,
          momentum: true,
          onBeforeScrollStart: function(e) {
            var target = e.target;
            while (target.nodeType != 1) target = target.parentNode;

            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
              e.preventDefault();
          }
        });
      }
    },

    LoadDrapDowns: function() {
      var _city = this.model.get("City")
      this.LoadCountries();
      $('#data-city').append(new Option(_city, _city))
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
          _self.SetSelectedCountry();
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
        $('#data-country > option[val !=""]').remove();
        this.LoadRetrievedCountry();
      }
    },

    LoadRetrievedCountry: function() {
      this.countryCollection.each(this.SetCountryOptions, this);
    },

    SetCountryOptions: function(country) {
      var _country = country.get("CountryCode");
      $('#data-country').append(new Option(_country, _country));
    },

    SetSelectedCountry: function() {
      $("#data-country > option[value='" + this.countrySelected + "']").attr("selected", "selected");
    },

    CountryChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      var _postalVal = $('#data-postal-code').val();
      if (this.countrySelected != _val) {
        if (_postalVal.length > 0) {
          this.ClearPostalInfo();
        }
      }
      this.countrySelected = _val;
      this.PreviousCountrySelected = _val;
      //this.FetchClassCodes(_val);
    },

    // GetElementValues : function () {     orig
    GetUpdatedModelAttributes: function() {
      var contactFullName = $('#data-contact-full-name').val(),
        postalCode = $('#data-postal-code').val(),
        country = $('#data-country').val(),
        address = $('#data-address').val(),
        city = $('#data-city').val(),
        email = $('#data-email').val(),
        phone = $('#data-business-phone').val(),
        state = $('#data-state').val(),
        allowWebAccess = this.model.attributes.IsAllowWebAccess,
        password = this.model.attributes.Password;

      if (allowWebAccess == true) {
        if (!email && !password) allowWebAccess = false;
        else if (email && !password) allowWebAccess = false;
      }

      this.model.set({
        ContactFullName: contactFullName,
        PostalCode: postalCode,
        Country: country,
        Address: address,
        City: city,
        State: state,
        Email1: email,
        BusinessPhone: phone,
        County: this.county,
        TimeZone: this.timeZone,
        IsAllowWebAccess: allowWebAccess,
      });

      return this.model.attributes;
    },

    ValidData: function() {
      this.GetUpdatedModelAttributes();
      var _email = $('#data-email').val();
      var _contactFullName = $('#data-contact-full-name').val();
      var msg = "";

      if (_contactFullName === null || _contactFullName === undefined || _contactFullName === "") {
        msg = "Name is required";
      } else if (_email.length > 0) {
        if (this.ValidateEmailFormat(_email)) msg = "Email format is invalid.";
        else return true;
      } else {
        return true;
      }
      Shared.Customers.ShowNotification(msg, true);
      return false;
    },

    InitializeCustomerLookup: function() {
      this.trigger("initializeCustomerLookup", this);
    },

    seachBtn_Tapped: function(e) {
      e.preventDefault();
      this.InitializeCustomerLookup();
    },

    InitializeChildViews: function() {},

    Close: function() {
      this.remove();
      this.unbind();
    },

    ValidateEmailFormat: function(email) {
      var emailcheck = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      return (email.search(emailcheck) == -1);
    },

    AssignNumericValidation: function(e) {
      Shared.Input.NonNegativeInteger('#' + e.target.id);
    },

  });
  return ContactView;
});
