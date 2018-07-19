/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/method',
  'shared/service',
  'shared/shared',
  'model/lookupcriteria',
  'model/base',
  'model/workstation',
  'model/print',
  'collection/preferences',
  'collection/localpreferences',
  'text!template/dashboard/dashboard.tpl.html',
  'view/spinner',
  'js/libs/swipe.min.js'
], function($, $$, _, Backbone, Global, Method, Service, Shared,
  LookupCriteriaModel, BaseModel, WorkstationModel, PrintModel,
  PreferenceCollection, LocalPreferenceCollection,
  template,Spinner) {

  var DashboardView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap #pos": "buttonPOS_tap",
      "tap #setting": "buttonSettings_tap",
      "tap #products": "buttonProducts_tap",
      "tap #customers": "buttonCustomers_tap",
      "tap #reports": "buttonReports_tap",
      "tap #secondary": "buttonSecondary_tap",
      "tap #dashboard-logout": "buttonLogout_tap"
    },

    buttonPOS_tap: function(e) {
      e.preventDefault();
      this.CheckWorkstation("POS");
    },

    buttonKiosk_tap: function(e) {
      e.preventDefault();
      Global.Kiosk.Customer = null;
      this.CheckWorkstation("Kiosk");
    },

    buttonProducts_tap: function(e) {
      e.preventDefault();
      this.CheckWorkstation("Products");
    },

    buttonCustomers_tap: function(e) {
      e.preventDefault();
      this.CheckWorkstation("Customers");
    },

    buttonReports_tap: function(e) {
      e.preventDefault();
      this.CheckWorkstation("Reports");
    },

    buttonSettings_tap: function(e) {
      e.preventDefault();
      Global.PreviousPage = "dashboard";
      this.CheckWorkstation("Settings");
    },

    buttonSecondary_tap: function(e) {
      e.preventDefault();
      this.CheckWorkstation("Secondary");
    },

    buttonLogout_tap: function(e) {
      e.preventDefault();
      this.ProcessLogout();
    },

    buttonResearch_tap: function(e) {
      e.preventDefault();
      Global.PreviousPage = "dashboard";
      this.CheckWorkstation("Research");
    },

    CheckWorkstation: function(type) {      
      this.ShowActivityIndicator();
      console.log("CheckWorkstation");
      Global.ApplicationType = type;
      if (this.localpreference.length === 0) {
        window.location.hash = "settings";
      } else if (this.localpreference.find(function(model){
                return model.get("IsUseCustomerShipToPaymentType") == false
        }) && (this.localpreference.find(function(model){
                return model.get("PaymentType") == ""
        }))){
          window.location.hash = "settings";
      } else {
        this.InitializeWorkstation(100, this.localpreference.at(0).get("WorkstationID"), type);
      }
    },

    BindDashBoardSwipe: function() { // added by jj
    },

    // BEGIN - FIGUEROA JAN-18-2013 //Added to Verify User Credentials
    CheckUserCredentials: function() {
      Global._HasAdmins = false;
      Global._HasStations = false;
      Global._UserIsAdmin = false;
      console.log("trouble");

      var self = this;
      this.preferenceCollection = new PreferenceCollection();
      this.preferenceCollection.url = Global.ServiceUrl + Service.POS + "getuserroles/";
      console.log(this.preferenceCollection.url);
      this.preferenceCollection.fetch({
        timeout: 0,
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.ValidateUserRole(response.UserRoles);
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error");
        }
      });
    },

    ValidateUserRole: function(userRoles) {
      Global.AdministratorRole = false;
      Global._HasAdmins = false;
      Global._UserIsAdmin = false;
      //If no user roles, check if there are existing workstation.
      if (!userRoles || userRoles.length == 0) {
        this.CheckWorkStations();
        return;
      }

      //Check if current user is an Admin.
      Global._HasAdmins = true;
      if (userRoles.length > 0) {
        for (var i = 0; i < userRoles.length; i++) {
          if (userRoles[i].RoleCode == Global.UserInfo.RoleCode) {
            Global._UserIsAdmin = true;
            Global.AdministratorRole = true;
          }
        }
      }
      this.ShowHideControlsByCredentials();
    },

    CheckWorkStations: function() {

      //this.ShowHideControlsByCredentials();

      var _preference = new LookupCriteriaModel();
      var _rowsToSelect = 100;
      var self = this;
      _preference.set({
        StringValue: ''
      });
      _preference.url = Global.ServiceUrl + Service.POS + Method.PREFERENCELOOKUP + _rowsToSelect;
      _preference.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.ValidateWorkstation(response);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },

    ValidateWorkstation: function(response) {

      if (!response.Preferences || response.Preferences.length == 0)
        Global._HasStations = false;
      else
        Global._HasStations = true;

      this.ShowHideControlsByCredentials();
    },

    ShowHideControlsByCredentials: function() {

      var _adminMode = (Global._UserIsAdmin ||
        (Global._HasStations && !Global._HasAdmins) ||
        (!Global._HasStations && !Global._HasAdmins)
      );
		
      if (_adminMode) {
        this.$("div#setting-wrapper").show();
        if (parseInt(this.CheckMajorVersion()) >= 14) this.$("div#reports-wrapper").show();
      } else if (Global.Preference.IsAllowViewZXTape) {
	  	this.$("div#setting-wrapper").show();
        if (parseInt(this.CheckMajorVersion()) >= 14) this.$("div#reports-wrapper").show();
		this.$("div#setting-wrapper").hide();
	  } else {
        this.$("div#setting-wrapper").hide();
        this.$("div#reports-wrapper").hide();
      }

      //Codes below are commented since we can check version upon render.
      //if(parseInt(this.CheckMajorVersion()) >= 14){
      //    this.$("div#reports-wrapper").show();
      //}
      //else{
      //    this.$("div#reports-wrapper").hide();
      //}
    },

    CheckMajorVersion: function() {
      var major = "";
      var serverVersion = Global.ServerVersion;
      var hasDot = false;
      for (var i = 0; i <= serverVersion.length - 1; i++) {

        if (serverVersion[i] == ".") {
          hasDot = true;
        }
        if (hasDot == false) {
          major += serverVersion[i];
        }


      }
      return major;
    },

    CheckProductEdition: function() {
      //NEW : CSL-12258
      Global._UserIsCS = true;
      this.ShowHideControlsByProductEdition();
      return;

      //OLD
      Global._UserIsCS = false;
      if (Global.UserInfo.ProductEdition === "Connected Sale") {
        Global._UserIsCS = true;
      }
      this.ShowHideControlsByProductEdition();
    },

    ShowHideControlsByProductEdition: function() {
      //return;//Testing
      if (!Global._UserIsCS) {
        this.$("div#customers").hide();
        this.$("div#products").hide();
      }
    },

    /**
    Initializes the views that are contained within the Dashboard View

    @method InitializeChildViews
    **/
    InitializeChildViews: function() {
      this.render();

      this.CheckProductEdition();
      this.InitializeSwipe();
      this.InitializeLocalPreference();
      //this.CheckUserCredentials(); //unnecessary because user roles are already retrieved in InitializePreference
      this.InitializePreference();

      navigator.notification.overrideAlert(); //Notification
    },

    InitializePreference: function() {
      var self = this;
      console.log(Global.POSWorkstationID);
      if (typeof(Global.POSWorkStationID) != undefined) {
        this.preferenceCollection = new PreferenceCollection();
        this.preferenceCollection.url = Global.ServiceUrl + Service.POS + Method.GETPREFERENCEBYWORKSTATION + Global.POSWorkstationID;
        this.preferenceCollection.fetch({
          success: function(collection, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            if (response.ErrorMessage != null && response.ErrorMessage != "") {
              self.NotifyMsg(response.ErrorMessage, "Error");
              return;
            }
            self.AssignCompanyInfo(response.Preference);
            self.AssignCurrency(response.Currency);
            self.ResetPreferenceCollection(response.Preference);
            self.ResetStatusCollection(response.Status);
            self.ResetUserRoleCollection(response.UserRoles);
            self.ResetWarehouseCollection(response.Warehouses);
            self.ResetInventoryPreference(response.InventoryPreference);
            //self.ConfirmDrawerBalanceTracking();
          },
          error: function(collection, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            collection.RequestError(error, "Error");
          }
        });
      }

    },
    ResetInventoryPreference: function(inventoryPreference) {
      Global.InventoryPreference = inventoryPreference;
    },
    AssignCurrency: function(response) {
      Global.CurrencySymbol = response.Symbol;
      Global.CurrencyDecimalSeparator = response.CurrencyDecimalSeparator;
      Global.CurrencyGroupSeparator = response.CurrencyGroupSeparator;
      Global.CurrencyDecimalDigits = response.CurrencyDecimalDigits;
      Global.CurrencyGroupSizes = response.CurrencyGroupSizes;
    },

    AssignCompanyInfo: function(response) {
      Global.CompanyName = response.CompanyName;
      Global.CompanyCountry = response.CompanyCountry;
      Global.CustomerName = response.CustomerName;

    },

    render: function() {
      var self = this;
      Global.Kiosk.Cart = null;
      Global.Kiosk.Total = null;
      var versionA =  Shared.GetVersionAttributes( Global.ServerVersion);
      var versionB = versionA.Major + "." + versionA.Minor;

      if (Global.PreviousServiceUrl === null || Global.PreviousServiceUrl === "") Global.PreviousServiceUrl = Global.ServiceUrl;

      if(versionB >= "18.2") {
            this.$el.html(this._template({
            Username: Global.Username,
            Version: versionB,
            HideReporting: !(self.CheckMajorVersion() >= 14)
          }));
      }
      else {
          this.$el.html(this._template({
            Username: Global.Username,
            Version: Global.ServerVersion,
            HideReporting: !(self.CheckMajorVersion() >= 14)
          }));
      }
    
      this.InitializeSwipe();
      Shared.StorePickup.StopChecker();
      return this;
    },

    InitializeSwipe: function() {
      if (parseInt(this.CheckMajorVersion()) >= 14) {
        if (Global._UserIsCS == true) {
          $("#dashboard-Bullet").show();
          $("#dashboard-page2").show();
          this.swipe = new Swipe(document.getElementById("dashboard-swipe"), {
            callback: function() {
              var _a = this.index + 1;
              $("#dashboard-Bullet em").css("color", "#CCC");
              $("#dashboard-0" + _a).css("color", "#fff");
            }
          });
          var _a = this.swipe.index + 1;
          $("#dashboard-0" + _a).css("color", "#fff");

        } else {
          $("#dashboard-Bullet").hide();
          $("#dashboard-page2").hide();
        }
        $("#reports").show();

      } else {
        $("#reports").hide();
        $("#dashboard-Bullet").hide();
        $("#dashboard-page2").hide();
      }
    },

    InitializeLocalPreference: function() {
      var self = this;
      console.log("trouble - localpref");
      this.localpreference = new LocalPreferenceCollection();
      this.localpreference.fetch({
        isLocalStorage: true,
        success: function(collection, response) {
          if (collection.length != 0) {
            Global.POSWorkstationID = collection.at(0).get("WorkstationID");
            if (Global.PreviousServiceUrl !== Global.ServiceUrl) collection.each(self.ClearLocalPreference, self);
          }
        },
        error: function(collection, error, response) {
          collection.RequestError(error, "Error Retrieving Local Preference");
        }
      });

    },

    ProcessLogout: function() {
      var _model = new BaseModel();
      Global.IsSignOut = true;
      var self = this;
      _model.url = Global.ServiceUrl + Service.POS + Method.SIGNOUT;
      _model.save(null, {
        success: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          var _url = window.location.href.split('#')[0];
          _url = _url + "#login";
          window.location.href = _url;
        },
        error: function(model, error) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Logging out");
        }
      });
    },

    InitializeWorkstation: function(_rows, _criteria, type) {
      var _preference = new LookupCriteriaModel();
      var _rowsToSelect = _rows;
      var self = this;

      _preference.set({
        StringValue: _criteria
      })

      _preference.url = Global.ServiceUrl + Service.POS + Method.PREFERENCELOOKUP + _rowsToSelect;
      _preference.save(null, {
        success: function(model, response) {
          self.CheckApplicationType(_criteria, response, type);
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        },
        error: function(model, error, response) {
          self.HideActivityIndicator();
          model.RequestError(error, "Error");
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },

    CheckApplicationType: function(workstationID, response, type) {
      Global.POSWorkstationID = workstationID;
      if (!response.Preferences) {
        window.location.hash = "settings";
      } else {
        switch (type) {
          case "POS":
            window.location.hash = "pos";
            break;
          case "Kiosk":
            window.location.hash = "kiosk";
            break;
          case "Settings":          
            window.location.hash = "settings";
            break;
          case "Products":
            window.location.hash = "products";
            break;
          case "Customers":
            window.location.hash = "customers";
            break;
          case "Reports":
            window.location.hash = "reports";
            break;
          case "Secondary":
            window.location.hash = "secondary";
            break;
          case "Research": //For Research Purposes CSL-15575
            window.location.hash = "research";
            break;
        }
      }

    },

    /* Method  by PR.Ebron > 03.15.13 > JIRA ID : INTMOBA-761 >
       When changing from/to different web service, Workstation ID should be null */
    ClearLocalPreference: function(model) {
      model.destroy();
      Global.POSWorkstationID = "NoWorkstationId" + Math.random();
      Global.PreviousServiceUrl = Global.ServiceUrl
    },

    ResetPreferenceCollection: function(preferences) {
      Global.Preference = {};
      Global.Preference = preferences;
      Global.TrackDrawerBalance = Global.Preference.TrackDrawerBalance;
      Global.PrintOptions.CustomizePrint = preferences.IsAirprint;
      Global.ResetTransactionType = true;
      var customer = {
        CustomerName: preferences.CustomerName,
        CustomerCode: preferences.CustomerCode,
        Email: preferences.CustomerEmail,
        DefaultPrice: preferences.CustomerDefaultPrice,
        LocationCode: preferences.DefaultLocation,
        PaymentTermCode: preferences.PaymentTermCode
      }
      this.SetCurrentCustomer(customer);

    },

    SetCurrentCustomer: function(customer) {
      Global.CurrentCustomer = customer;
    },

    ResetStatusCollection: function(status) {
      Global.Status = null;
      Global.Status = status;
    },

    ResetUserRoleCollection: function(userRoles) {
      Global.UserRole = userRoles;
      this.ValidateUserRole(userRoles);
    },

    ResetWarehouseCollection: function(warehouses) {
      Global.Warehouses = {};
      Global.Warehouses = warehouses;
      //console.log(warehouses);
      this.isValidDefaultLocation(warehouses);
    },

    //checks if the default location of a workstationID is active.
    isValidDefaultLocation: function(collection) {
      var _location = Global.Preference.DefaultLocation;
      var _locationArray = _.pluck(collection, "WarehouseCode");
      var _validLocation = _.contains(_locationArray, _location);
      if (!_validLocation) {
        this.NotifyMsg('The Current Status of the Default Location is Inactive. Please change your Default Location.', 'Invalid Location');
        this.inValidDefaultLocation = true;
        return;
      }
      this.inValidDefaultLocation = false;
    },

    NotifyMsg: function(content, header) {
      navigator.notification.alert(content, null, header, "OK");
    },

    ShowActivityIndicator: function(target) {
      this.$("#dashboard-blockoverlay").show();
      if (!target) {
        target = document.getElementById('dashboard-page');
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
      $("<h5>Loading...</h5>").appendTo($("#spin"));
    },

    HideActivityIndicator: function() {
      this.$("#dashboard-blockoverlay").hide();
      _spinner = Spinner;
      _spinner.stop();
      $("#spin").remove();
    },

  });
  return DashboardView;
})
