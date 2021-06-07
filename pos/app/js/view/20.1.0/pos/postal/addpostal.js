define([
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'collection/base',
  'view/spinner',
  'text!template/20.1.0/pos/postal/addpostal.tpl.html'
], function(Backbone, Global, Service, Method, Shared,
  BaseModel,
  BaseCollection,
  Spinner,
  template) {
  var _txtPostal = "#txtAddPostal-ZipCode";
  var _txtCity = "#txtAddPostal-City";
  var _txtState = "#txtAddPostal-State";
  var _txtStateCode = "#txtAddPostal-StateCode";
  var _txtCounty = "#txtAddPostal-County";
  var _popupOverlay = "#popup-modalOverlay";
  var _cmdAdd = "#custome-add-postal-btn-add";
  var _cmdCancel = "#customer-addpostal-btn-cancel";
  var _drpCountry = "#drpcountry";
  var DefaultClassTemplate = {
    Retail: "Retail",
    WholeSale: "WholeSale"
  }
  var AddPostalView = Backbone.View.extend({

    _template: _.template(template),

    events: {
      "tap #customer-addpostal-btn-cancel": "Cancel_Tap",
      "tap #custome-add-postal-btn-add": "Save",
      //  "change #drpcountry " :  "CountryOnChange"
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(this._template);
      this.$el.trigger('create');
      return this;
    },
    Show: function(postal, countryCode, countryCollection, invoker) {
      this.$el.show();
      if (Global.ApplicationType == "Customers") _popupOverlay = "#customers-page-blockoverlay";
      if (Global.ApplicationType == "Products") _popupOverlay = "#products-page-blockoverlay";
      $(_popupOverlay).show();
      $(_txtPostal).val(postal);
      $(_txtCity).focus();
      this.originalCountryCode = countryCode;
      this.countryCode = countryCode;
      this.postalCode = postal;
      this.LoadCountry(countryCollection, countryCode);
    },

    LoadCountry: function(countryCollection, currentCountryCode) {
      this.countryCollection = new BaseCollection();
      this.countryCollection = countryCollection;
      $(_drpCountry + ' > option[val !=""]').remove();
      this.countryCollection.each(function(country) {
        var _country = country.get("CountryCode");
        $(_drpCountry).append(new Option(_country, _country));
      });
      this.SetSelectedCountry(currentCountryCode);
      var self = this;
      $("#drpcountry").on("change", function(e) {
        e.preventDefault();
        self.CountryOnChange(e);
      });
    },
    SetSelectedCountry: function(countryCode) {
      $(_drpCountry).val(countryCode);
      $(_drpCountry + " option:selected").removeAttr('selected');
      $(_drpCountry + " > option[value='" + countryCode + "']").attr("selected", "selected");
      $(_drpCountry).trigger('change');
      this.countryCode = countryCode;
      if (Shared.IsNullOrWhiteSpace(this.defaultClassTemplateCollection)) this.defaultClassTemplateCollection = new BaseCollection();
      this.defaultClassTemplateCollection.reset();
      this.CheckIfRequireClassTemplate(this.countryCode)
      this.isLoaded = true;
    },
    CountryOnChange: function(e) {
      e.preventDefault();
      if (Shared.IsNullOrWhiteSpace(this.defaultClassTemplateCollection)) this.defaultClassTemplateCollection = new BaseCollection();
      this.defaultClassTemplateCollection.reset();
      this.countryCode = $(_drpCountry).val();

      this.CheckIfRequireClassTemplate(this.countryCode);
      var self = this;
      Shared.LoadPostalByCode(this.postalCode,
        function(collection) {
          self.DisplayResultOnPostal(collection);
        },
        function(error) {
          //self.HideActivityIndicator();
        });
    },

    DisplayResultOnPostal: function(collection) {
      var self = this;
      var _postalCollection = new BaseCollection();
      _postalCollection.reset(collection);
      var isExist = _postalCollection.find(function(postal) {
        if (self.postalCode == postal.get("PostalCode") && self.countryCode == postal.get("CountryCode")) {
          return true;
        } else {
          return false;
        }
      });
      if (_postalCollection.length > 0) {
        if (isExist) {
          navigator.notification.alert("The Postal Code " + this.postalCode + ' already exist in ' + this.countryCode + " !", null, "Error", "OK");
          this.SetSelectedCountry(this.originalCountryCode);
        }
      }
      console.log("COUNTRY CODE : " + this.countryCode);
    },
    Cancel_Tap: function(e) {
      e.preventDefault();
      this.trigger("ClearPostal");
      this.Hide();
    },
    ToggleFields: function(isReadonly) {
      if (isReadonly) {
        $(_txtPostal).addClass("ui-readonly");
        $(_txtCity).addClass("ui-readonly");
        $(_txtCounty).addClass("ui-readonly");
        $(_txtState).addClass("ui-readonly");
        $(_txtStateCode).addClass("ui-readonly");
        $(_cmdAdd).addClass('ui-disabled');
        $(_cmdCancel).addClass('ui-disabled');
      } else {
        $(_txtPostal).removeClass("ui-readonly");
        $(_txtCity).removeClass("ui-readonly");
        $(_txtCounty).removeClass("ui-readonly");
        $(_txtState).removeClass("ui-readonly");
        $(_txtStateCode).removeClass("ui-readonly");
        $(_cmdAdd).removeClass('ui-disabled');
        $(_cmdCancel).removeClass('ui-disabled')
      }

    },
    ShowSpinner: function() {
      var target = document.getElementById("addPostal");
      this.ShowActivityIndicator(target);
      $("<h5>Saving...</h5>").appendTo($("#spin"));
    },
    ShowActivityIndicator: function(target) {
      this.ShowModal(true);
      if (!Global.ApplicationType == "Customer") {
        if (!target) {
          target = document.getElementById('main-transaction-page');
        }
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
      }
    },
    ShowModal: function(isShow) {
      if (isShow) {
        if (!Global.ApplicationType == "Customer") {
          $("#main-transaction-blockoverlay").addClass('z3000');
        } else {
          $("#customers-page-blockoverlay").addClass('z3000');
        }
      } else {
        if (!Global.ApplicationType == "Customer") {
          $("#main-transaction-blockoverlay").removeClass('z3000');
        } else {
          $("#customers-page-blockoverlay").removeClass('z3000');
        }
      }
    },
    HideActivityIndicator: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.ShowModal(false);
      if (!Global.ApplicationType == "Customer") {
        _spinner = Spinner;
        _spinner.stop();
        $("#spin").remove();
      }
    },
    Save: function(e) {
      e.preventDefault();
      var postalCode = $(_txtPostal).val();
      var city = $(_txtCity).val();
      var state = $(_txtState).val();
      var county = $(_txtCounty).val();
      var stateCode = $(_txtStateCode).val();

      this.ValidateFields(postalCode, city, state, stateCode, county);
    },
    ValidateFields: function(postalCode, city, state, stateCode, county) {
      if (Shared.IsNullOrWhiteSpace(postalCode)) {
        navigator.notification.alert("Please input a valid Zip Code.", null, "Zip Code is Required", "OK");
        return;
      }
      if (Shared.IsNullOrWhiteSpace(city)) { // city = "Please enter city" ;
        navigator.notification.alert("Please input City.", null, "City is Required", "OK");
        return;
      }
      if (Shared.IsNullOrWhiteSpace(state)) state = "Please enter state";
      if (Shared.IsNullOrWhiteSpace(stateCode)) //stateCode = "Please enter state code" ;

        this.ToggleFields(true);
      this.ShowSpinner();
      $("#custome-add-postal-btn-add").addClass("ui-disabled");
      this.SavePostal(postalCode, city, state, stateCode, county);
    },
    SavePostal: function(postalCode, city, state, stateCode, county) {
      this.postalModel = new BaseModel();
      var self = this;
      var retailClassTemplateClassCode = this.GetDefaulClassTemplate(DefaultClassTemplate.Retail).ClassCode;
      var retailClassTemplateClassDescription = this.GetDefaulClassTemplate(DefaultClassTemplate.Retail).ClassDescription;
      var wholeSaleClassTemplateClassCode = this.GetDefaulClassTemplate(DefaultClassTemplate.WholeSale).ClassCode;
      var wholeSaleClassTemplateClassDescription = this.GetDefaulClassTemplate(DefaultClassTemplate.WholeSale).ClassDescription;

      this.postalModel.set({
        PostalCode: postalCode,
        City: city,
        State: state,
        StateCode: stateCode,
        County: county,
        CountryCode: self.countryCode,
        DefaultRetailCustomerBillToClassTemplate: retailClassTemplateClassCode,
        DefaultRetailCustomerShipToClassTemplate: retailClassTemplateClassCode,
        DefaultRetailCustomerBillToClassTemplateDescription: retailClassTemplateClassDescription,
        DefaultRetailCustomerShipToClassTemplateDescription: retailClassTemplateClassDescription,
        DefaultWholesaleCustomerBillToClassTemplate: wholeSaleClassTemplateClassCode,
        DefaultWholesaleCustomerShipToClassTemplate: wholeSaleClassTemplateClassCode,
        DefaultWholesaleCustomerBillToClassTemplateDescription: wholeSaleClassTemplateClassDescription,
        DefaultWholesaleCustomerShipToClassTemplateDescription: wholeSaleClassTemplateClassDescription
      });
      this.postalModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.CREATEPOSTAL;
      this.postalModel.save(null, {
        success: function(collection, respose) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.SaveSuccesFull(respose);
        },
        error: function(collection, error, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.ErrorSavingPostal();
          collection.RequestError(error, "Error Saving Postal");
        }
      });
    },
    ErrorSavingPostal: function() {
      this.ToggleFields(false);
      this.HideActivityIndicator();
      this.ShowModal(false);
      console.log("ErrorSaving Postal!");
    },
    SaveSuccesFull: function(response) {
      if (Shared.IsNullOrWhiteSpace(response.ErrorMessage)) {
        this.trigger('AcceptPostal', response);
        Shared.ShowNotification('Postal Code successfully saved');
        //navigator.notification.alert("Postal Code successfully saved", null, "Saving Successful", "OK");
        this.ToggleFields(false);
        this.HideActivityIndicator();
        this.Hide();
      } else {
        navigator.notification.alert(response.ErrorMessage, null, "Error Saving", "OK");
      }

    },
    Hide: function() {
      this.$el.hide();
      $(_popupOverlay).hide();
      // $(this.el).unbind('.delegateEvents' + this.cid);
    },
    CheckIfRequireClassTemplate: function(countryCode) {
      if (Shared.IsNullOrWhiteSpace(countryCode)) return false;
      var isPrioritized = this.countryCollection.find(function(country) {
        if (country.get("CountryCode") == countryCode) {
          if (country.get("IsWholesaleCustomerBillToClassPostal") == true || country.get("IsRetailCustomerBillToClassPostal") == true) {
            return true;
          }
        }
        return false;
      });
      console.log("IsPrioritized =" + isPrioritized)
      if (isPrioritized) {
        this.FetchDefaultClassTemplate(countryCode);
      }
    },
    FetchDefaultClassTemplate: function(country) {
      if (Shared.IsNullOrWhiteSpace(country)) return;
      var self = this;
      var classTemplate = new BaseModel();
      classTemplate.url = Global.ServiceUrl + Service.CUSTOMER + Method.CLASSTEMPLATELOOKUP + 100 + "/false";
      classTemplate.set({
        StringValue: country
      })
      classTemplate.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.defaultClassTemplateCollection.reset(response.ClassTemplates);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Fetching Class Template List");
        }
      });
    },
    GetDefaulClassTemplate: function(type) {
      var value = {
        ClassCode: "",
        ClassDescription: "",
      };
      if (this.defaultClassTemplateCollection.length > 0) {
        switch (type) {
          case DefaultClassTemplate.Retail:
            value.ClassCode = this.defaultClassTemplateCollection.at(1).get("ClassCode");
            value.ClassDescription = this.defaultClassTemplateCollection.at(1).get("ClassDescription");
            break;
          case DefaultClassTemplate.WholeSale:
            value.ClassCode = this.defaultClassTemplateCollection.at(0).get("ClassCode");
            value.ClassDescription = this.defaultClassTemplateCollection.at(0).get("ClassDescription");
            break;
        }
      }
      return value;
    }

  });

  return AddPostalView;
});
