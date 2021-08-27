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
  'collection/classtemplates',
  'text!template/22.0.0/customers/customers/detail/general.tpl.html',
  'view/22.0.0/pos/postal/addpostal',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Service, Method, Shared,
  BaseModel, LookUpCriteriaModel,
  BaseCollection, CountryCollection, PostalCollection, ClassTemplateCollection,
  GeneralTemplate, AddPostalView) {

  var chkLoyaltyPoints = "#chkloyalty-points";
  var _chkLayaltyPointsState = false;
  var txtLoyaltyPoints = "#data-loyaltypoints";
  var _view;
  var confirmAddPostal = function(button) {
    if (button == 1) {
      _view.AddNewPostal();
    } else {
      _view.ClearPostalDetails();
    }
  }
  var GeneralView = Backbone.View.extend({

    _generalTemplate: _.template(GeneralTemplate),

    events: {
      "change #data-city": "SetState",
      "change #data-postal-code": "buttonLoadOnFocus",
      "keyup #data-postal-code": "Postal_keyup",
      "change #data-country": "CountryChanged",
      "change #data-class-template": "ClassTemplateChanged",
      "change #data-shiptoclass-template": "ShipToClassTemplateChanged",
      "focus #data-telephone": "AssignNumericValidation",
      //"change #data-customertype" 	    : "CustomerTypeChanged",
      "tap #chkloyalty-points": "LoyatyPoints_CheckedChanged"
    },

    IsNew: false,

    initialize: function() {
      this.on('postalsRetrieved', this.CheckPostal, this)
      this.$el.show();
      _view = this;
    },

    render: function() {
      _view = this;
      this.onLoad = true;
      //  $("#data-city").trigger('change');
      console.log("LOAD ");
      this.FormatCustomerName();
      var _outstanding = this.model.attributes.OutstandingPoints;
      this.model.set({
        OutstandingPoints: Math.round(_outstanding)
      })

      this.$el.html(this._generalTemplate(this.model.toJSON()));

      this.DisplayCityOnLoad();
      if (this.IsNew) $(".table-preview").css("display", "none");

      if (!this.IsNew) {
        this.originalModel = new BaseModel();
        this.originalModel.set(this.model.attributes);
      }

      $("#data-report-printer").val(this.model.get("POSSalesReceipt"));

      return this;
    },
    InitializeTrackLoyaltyPoints: function() {
      if (this.IsNew) this.$(txtLoyaltyPoints).hide();
      if (!Shared.IsNullOrWhiteSpace(this.model.get("TrackLoyaltyPoints"))) {
        _chkLayaltyPointsState = false;
        this.LoyatyPoints_CheckedChanged();
      } else {
        _chkLayaltyPointsState = true;
        this.LoyatyPoints_CheckedChanged();
      }
    },
    FormatCustomerName: function() {
      var _formattedName = this.model.get("CustomerName")
      this.model.set({
        FormattedName: Shared.Escapedhtml(_formattedName)
      });
    },

    Show: function() {
      this.InitializeThings();
      this.render();
      this.RefreshiScroll();
      this.LoadDrapDowns();
      this.ManageButtons();
      this.InitializeTrackLoyaltyPoints();

      if (!this.IsNew) {
        Shared.ShowHideClassTemplates("table-data tr.tr-ClassTemplate");
        Shared.ShowHideClassTemplates("table-data tr.tr-shipToClassTemplate");
      }
    },

    ManageButtons: function() {
      if (this.IsNew) this.ResetElementValues();
    },

    DisableButtons: function() {
      $('#data-city').addClass('ui-disabled');
      $('#data-country').addClass('ui-disabled');
      $('#data-class-template').addClass('ui-disabled');
      $('#data-report-printer').addClass('ui-disabled');

      $('#data-customer-name').attr('readonly', true);
      $('#data-postal-code').attr('readonly', true);
      $('#data-address').attr('readonly', true);
      $('#data-email').attr('readonly', true);
      $('#data-telephone').attr('readonly', true);
      $('#data-state').attr('readonly', true);
      $('#data-website').attr('readonly', true);
    },

    ResetElementValues: function() {
      $('#data-class-template').removeClass('ui-disabled');
      $('#data-city').removeClass('ui-disabled');
      $('#data-country').removeClass('ui-disabled');
      $('#data-report-printer').removeClass('ui-disabled');

      $('#data-customer-name').val("");

      $('#data-customer-name').attr('readonly', false);
      $('#data-postal-code').attr('readonly', false);
      $('#data-address').attr('readonly', false);
      $('#data-email').attr('readonly', false);
      $('#data-telephone').attr('readonly', false);
      $('#data-state').attr('readonly', false);
      $('#data-website').attr('readonly', false);
      $('#data-customer-name').focus();
    },

    InitializeThings: function() {
      this.countrySelected = this.model.get("Country");
      if ( this.countrySelected  == null ||   this.countrySelected == "")  this.countrySelected  = Global.CompanyCountry;
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

    Postal_keyup: function() {
      Global.ListJustTapped = false;
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
    buttonLoadOnFocus: function(e) {
      e.preventDefault();
      this.postal = $("#data-postal-code").val();
      this.LoadPostal(this.postal);
      // /this.DisplayResultOnPostal(this.postal);

    },
    LoyatyPoints_CheckedChanged: function() {
      _chkLayaltyPointsState = Shared.CustomCheckBoxChange(chkLoyaltyPoints, _chkLayaltyPointsState);
    },
    ClearPostalInfo: function() {
      $("#data-postal-code").val("");
      $("#data-state").val("");
      this.ClearCity();
    },

    ClearCity: function() {
      console.log("ClearCity");
      $('#data-city > option[val !=""]').remove();
      $('#data-city').append(new Option("City", ""));
      //$("#data-city").prop("selectedIndex",0);
      $("#data-city").val("");
      $("#data-state").val("");
    },

    LoadPostal: function(postal) {
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
          $("#data-class-template option[value='" + this.defaultClassCode + "']").attr("selected", "selected");
          $("#data-shiptoclass-template option[value='" + this.defaultShipToClassCode + "']").attr("selected", "selected");
        }
      }
    },

    RemoveInvalidPostals: function(model) {
      var _country = model.get("CountryCode");
      if (_country === this.countrySelected) {
        this.newCollection.add(model);
      }
    },

    AddNewPostal: function() { //v14cust
      console.log("AddNewPostal");
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
      // this.SetSelectedCountry();
      $("#data-country > option[value='" + this.countrySelected + "']").attr("selected", "selected");
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

    CheckPostal: function() {
      this.DisplayResultOnPostal();
    },

    ResetPostalFields: function() {
      $("#data-postal-code").focus();
    },

    DisplayResultOnPostal: function(postals) {
      var _postal = $("#data-postal-code").val();
      this.newCollection = new PostalCollection();
      this.postalCollection.reset(postals);
      this.postalCollection.each(this.RemoveInvalidPostals, this);
      this.postalCollection = this.newCollection;
      if (this.postalCollection.length === 0) {
        if (Global.ListJustTapped) return;
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
      this.county = postal.get("County")
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
        console.log("City : " + _model.get("City"));
      } else {
        $("#data-state").val("");
      }
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
      var _city = this.model.get("City");
      var _country = this.model.get("Country");
      this.LoadCountries();
      this.FetchClassCodes(_country);
      if (this.IsNew) this.LoadClassTemplatesByCountry(_country); //this.ChangeClassCode(_country);
      this.SetCustomerType(this.model.get("BusinessType"));
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

    SetCustomerType: function(cType) {
      if (!this.IsNew) $("#data-customertype").attr('disabled', 'disabled');
      $("#data-customertype").val(cType);
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
      var _postal = $("#data-postal-code").val();
      $("#data-country > option[value='" + this.countrySelected + "']").attr("selected", "selected");
      if (_postal.trim() !== "") this.LoadPostal(_postal);
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
      this.LoadClassTemplatesByCountry(_val); //this.ChangeClassCode(_val);
      this.PreviousCountrySelected = _val;
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
        this.SelectedClassCode = _model.get("ClassCode");
      }
    },

    ClassTemplateChanged: function(e) {
      var _id = e.target.id;
      var self = this;
      var _val = $('#' + _id).val();
      if (this.SelectedClassCode === _val) return;
      this.SelectedClassCode = _val;
    },

    //JHENSON SEPT.12.2013

    ShipToClassTemplateChanged: function(e) {
      var _id = e.target.id;
      var self = this;
      var _val = $('#' + _id).val();
      if (this.SelectedShipToClassCode === _val) return;
      this.SelectedShipToClassCode = _val;
      if (this.shipToClassTemplateCollection)
        if (this.shipToClassTemplateCollection.length > 0) {
          this.ShipToClassTemplate = this.shipToClassTemplateCollection.find(function(mdl) {
            return mdl.get("ClassCode") === _val;
          });
        }

        //this.shipToClassTemplateCollection.each(function (model) {
        //    if (model.get("ClassCode") == _val) self.ShipToClassTemplate = model;
        //});
    },

    LoadClassTemplatesByCountry: function(country) {
      if (!this.IsNew) return;
      this.LoadCustomerClassTemplatesByCustomer(Global.POSWorkstationID);
      this.LoadShipToClassTemplatesByCustomer(Global.POSWorkstationID);
    },

    LoadCustomerClassTemplatesByCustomer: function(code) {
      if (!code) return;
      if (code == "") return;
      var self = this;
      var tmp = new BaseModel({
        StringValue: code
      });
      tmp.url = Global.ServiceUrl + Service.CUSTOMER + Method.GETCUSTOMERCLASSTEMPLATEBYCUSTOMER;
      tmp.save(tmp, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!model.get("ClassTemplates")) return;
          if (model.get("ClassTemplates").length == 0) return;
          var classTemplatesMdl = model.get("ClassTemplates");
          self.PopulateCustomerClassTemplates(classTemplatesMdl);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },

    // LoadCustomerClassTemplatesByCountry: function(country) {
    //   if (!country) return;
    //   if (country == "") return;
    //   var self = this;
    //   var tmp = new BaseModel({
    //     StringValue: country
    //   });
    //   tmp.url = Global.ServiceUrl + Service.CUSTOMER + Method.GETCUSTOMERCLASSTEMPLATEBYCOUNTRY;
    //   tmp.save(tmp, {
    //     success: function(model, response) {
    //       if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
    //       if (!model.get("ClassTemplates")) return;
    //       if (model.get("ClassTemplates").length == 0) return;
    //       var classTemplatesMdl = model.get("ClassTemplates");
    //       self.PopulateCustomerClassTemplates(classTemplatesMdl);
    //     },
    //     error: function(model, error, response) {
    //       if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
    //     }
    //   });
    // },

    LoadShipToClassTemplatesByCustomer: function(code) {
      if (!code) return;
      if (code == "") return;
      var self = this;
      var tmp = new BaseModel({
        StringValue: code
      });
      tmp.url = Global.ServiceUrl + Service.CUSTOMER + Method.GETSHIPTOCLASSTEMPLATEBYCUSTOMER;
      tmp.save(tmp, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!model.get("ClassTemplates")) return;
          if (model.get("ClassTemplates").length == 0) return;
          var classTemplatesMdl = model.get("ClassTemplates");
          self.PopulateShipToClassTemplates(classTemplatesMdl);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },

    // LoadShipToClassTemplatesByCountry: function(country) {
    //   if (!country) return;
    //   if (country == "") return;
    //   var self = this;
    //   var tmp = new BaseModel({
    //     StringValue: country
    //   });
    //   tmp.url = Global.ServiceUrl + Service.CUSTOMER + Method.GETSHIPTOCLASSTEMPLATEBYCOUNTRY;
    //   tmp.save(tmp, {
    //     success: function(model, response) {
    //       if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
    //       if (!model.get("ClassTemplates")) return;
    //       if (model.get("ClassTemplates").length == 0) return;
    //       var classTemplatesMdl = model.get("ClassTemplates");
    //       self.PopulateShipToClassTemplates(classTemplatesMdl);
    //     },
    //     error: function(model, error, response) {
    //       if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
    //     }
    //   });
    // },

    PopulateCustomerClassTemplates: function(classTemplatesMdl) {
      var self = this;
      var classIndex = 0;
      var defaultIndex = 0;
      //var clsCollection = new ClassTemplateCollection()
      //clsCollection.reset(classTemplatesMdl);

      if (!this.customerClassTemplateCollection) this.customerClassTemplateCollection = new ClassTemplateCollection();
      this.customerClassTemplateCollection.reset(classTemplatesMdl);

      Global.DefaultClassCode = null;
      $('#data-class-template').html("");

      //this.customerClassTemplateCollection.each(function (model) {
      //    var _classDescription = model.get("ClassDescription");
      //    var _classCode = model.get("ClassCode");
      //    if(model.get("IsDefault")){
      //        Global.DefaultClassCode = _classCode;
      //        self.selectedClassCode = _classCode;
      //        defaultIndex = classIndex;
      //    }
      //    classIndex++;
      //    $('#data-class-template').append( new Option( _classCode + ' | ' + _classDescription, _classCode ) );
      //});

      //$("#data-class-template").prop("selectedIndex", defaultIndex);
      //$("#data-class-template").trigger('change');

      this.customerClassTemplateCollection.each(function(model) {
        $('#data-class-template').append(new Option(model.get("ClassCode") + ' | ' + model.get("ClassDescription"), model.get("ClassCode")));
      });

      var isDefaultClassTemplateModel = this.customerClassTemplateCollection.find(function(model) {
        // return model.get("IsDefault") == true;
        return true;
      });

      try {
        if (isDefaultClassTemplateModel instanceof BaseModel) {
          var classCode = isDefaultClassTemplateModel.get("ClassCode");
          var classDescription = isDefaultClassTemplateModel.get("ClassDescription");
          Global.DefaultClassCode = classCode;
          this.defaultClassCode = classCode;

          $("#data-class-template option[value='" + classCode + "']").attr("selected", "selected");
        }
      } catch (e) {
        navigator.notification.alert(e.message, null, e.name, "OK");
      }
    },

    PopulateShipToClassTemplates: function(classTemplatesMdl) {
      var self = this;
      var classIndex = 0;
      var defaultIndex = 0;
      //var clsCollection = new ClassTemplateCollection()
      //clsCollection.reset(classTemplatesMdl);

      if (!this.shipToClassTemplateCollection) this.shipToClassTemplateCollection = new ClassTemplateCollection();
      this.shipToClassTemplateCollection.reset(classTemplatesMdl);

      $('#data-shiptoclass-template').html("");
      //this.shipToClassTemplateCollection.each(function (model) {
      //    var _classDescription = model.get("ClassDescription");
      //    var _classCode = model.get("ClassCode");
      //    if(model.get("IsDefault")){
      //        //self.SelectedShipToClassCode = _classCode;
      //        defaultIndex = classIndex;
      //        //self.ShipToClassTemplate = model;
      //    }
      //    classIndex++;
      //    $('#data-shiptoclass-template').append( new Option( _classCode + ' | ' + _classDescription, _classCode ) );
      //});

      //$("#data-shiptoclass-template").prop("selectedIndex", defaultIndex);
      //$("#data-shiptoclass-template").trigger('change');

      this.shipToClassTemplateCollection.each(function(model) {
        $('#data-shiptoclass-template').append(new Option(model.get("ClassCode") + ' | ' + model.get("ClassDescription"), model.get("ClassCode")));
      });

      var isDefaultShipToClassTemplateModel = this.shipToClassTemplateCollection.find(function(model) {
        // return model.get("IsDefault") == true;
        return true;
      });

      try {
        if (isDefaultShipToClassTemplateModel instanceof BaseModel) {
          var classCode = isDefaultShipToClassTemplateModel.get("ClassCode");
          var classDescription = isDefaultShipToClassTemplateModel.get("ClassDescription");
          var paymentTermCode = isDefaultShipToClassTemplateModel.get("PaymentTermCode");
          var taxCode = isDefaultShipToClassTemplateModel.get("TaxCode");

          Global.DefaultShipToCode = classCode;
          this.defaultShipToClassCode = classCode;
          this.defaultPaymentTermCode = paymentTermCode;
          this.defaultTaxCode = taxCode;

          $("#data-shiptoclass-template option[value='" + classCode + "']").attr("selected", "selected");
        }
      } catch (e) {
        navigator.notification.alert(e.message, null, e.name, "OK");
      }
    },

    //End

    ChangeClassCode: function(country) {
      if (!country) return;
      if (country == "") return;
      var self = this;
      var _classCode, _taxCode, _paymentTermCode;

      tmp = new BaseModel();

      /*
            tmp.url = Global.ServiceUrl + Service.CUSTOMER + Method.GETCLASSTEMPLATEBYCOUNTRY + country + "/false" ;
			tmp.save(null, {
                success : function(model, response){
                	if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    if(!model.get("ClassCode")) return;
                    if(model.get("ClassCode") == "") return;
                    Global.DefaultClassCode =  model.get("ClassCode")

                    _classCode = response.ClassCode;
                    _taxCode = response.TaxCode;
                    _paymentTermCode = response.PaymentTermCode;

                    self.SetCustomerSchemaFields(_classCode, _paymentTermCode, _taxCode);
                    self.FetchClassCodes(country);
                },
                error : function(model, error, response){
	    			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
	    			//model.RequestError(error, "Error Fetching Class Code");
	    		}
            });
            */


      var tmp = new BaseModel({
        StringValue: country
      });
      tmp.url = Global.ServiceUrl + Service.CUSTOMER + Method.GETDEFAULTCLASSTEMPLATESBYCOUNTRY + 'false';
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
            }
            if (classTemplates[i].BusinessType == "Retail") {
              self.RetailClass = new BaseModel(classTemplates[i]);
              self.RetailClass.set({
                ClassDescription: "Retail"
              });
              Global.DefaultClassCode = classTemplates[i].ClassCode;
              _classCode = classTemplates[i].ClassCode;
              _classCode = classTemplates[i].ClassCode;
              _paymentTermCode = classTemplates[i].PaymentTermCode;
              _taxCode = classTemplates[i].TaxCode;
            }
          }
          self.SetCustomerSchemaFields(_classCode, _paymentTermCode, _taxCode);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });

    },

    FetchClassCodes: function(country) {
      if (!country || country == "") return;
      var self = this;
      var classTemplate = new LookUpCriteriaModel();
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
          //self.SetDefaultClassCode();
        }
      });
    },

    ResetClassTemplates: function(classtemplates) {
      if (!this.classTemplateCollection) this.classTemplateCollection = new ClassTemplateCollection()
      this.classIndex = 0;
      this.classTemplateCollection.reset(classtemplates);
      if (this.classTemplateCollection.length === 0) return;
      $('#data-class-template > option[val !=""]').remove();
      this.classTemplateCollection.each(this.FillClassTemplateComboBox, this);
      if (!Global.Preference.AllowChangeClassTemplate || Global.Preference.AllowChangeClassTemplate === undefined || Global.Preference.AllowChangeClassTemplate === null) {
        document.getElementById("data-class-template").readOnly = true;
        document.getElementById("data-shiptoclass-template").readOnly = true;
        $('#data-class-template').attr('disabled', 'disabled');
        $('#data-shiptoclass-template').attr('disabled', 'disabled');
        //$('#data-class-template').addClass('ui-disabled');
        //$('#data-shiptoclass-template').addClass('ui-disabled');
      } else {
        $('#data-class-template').removeAttr('disabled');
        $('#data-shiptoclass-template').removeAttr('disabled');
        // $('#data-class-template').removeClass('ui-disabled');
        // $('#data-shiptoclass-template').removeClass('ui-disabled');
      }
    },

    FillClassTemplateComboBox: function(model) {
      var _mustBeSelected = this.GetMustBeSelectedCode();
      var _classDescription = model.get("ClassDescription");
      var _classCode = model.get("ClassCode");
      $('#data-class-template').append(new Option(_classCode + ' | ' + _classDescription, _classCode)); //value , option
      if (_classCode === _mustBeSelected) {
        $("#data-class-template").prop("selectedIndex", this.classIndex);
        //this.SelectedClassCode = _classCode;
        $("#data-class-template").trigger('change');
      }
      this.classIndex++;
    },

    GetMustBeSelectedCode: function() {
      if (this.IsNew) return Global.DefaultClassCode;
      if (this.model.get("ClassCode") !== null || this.model.get("ClassCode") !== undefined) return this.model.get("ClassCode");
      return Global.DefaultClassCode;
    },

    SetCustomerSchemaFields: function(classCode, paymentTerm, taxcode) {
      $("#data-class-template").val(classCode);
      this.paymentTerm = paymentTerm;
      this.taxCode = taxcode
      $("#data-payment-term").val(paymentTerm);
      $("#data-tax-code").val(taxcode);
    },

    GetCounty: function() {
      if (this.postalCollection.length === 0 || this.postalCollection === undefined) return;
      return this.postalCollection.at(0).get("County");
    },


    UpdateModelValues: function() {
      var self = this;
      var customerName = $('#data-customer-name').val();
      var postalCode = $('#data-postal-code').val();
      var country = $('#data-country').val();
      var address = $('#data-address').val();
      var city = $('#data-city').val();
      var email = $('#data-email').val();
      var phone = $('#data-telephone').val();
      var state = $('#data-state').val();
      var classCode = $('#data-class-template').val();
      var shipToClassCode = $("#data-shiptoclass-template").val();
      //var paymentTerm		= $('#data-payment-term').val();
      //var taxCode			= $('#data-tax-code').val();
      var website = $('#data-website').val();
      var county = this.GetCounty();
      var posPrinter = $("#data-report-printer").val();

      this.model.set({
        CustomerName: customerName,
        Country: country,
        County: county,
        City: city,
        State: state,
        Address: address,
        Email: email,
        Telephone: phone,
        PostalCode: postalCode,
        Website: website,
        TrackLoyaltyPoints: _chkLayaltyPointsState,
        AssignedTo: Global.Username,
        BusinessType: "Retail",
        PaymentTermCode: this.defaultPaymentTermCode,
        TaxCode: this.defaultTaxCode,
        POSSalesReceipt: posPrinter
      });


      if (!this.IsNew) {
        return;
      } else {
        this.model.set({
          ClassCode: (classCode) ? classCode : this.defaultClassCode,
          ShipToClassCode: (shipToClassCode) ? shipToClassCode : this.defaultShipToClassCode,
        });
      }

      ////var _customerType    = $('#data-customertype').val();
      ////var _classModel = new BaseModel();
      ////if(_customerType == "Wholesale") _classModel = this.WholesaleClass;
      ////else _classModel = this.RetailClass;

      //var _customerClassCode = this.SelectedClassCode || Global.DefaultClassCode;
      ////var _shipToClassModel = new BaseModel();

      ////if(this.ShipToClassTemplate) _shipToClassModel = this.ShipToClassTemplate;

      //if (this.shipToClassTemplateCollection) if (this.shipToClassTemplateCollection.length > 0) {
      //    this.ShipToClassTemplate = this.shipToClassTemplateCollection.find(function (mdl) {
      //        return mdl.get("ClassCode") === shipToClassCode;
      //    });
      //}

      //this.model.set({
      //		BusinessType    : "Retail", //_classModel.get("BusinessType"),
      //		ClassCode       : classCode || Global.DefaultClassCode,

      //});

    },

    ValidData: function() {
      var msg = "";
      var _postal = $("#data-postal-code").val();
      var _customerName = $("#data-customer-name").val();
      var _email = $("#data-email").val();
      var _website = $("#data-website").val();
      var _isAllowByPassValidation = _isAllowByPassValidation = (this.model.get("CustomerCode") === "DefaultPOSShopper" || this.model.get("CustomerCode") === "DefaultECommerceShopper");

      if (_customerName === "") {
        //navigator.notification.alert("Please enter a Customer Name.",null, "Customer Name is Required", "OK");
        msg = "Please enter a Customer Name.";
//      } else if (_postal === "" && !_isAllowByPassValidation) {
//        //navigator.notification.alert("Please input a valid Postal Code.",null, "Zip Code is Required", "OK");
//        msg = "Please enter a valid Postal Code.";
      }
      //  else if (this.IsCheckEmail(_email) && _email === "" && !_isAllowByPassValidation) {
      //   //navigator.notification.alert("Please input a valid Email.",null, "Email is Required", "OK");
      //   msg = "Please enter a valid Email.";
      // }
       else if ((_email != null && _email != "") && this.ValidateEmailFormat(_email) && !_isAllowByPassValidation) {
        //navigator.notification.alert("Email format is invalid.",null, "Invalid Email", "OK");
        msg = "Email format is invalid.";
      } else if (_website.trim() !== "" && !_isAllowByPassValidation) {
        if (Shared.ValidateUrlFormat(_website)) msg = "Website format is invalid.";
        else return true;
      } else {
        return true;
      }
      Shared.Customers.ShowNotification(msg, true);
      return false;
    },

    ValidateEmailFormat: function(email) {
      var emailcheck = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      return (email.search(emailcheck) == -1);
    },

    ValidateUrl: function(value) {
      //return true;
      return /^(www)\.(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
    },

    IsCheckEmail: function(email) {
      if (this.IsNew) return true;
      if (!this.originalModel) return true;
      if ((!this.originalModel.get("Email") || this.originalModel.get("Email") == "") && (!email || email == "")) return false;
      if (this.originalModel.get("Email") == email) return false;
      return true;
    },

    InitializeChildViews: function() {},

    Close: function() {
      this.remove();
      this.unbind();
    },

    AssignNumericValidation: function(e) {
      Shared.Input.NonNegativeInteger('#' + e.target.id);
    },
  });
  return GeneralView;
});
