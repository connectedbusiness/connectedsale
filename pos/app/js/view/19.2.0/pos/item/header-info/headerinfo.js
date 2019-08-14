/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/enum',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/item',
  'model/lookupcriteria',
  'model/base',
  'collection/base',
  'collection/customers',
  'collection/shipto',
  'view/19.2.0/pos/item/header-info/company/company',
  'view/19.2.0/pos/item/header-info/customer/customers',
  'view/19.2.0/pos/item/header-info/customer/customerdetail',
  'view/19.2.0/pos/item/header-info/customer/customerform',
  'view/19.2.0/pos/item/header-info/shipto/shiptos',
  'view/19.2.0/pos/item/header-info/shipto/shiptodetail',
  'view/19.2.0/pos/item/header-info/shipto/shiptoform',
  'view/19.2.0/pos/notes/customernotes/notes',
  'view/19.2.0/pos/notes/customernotes/notedetail',
  'view/19.2.0/pos/salesrep/salesrep',
  'text!template/19.2.0/pos/item/header-info/customerinfo.tpl.html',
  'text!template/19.2.0/pos/item/header-info/customerlist.tpl.html',
  'text!template/19.2.0/pos/item/header-info/shiptolist.tpl.html',
  'text!template/19.2.0/pos/notes/customernotes/notelist.tpl.html',
  'view/spinner',
  'js/libs/format.min.js'
], function($, $$, _, Backbone, Global, Enum, Service, Method, Shared,
  ItemModel, LookupCriteriaModel, BaseModel,
  BaseCollection, CustomerCollection, ShipToCollection,
  CompanyView, CustomersView, CustomerDetailView, CustomerFormView, ShipTosView, ShipToDetailView, ShipToFormView,
  NotesListView, NoteDetailView, SalesRepView,
  template, CustomerListTemplate, ShipToListTemplate, NoteListTemplate,
  Spinner) {
  var _pricingHasChanged = false;
  var HeaderInfoView = Backbone.View.extend({
    _template: _.template(template),
    customer: "",
    shipTo: "",
    customerCode: "",
    criteria: "",

    events: {
      //"tap #changeCustomer-btn" : "buttonShowOnTap",
      "tap #customer-lookup": "buttonShowOnTap",
      "tap #changeShipTo-btn": "buttonShowOnTap",

      "tap #done-shipto": "buttonHideOnTap",
      "tap #done-customer": "buttonHideOnTap",
      "tap #done-noteList": "buttonHideOnTap",

      "tap #back-customer": "buttonBackOnTap",
      "tap #back-shipto": "buttonBackOnTap",
      "tap #back-customerDetail": "buttonBackOnTap",

      "tap #select-customer": "buttonCustomerSelectOnTap",
      "tap #select-shipto": "buttonShipToSelectOnTap",

      "tap #add-customer-btn": "buttonShowFormOnTap",
      "tap #addShipTo-btn": "buttonShowFormOnTap",
      "tap #add-noteList-btn": "buttonShowFormOnTap",

      // "keyup #customer-search" : "inputKeyupSearch",
      // "keyup #shipto-search"   : "inputKeyupSearch",
      // "keyup #noteList-search" : "inputKeyupSearch",

      "keyup #customer-search": "inputKeyPressSearch",
      "keyup #shipto-search": "inputKeyPressSearch",
      "keyup #noteList-search": "inputKeyPressSearch",


      "blur #customer-search": "HideClearBtn",
      "blur #shipto-search": "HideClearBtn",

      "tap #customer-searchClearBtn": "ClearText",
      "tap #shipto-searchClearBtn": "ClearText",

      "tap #customer-edit": "buttonEditCustomer",
      "tap #customer-note": "buttonShowCustomerNote",

      "tap #back-noteList": "ReloadCustomer"
    },

    /*
     * Button Functions
     */

    buttonShowCustomerNote: function(e) {
      e.preventDefault();
      //this.trigger("customernotes", Global.NoteType.Customer, this.selectedCustomer );
      //this.changeCssForSelected(e.target.id);
      this.ShowCustomerNoteList();
    },

    buttonEditCustomer: function(e) {
      e.preventDefault();
      Global.EditCustomerLoaded = false;
      //this.changeCssForSelected(e.target.id);
      this.LoadEditCustomerForm();
    },

    buttonHideOnTap: function(e) {
      e.preventDefault();
      this.HideListContainer();
    },

    buttonShowOnTap: function(e) {
      e.preventDefault();
      switch (e.currentTarget.id) {
        case "changeCustomer-btn":
          if (this.AllowChangeCustomer()) {
            this.ShowCustomerList();
          }
          break;
        case "changeShipTo-btn":
          if (this.AllowToChangeShipto()) {
            this.ShowShipToList();
          }
          break;
      }
    },

    buttonShowFormOnTap: function(e) {
      e.preventDefault();
      switch (e.currentTarget.id) {
        case "add-customer-btn":
          if (this.AllowChangeCustomer()) {
            if (Global.Preference.AllowAddCustomer === true) {
              this.HideListContainer();
              this.ShowCustomerForm();
            } else {
              // if (!Global.isBrowserMode)
              navigator.notification.alert("Adding a new customer is not allowed.", null, "Action Not Allowed", "OK");
            }
          }
          break;
        case "addShipTo-btn":
          if (this.AllowToChangeShipto()) {
            this.ShowShipToForm();
          }
          break;
        case "add-noteList-btn":
          $("#noteList-search").blur();
          this.ShowOrderNotesForm();
          break;
      }

    },

    buttonBackOnTap: function(e) {
      e.preventDefault();

      $("#main-transaction-blockoverlay").removeClass("z2990");
      switch (e.target.id) {
        case "back-customer":
          this.BackCustomer();
          break;
        case "back-shipto":
          this.BackShipTo();
          break;
        case "back-customerDetail":
          this.BackCustomer();
          break;
      }
    },

    buttonCustomerSelectOnTap: function(e) {
      e.preventDefault();
      this.SetSelectedCustomer(this.customer);
    },

    buttonShipToSelectOnTap: function(e) {
      e.preventDefault();
      //this.ProcessShipTo(this.shipTo);
      this.SetSelectedShipTo(this.shipTo);
    },

    /*
     * Search
     */
    //inputKeyupSearch : function(e){
    inputKeyPressSearch: function(e) {
      if (e.keyCode === 13) {
        switch (e.target.id) {
          case "customer-search":
            this.criteria = $("#customer-search").val();
            this.LoadCustomer();
            break;
          case "shipto-search":
            this.criteria = $("#shipto-search").val();
            this.LoadShipTo();
            break;
          case "noteList-search":
            this.criteria = $("#noteList-search").val();
            this.LoadCustomerNote();
            break;

        }
      } else {
        this.ShowClearBtn(e);
      }
    },

    changeCssForSelected: function(id) {
      $("#customer-footer").removeClass("customer-selected");
      $("#" + id).addClass("customer-selected");
    },

    initialize: function() { //v14
      this.cart = this.options.cart;
      this.preference = this.options.preference;
      this.item = this.options.item;
      this.salesOrder = this.options.SO;

      this._info = {
        CustomerName: Shared.TrimCustomerName(),
        ShipToName: Shared.TrimDefaultShipTo()
      };
      //this.InitializeCompany();

      $("#headerInfoContainer").prepend(this._template(this._info));

      this.SetDefaultCustomerShiptoAddress();
      var _customerInfo = new BaseModel();
      _customerInfo.set({
        PaymentTermCode: Global.CurrentCustomer.PaymentTermCode,
        CreditLimit: this.preference.at(0).get("CreditLimit"),
        LoyaltyPoints: this.preference.at(0).get("LoyaltyPoints"),
        AvailableCredit: parseFloat(this.preference.at(0).get("AvailableCredit"))
      });
      this.ShowCustomerDetails(_customerInfo);
      //end
      this.HideCustomerPopover();
    },

    ShowCustomerDetails: function(customerInfo) {

      var paymentTermCode = customerInfo.get("PaymentTermCode");
      var creditLimit = customerInfo.get("CreditLimit");
      var loyaltyPoints = customerInfo.get("LoyaltyPoints");
      var availableCredit = customerInfo.get("AvailableCredit");

      $("#label-paymentTerm").html("Payment Term :" + paymentTermCode);
      $("#label-creditLimit").html("Credit Limit : " + Global.CurrencySymbol + " " + format("#,##0.00", parseFloat(creditLimit)));
      $("#label-loyaltyPoints").html("Loyalty Points : " + loyaltyPoints);
      $("#label-avalableCredit").html("Available Credit : " + Global.CurrencySymbol + " " + format("#,##0.00", availableCredit));
    },

    GetCustomerHeaderInfo: function() {
      //GETCUSTOMERLOYALTYHEADERINFO
      if (Shared.IsNullOrWhiteSpace(this.tempModel)) {
        this.tempModel = new BaseModel();
      } else {
        this.tempModel.unbind();
        this.tempModel = new BaseModel();
      }
      var customerCode, shiptoCode;
      var self = this;
      if (Shared.IsNullOrWhiteSpace(Global.CurrentCustomer.CustomerCode)) {
        customerCode = Global.CustomerCode;
      } else {
        customerCode = Global.CurrentCustomer.CustomerCode;
      }

      if (Shared.IsNullOrWhiteSpace(Global.ShipTo.ShipToCode)) {
        shiptoCode = Global.InitialShipToCode;
      } else {
        shiptoCode = Global.ShipTo.ShipToCode;
      }

      this.tempModel.set({
        CustomerCode: customerCode,
        ShipToCode: shiptoCode
      });

      this.tempModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.LOADCUSTOMERHEADERINFO;
      this.tempModel.save(null, {
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();

          // self.SetDefaultCustomerShiptoAddress();

          self.SetCustomerLoyaltyHeaderInfo(response)
        }
      });
      this.SetLoadedTransactionShiptoDetails();
    },

    SetLoadedTransactionShiptoDetails: function() {
      if (!Shared.IsNullOrWhiteSpace(Global.IsLoadByTransaction)) {
        var _shipToAddress = "(No Address)",
          _displayAddress = "",
          _displayAddress = _shipToAddress;

        var _shipToCity = Global.CurrentCustomer.ShipToCity,
          _shiptoState = Global.CurrentCustomer.ShipToState,
          _shiptoPostalCode = Global.CurrentCustomer.ShipToPostalCode;

        /* End CSL-24539*/
        if (!(Global.Transaction.ShipToAddress == null && _shipToCity == null && _shiptoState == null && _shiptoPostalCode == null)) {
          if (Shared.IsNullOrWhiteSpace(_shipToCity)) _shipToCity = "";
          if (Shared.IsNullOrWhiteSpace(_shiptoState)) _shiptoState = "";
          if (Shared.IsNullOrWhiteSpace(_shiptoPostalCode)) _shiptoPostalCode = "";
          _shipToAddress = "";
          //if (!Shared.IsNullOrWhiteSpace(Global.Transaction.ShipToAddress)) _shipToAddress = Global.Transaction.ShipToAddress;
          if (!Shared.IsNullOrWhiteSpace(Global.CurrentCustomer.ShipToAddress)) _shipToAddress = Global.CurrentCustomer.ShipToAddress;

          if (Shared.IsNullOrWhiteSpace(_shipToAddress)) _shipToAddress = "";
          _displayAddress = _shipToAddress + " " + _shipToCity + ", " + _shiptoState + " " + _shiptoPostalCode;
          _shipToAddress = _displayAddress;
        }
        $("#label-shipto").html(this.TrimShipToName(Global.CurrentCustomer.ShipToName) + ',');
        $("#label-shipto").append('<br/>' + Shared.Escapedhtml(_shipToAddress));
      }
    },

    SetDefaultCustomerShiptoAddress: function() {
      console.log("SET Default");
      var _shipToAddress = "(No Address)";
      var _displayAddress = "";
      var _displayAddress = _shipToAddress;
      var _shipToCity = Global.DefaultShipToCity;
      var _shiptoState = Global.DefaultShipToState;
      var _shiptoPostalCode = Global.DefaultShipToPostalCode;
      if (!(Global.DefaultShipToAddress == null && _shipToCity == null && _shiptoState == null && _shiptoPostalCode == null)) {
        if (Shared.IsNullOrWhiteSpace(_shipToCity)) _shipToCity = "";
        if (Shared.IsNullOrWhiteSpace(_shiptoState)) _shiptoState = "";
        if (Shared.IsNullOrWhiteSpace(_shiptoPostalCode)) _shiptoPostalCode = "";
        _shipToAddress = "";
        if (!Shared.IsNullOrWhiteSpace(Global.DefaultShipToAddress)) _shipToAddress = Global.DefaultShipToAddress;

        if (Shared.IsNullOrWhiteSpace(_shipToAddress)) _shipToAddress = "";
        _displayAddress = _shipToAddress + " " + _shipToCity + ", " + _shiptoState + " " + _shiptoPostalCode;
        _shipToAddress = _displayAddress;
      }
      console.log("ShiptoAddress : " + _shipToAddress);
      $("#label-shipto").html(Shared.TrimDefaultShipTo());
      $("#label-shipto").append('<br/>' + Shared.Escapedhtml(_shipToAddress));
    },

    SetCustomerLoyaltyHeaderInfo: function(response) {
      var tempModel = new BaseModel();
      tempModel.set(response);
      var _loyaltyPoints = tempModel.get("LoyaltyPoints");
      _loyaltyPoints = Math.round(_loyaltyPoints).toLocaleString("en");
      tempModel.set({
        LoyaltyPoints: _loyaltyPoints
      });
      this.ShowCustomerDetails(tempModel);
      $("#customerInfoContainer").show();

      var tmp_selector_LEFT = $('#customer-selector').offset().left;
      var tmp_selector_WIDTH = $('#customer-selector').outerWidth(true)
      var tmp_container_WIDTH = $('#customerInfoContainer').find('.popover-content').width();
      var tmp_container_NEW_LEFT = tmp_selector_LEFT + (tmp_selector_WIDTH / 2) - (tmp_container_WIDTH / 2);
      $('#customerInfoContainer').offset({
        left: tmp_container_NEW_LEFT
      });
      $('#customerInfoContainer').offset({
        left: tmp_container_NEW_LEFT
      }); //Duplicate Line for Safari 'coz it does not take effect quickly.


    },
    TrimShipToName: function(shiptoName) {
      var _shipToName = Shared.Escapedhtml(shiptoName);
      if (Global.DefaultShipTo.length >= 65) {
        _shipToName = Shared.Escapedhtml(shiptoName.substring(0, 71) + "...");
        //return Global.DefaultShipTo.substring(0, 71)+"...";
        return _shipToName;
      } else {
        //return Global.DefaultShipTo;
        return _shipToName;
      }
    },
    ShowCustomerPopover: function() {
      this.GetCustomerHeaderInfo();
    },

    HideCustomerPopover: function() {
      $("#customerInfoContainer").hide();
    },

    /*
     * Load Company Logo
     */
    InitializeCompany: function() {
      if (!this.companyView) {
        this.companyView = new CompanyView({
          el: $(".transactionSummary"),
          model: this.preference.at(0)
        });
      }
    },

    /*
     * Show ShipTo List
     */
    ShowShipToList: function() {
      $("#shipto").remove();
      this.criteria = '';
      this.CheckType(this.cart, "ShipToList");
    },

    /*
     * Show Ship To Form
     */
    ShowShipToForm: function() {
      this.CheckType(this.cart, "ShipToForm");
    },

    /*
     * Show Customer List
     */
    ShowCustomerList: function() {
      if (!this.AllowChangeCustomer()) return;
      $("#customer").remove();
      this.criteria = '';
      this.CheckType(this.cart, "CustomerList");
    },

    /*
     * Show SalesRep List
     */
    ShowSalesRepList: function() {
      $("#salesrep").remove();
      this.CheckType(this.cart, "SalesRepList");
    },

    /*
     * Show Customer Form
     */
    ShowCustomerForm: function() {
      this.CheckType(this.cart, "CustomerForm");
    },

    /*
     * Show Customer Note
     */
    ShowCustomerNoteList: function() {
      this.criteria = '';
      this.CheckType(this.cart, "CustomerNoteList");
    },

    /*
     * Back to CustomerList
     */
    BackCustomer: function() {
      $("#customer").replaceWith(_.template(CustomerListTemplate));
      this.HideButtons("CustomerList");
      this.LoadCustomer();
    },

    /*
     * Back to ShipTo List
     */
    BackShipTo: function() {
      $("#shipto").replaceWith(_.template(ShipToListTemplate));
      this.HideButtons("ShipToList");
      this.LoadShipTo();
    },

    /*
     * Set Default Customer
     */

    SetSelectedCustomer: function(customer, isCustomerUpdated) { //v14

      Global.ShipTo.ShipToCode = customer.get("DefaultShipToCode");
      Global.ShipTo.ShipToName = customer.get("ShipToName");
      Global.ShipTo.ShipToCountry = customer.get("ShipToCountry");
      Global.ShipTo.ShipToCounty = customer.get("ShipToCounty");
      Global.ShipTo.ShipToAddress = customer.get("ShipToAddress");
      Global.ShipTo.ShipToCity = customer.get("ShipToCity");
      Global.ShipTo.ShipToPhone = customer.get("ShipToPhone");
      Global.ShipTo.ShipToPhoneExtension = customer.get("ShipToPhoneExtension");
      Global.ShipTo.ShipToPostalCode = customer.get("ShipToPostalCode");
      Global.ShipTo.ShipToState = customer.get("ShipToState");
      Global.ShipTo.PaymentTermGroup = customer.get("PaymentTermGroup");
      Global.ShipTo.PaymentTermCode = customer.get("PaymentTermCode");
      Global.ShipTo.DiscountPercent = customer.get("DiscountPercent");
      Global.ShipTo.DiscountType = customer.get("DiscountType");
      Global.ShipTo.DiscountableDays = customer.get("DiscountableDays");
      Global.ShipTo.DueType = customer.get("DueType");
      Global.ShipTo.TaxCode = customer.get('TaxCode');

	  if (!Global.Preference.TaxByLocation) {
        var taxCode = window.sessionStorage.getItem('selected_taxcode');
        if (taxCode) window.sessionStorage.removeItem('selected_taxcode');

        window.sessionStorage.setItem('selected_taxcode', Global.ShipTo.TaxCode);
      }
      //MAR-14-2013 - Check is current customer is same with the selected customer customer
      // to prevent recomputation and clearing of payment collection.
      //if(Global.CustomerCode == customer.get("CustomerCode")){
      //console.log('Same Customer Selected');
      //if (Global.OnRechargeProcess) this.trigger('proceedToLookupItems');
      //this.HideListContainer();
      //return;
      //}
      _pricingHasChanged = (Global.DefaultPrice != customer.get("DefaultPrice"));

      var _shipToAddress = "(No Address)";
      var _displayAddress = _shipToAddress;
      Global.CurrentCustomerSourceCode = customer.get("SourceCode");
      Global.CurrentCustomer = customer.toJSON();
      Global.CustomerName = customer.get("CustomerName");
      Global.CustomerEmail = customer.get("Email");
      Global.POSSalesReceipt = customer.get("POSSalesReceipt");
      Global.DefaultContactEmail = customer.get("DefaultContactEmail");
      Global.DefaultPrice = customer.get("DefaultPrice");
      Global.IsTrackLoyaltyPoints = customer.get("TrackLoyaltyPoints");

      if (Global.IsOverrideSalesRep) {
        var SalesRepResult = _.find(Global.SalesRepUserAccount, function (data) {
          return data.UserName == Global.UserInfo.UserCode;
        });

        if (SalesRepResult != null) {
            Global.SalesRepGroupCode = SalesRepResult.SalesRepGroupCode;
            Global.SalesRepGroupName = SalesRepResult.SalesRepGroupName;
            Global.CommissionPercent = SalesRepResult.SalesRepGroupName == null ? 0 : 100;
        }
        else {
          Global.SalesRepGroupCode = '';
          Global.SalesRepGroupName = ''
          Global.CommissionPercent = 0
        }
      }
      else {
      Global.SalesRepGroupCode = customer.get("SalesRepGroupCode");
      Global.SalesRepGroupName = customer.get("SalesRepGroupName");
      Global.CommissionPercent = 100;
      }
      Global.SalesRepList = "";

      Global.CurrentCustomerEmailChanged = true;
      var _displayAddress = _shipToAddress;
      var _shipToCity = Global.CurrentCustomer.ShipToCity;
      var _shiptoState = Global.CurrentCustomer.ShipToState;
      var _shiptoPostalCode = Global.CurrentCustomer.ShipToPostalCode;
      if (!(Global.CurrentCustomer.ShipToAddress == null && _shipToCity == null && _shiptoState == null && _shiptoPostalCode == null)) {
        if (Shared.IsNullOrWhiteSpace(_shipToCity)) _shipToCity = "";
        if (Shared.IsNullOrWhiteSpace(_shiptoState)) _shiptoState = "";
        if (Shared.IsNullOrWhiteSpace(_shiptoPostalCode)) _shiptoPostalCode = "";
        _shipToAddress = Global.CurrentCustomer.ShipToAddress;
        if (Shared.IsNullOrWhiteSpace(_shipToAddress)) _shipToAddress = "";
        _displayAddress = _shipToAddress + " " + _shipToCity + ", " + _shiptoState + " " + _shiptoPostalCode;
        _shipToAddress = _displayAddress;
      }

      var _shipto = Global.CurrentCustomer.ShipToName;

      //CSL - 8889 : 06.06.2013
      //Global.DefaultShipTo = Shared.Escapedhtml(_shipto) + ",<br/>" + _shipToAddress;  << original code
      //start modification 06.06.13
      Global.DefaultShipTo = _shipto + ",";
      // Global.DefaultShipToAddress = _shipToAddress;
      $("#label-shipto").html(Shared.TrimDefaultShipTo());
      $("#label-shipto").append('<br/>' + Shared.Escapedhtml(_shipToAddress))
      console.log("Set SElected Customer" + _shipToAddress);
      //end modification.
      var _customerInfo = new BaseModel();
      _customerInfo.set({
        PaymentTermCode: Global.CurrentCustomer.PaymentTermCode,
        CreditLimit: customer.get("CreditLimit"),
        LoyaltyPoints: customer.get("OutstandingPoints"),
        AvailableCredit: parseFloat(customer.get("AvailableCredit"))
      });
      this.ShowCustomerDetails(_customerInfo);

      $("#lbl-customerName").html(Shared.TrimCustomerName());
      $("#lbl-salesrepName").html(Shared.TrimSalesRepName());
      $("#splitrateName").html(Shared.TrimCommissionPercent());

      if (Global.CustomerCode === customer.get("CustomerCode")) {
        this.trigger("customerchanged", this);
        this.trigger("shiptochanged", this);

        if (isCustomerUpdated && (Global.Preference.CustomerCode === customer.get("CustomerCode"))) {
          if (Global.Preference.CustomerName != customer.get("CustomerName")) {
            Global.Preference.CustomerName = customer.get("CustomerName");
          }

          if (Global.Preference.CustomerEmail != customer.get("Email")) {
            Global.Preference.CustomerEmail = customer.get("Email");
          }

        } else {
          Global.CurrentCustomerEmailChanged = false;
        }

        if (Global.OnRechargeProcess) {
          this.trigger('proceedToLookupItems');
        }
      } else {
        Global.CustomerCode = customer.get("CustomerCode");

        this.trigger("customerchanged", this);
        //this.trigger("shiptochanged", this); //CSL-24817 - Additional bug. removed to prioritize the retrieval of customer prices first. snippet is placed on recalculate price callback.
        this.RecalculatePrice();
      }

      this.HideListContainer();
    },

    PricingHasChanged: function() {
      return _pricingHasChanged;
    },

    SetAsDefaultShipto: function(shiptoModel) {
      var _shipto = shiptoModel.attributes;

      Global.DefaultShipTo = _shipto.ShipToName + ',';
      Global.DefaultShipToAddress = _shipto.Address;
      Global.ShipTo = _shipto;

      Global.ShipToDiscountPercent = _shipto.DiscountPercent;
      Global.ShipToDiscountType = _shipto.DiscountType;
      Global.ShipToDiscountableDays = _shipto.DiscountableDays;

      if (Global.Preference.CustomerCode === Global.CustomerCode) {
        Global.Preferences.Preference.DefaultShipTo = _shipto;
        Global.Preferences.Preference.PaymentTermCode = _shipto.PaymentTermCode;

        Global.Preference.DefaultShipTo = _shipto;
        Global.Preference.PaymentTermCode = _shipto.PaymentTermCode;
        Global.ShipToName = _shipto.ShipToName;
        Global.ShipToAddress = _shipto.Address;
        Global.InitialShipToCode = _shipto.ShipToCode;
        Global.InitialDiscountPercent = _shipto.DiscountPercent;
        Global.DefaultShipTo = _shipto.ShipToName + ',';
        //if(!_shipto.Address) Global.DefaultShipToAddress = "(No Address)";
        //else Global.DefaultShipToAddress = _shipto.Address;
        if (!Shared.IsNullOrWhiteSpace(_shipto.Address)) Global.DefaultShipToAddress = _shipto.Address;
      }
      this.trigger("shiptochanged", this);

    },

    SetSelectedShipTo: function(shipto) {
      if (!this.AllowToChangeShipto()) return;
      if (shipto.get("IsDefaultShipTo") == true) this.SetAsDefaultShipto(shipto)
      var _shipToAddress = "(No Address)";
      Global.CurrentCustomer.ShipToCode = shipto.get("ShipToCode");
      Global.CurrentCustomer.ShipToName = shipto.get("ShipToName");
      Global.CurrentCustomer.ShipToCountry = shipto.get("Country");
      Global.CurrentCustomer.ShipToCounty = shipto.get("County");
      Global.CurrentCustomer.ShipToAddress = shipto.get("Address");
      Global.CurrentCustomer.ShipToCity = shipto.get("City");
      Global.CurrentCustomer.ShipToPhone = shipto.get("Telephone");
      Global.CurrentCustomer.ShipToPhoneExtension = shipto.get("TelephoneExtension");
      Global.CurrentCustomer.ShipToPostalCode = shipto.get("PostalCode");
      Global.CurrentCustomer.ShipToState = shipto.get("State");
      Global.CurrentCustomer.PaymentTermCode = shipto.get("PaymentTermCode");

      Global.CurrentCustomer.DiscountPercent = shipto.get("DiscountPercent");
      Global.CurrentCustomer.DiscountType = shipto.get("DiscountType");
      Global.CurrentCustomer.DiscountableDays = shipto.get("DiscountableDays");
      Global.CurrentCustomer.DueType = shipto.get("DueType");
      Global.ShipTo.PaymentTermGroup = shipto.get("PaymentTermGroup");
      Global.ShipTo.PaymentTermCode = shipto.get("PaymentTermCode");
      Global.ShipTo.ShipToCode = shipto.get("ShipToCode");
      Global.ShipTo.DiscountPercent = shipto.get("DiscountPercent");
      Global.ShipTo.DiscountType = shipto.get("DiscountType");
      Global.ShipTo.DiscountableDays = shipto.get("DiscountableDays");
      Global.ShipTo.DueType = shipto.get("DueType");
      Global.ShipTo.TaxCode = shipto.get('TaxCode');

      if (!Global.Preference.TaxByLocation) {
        var taxCode = window.sessionStorage.getItem('selected_taxcode');
        if (taxCode) window.sessionStorage.removeItem('selected_taxcode');

        window.sessionStorage.setItem('selected_taxcode', Global.ShipTo.TaxCode);
      }
      // if(shipto.get("IsDefaultShipTo")){
      // 	Global.ShipToName        = shipto.get("ShipToName");
      // 	Global.ShipToAddress     = shipto.get("Address");
      // }
      var _displayAddress = _shipToAddress;
      var _shipToCity = Global.CurrentCustomer.ShipToCity;
      var _shiptoState = Global.CurrentCustomer.ShipToState;

      var _shiptoPostalCode = Global.CurrentCustomer.ShipToPostalCode;
      if (!(Global.CurrentCustomer.ShipToAddress == null && _shipToCity == null && _shiptoState == null && _shiptoPostalCode == null)) {
        if (Shared.IsNullOrWhiteSpace(_shipToCity)) _shipToCity = "";
        if (Shared.IsNullOrWhiteSpace(_shiptoState)) _shiptoState = "";
        if (Shared.IsNullOrWhiteSpace(_shiptoPostalCode)) _shiptoPostalCode = "";
        _shipToAddress = Global.CurrentCustomer.ShipToAddress;
        if (Shared.IsNullOrWhiteSpace(_shipToAddress)) _shipToAddress = "";
        _displayAddress = _shipToAddress + " " + _shipToCity + ", " + _shiptoState + " " + _shiptoPostalCode;
        console.log("County : " + Global.CurrentCustomer.ShipToCounty);
        _shipToAddress = _displayAddress;
      }

      var _shipto = Global.CurrentCustomer.ShipToName;

      Global.CurrentShipToUpdated = true;

      //CSL - 8889 : 06.06.2013
      //Global.DefaultShipTo = Shared.Escapedhtml(_shipto) + ",<br/>" + _shipToAddress;  << original code
      //start modification 06.06.13
      Global.DefaultShipTo = _shipto + ",";
      //Global.DefaultShipToAddress = _shipToAddress;
      $("#label-shipto").html(Shared.TrimDefaultShipTo());
      $("#label-shipto").append('<br/>' + Shared.Escapedhtml(_shipToAddress))
      $("#label-paymentTerm").html("Payment Term :" + Global.CurrentCustomer.PaymentTermCode);
      //end modification.
      console.log("Set SElected Shipto" + _shipToAddress);
      this.trigger("shiptochanged", this);
      //this.RecalculatePrice();
      this.HideListContainer();
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
        case Enum.TransactionType.ConvertOrder:
          msg = "You cannot change the ship-to name because this invoice came from sales order. You may void this invoice to change the ship-to on the sales order.";
          navigator.notification.alert(msg, null, "Action Not Allowed", "OK", true);
          return false;
          break;
        default:
          return true; //if allowed to change shipTo address
          break;
      }
      if (!msg) msg = "Your action is not allowed for '" + Global.TransactionType + "'."
      navigator.notification.alert(msg, null, "Action Not Allowed", "OK");
      return false;
    },

    /*
     * Reload Items
     */
    InitializeItemModel: function() {
      this.itemModel = new ItemModel();
      this.itemModel.set({
        "IsUsePOSShippingMethod": Global.Preference.IsUsePOSShippingMethod,
        "POSShippingMethod": Global.Preference.POSShippingMethod,
      });
      this.itemModel.url = Global.ServiceUrl + Service.SOP + Method.GETCUSTOMERITEMSPRICES;
    },

    /*
     * Recalculate Price
     */
    RecalculatePrice: function() {
      this.InitializeItemModel();

      var _couponID = "";
      if (Global.Coupon && !Global.CurrentCustomerChanged) {
        _couponID = Global.Coupon.get('CouponID')
      }
      if (this.cart.length > 0 || !this.cart) {
        this.itemModel.set({
          "CustomerCode": Global.CustomerCode,
          "CategoryCode": Global.Category,
          "WarehouseCode": Global.LocationCode,
          "TaxByLocation": Global.Preference.TaxByLocation,
          "CouponID": _couponID,
          "SOPDetails": this.cart.toJSON(),
          "ShipToCode": Global.ShipTo.ShipToCode,
          "DiscountPercent": Global.ShipTo.DiscountPercent,
          "DiscountType": Global.ShipTo.DiscountType,
          "TransactionType": Global.TransactionType,
        });
      } else {
        this.itemModel.set({
          "CustomerCode": Global.CustomerCode,
          "CategoryCode": Global.Category,
          "WarehouseCode": Global.LocationCode,
          "TaxByLocation": Global.Preference.TaxByLocation,
          "CouponID": _couponID,
          "ShipToCode": Global.ShipTo.ShipToCode,
          "DiscountPercent": Global.ShipTo.DiscountPercent,
          "DiscountType": Global.ShipTo.DiscountType,
          "TransactionType": Global.TransactionType,
        });
      }

      var self = this;
      this.itemModel.save(null, {
        success: function(model, result) {
          self.cart.reset();
          self.CheckCustomerItemPrices(result);
          if (result.SOPDetails) self.cart.add(result.SOPDetails);
          self.salesOrder.reset(result.SOPDetails);
          self.salesOrder.each(self.ReloadItems, self);
          self.salesOrder.trigger("recalculateCompleted", self);
          self.ResetCurrentCustomerChanged();
          self.trigger("shiptochanged", self); //CSL-24817 - Additional bug. placed here to prioritize the retrieval of customer prices first.
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();

        },
        error: function(model, error, response) {
          model.RequestError(error, "Error Recalculating Price");
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },

    CheckCustomerItemPrices: function(result) {
      _.each(result.SOPDetails, function(model) {
        var _saleTax = model.SalesTaxAmountRate * model.QuantityOrdered;
        model.SalesTaxAmountRate = _saleTax;

        if (Global.CurrentCustomerChanged == true) {
          if (model.Pricing) model.Pricing = null;
          if (model.DoNotChangePrice) model.DoNotChangePrice = false;
        }
      });
    },

    ReloadItems: function(model) {
      model.recalculate();
    },

    /*
     * Check Type
     */
    CheckType: function(collection, type) {
      switch (type) {
        case "CustomerList":
          this.RenderCustomerListTemplate();
          this.HideButtons(type);
          this.LoadCustomer();
          break;
        case "CustomerForm":
          this.LoadCustomerForm();
          break;
        case "ShipToList":
          this.RenderShipToListTemplate();
          this.HideButtons(type);
          this.LoadShipTo();
          break;
        case "ShipToForm":
          this.LoadShipToForm();
         $(".shipto2-ClassTemplate-container").css("display", "block");
          break;
        case "CustomerNoteList":
          this.RenderNoteListTemplate();
          this.HideButtons(type);
          this.LoadCustomerNote();
          break;
        case "SalesRepList":
          this.RenderSalesRepListTemplate();
          this.ShowSpinner("salesrep");
          break;
      }
    },

    /*
     * Ship To
     */
    RenderShipToListTemplate: function() {
      $("#headerInfoContainer").prepend(_.template(ShipToListTemplate));
    },

    LoadShipTo: function() {
      $("#spin").remove();
      //this.DisableButton();
      this.ShowSpinner();
      this.InitializeShipTo(100, this.criteria);
      this.InitializeShipToView();
    },

    LoadShipToForm: function() {
      $("#headerInfoContainer").append("<div id='FormContainer'></div>");
      var shipToForm = new ShipToFormView({
        el: $("#FormContainer"),
        FormType: "New Ship To"
      });

      shipToForm.on('createdShipTo', this.ProcessShipTo, this);

      $("#main-transaction-blockoverlay").show();
    },

    InitializeShipTo: function(_rows, _criteria, type) {
      var self = this;
      var _shipToLookup = new LookupCriteriaModel();

      //Initialize collection
      this.shipToCollection = new ShipToCollection();
      this.shipToCollection.on('selected', this.LoadShipToDetail, this);
      this.shipToCollection.on('viewDetail', this.SetSelectedShipTo, this);

      _shipToLookup.set({
        CriteriaString: _criteria,
        CustomerCode: Global.CurrentCustomer.CustomerCode
      });

      _shipToLookup.url = Global.ServiceUrl + Service.CUSTOMER + Method.SHIPTOLOOKUP + _rows;
      _shipToLookup.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.shipToCollection.reset(response.ShipToCollection);
          if (type === "update") self.ProcessUpdatedShipTo(response);
          self.HideActivityIndicator();
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.HideActivityIndicator();
          model.RequestError(error, "Error Retrieving Ship Tos");
        }
      })
    },

    InitializeShipToView: function() {
      this.shipTosView = new ShipTosView({
        el: $("#shipto-content"),
        collection: this.shipToCollection
      });
    },

    LoadShipToDetail: function(shipTo) {
      var self = this;
      this.criteria = shipTo.get("ShipToName");

      var toBeLoaded = this.shipToCollection.find(function(model) {
        return model.get("ShipToName") == self.criteria;
      });

      if (toBeLoaded) this.LoadShipToDetailView(toBeLoaded);

      this.criteria = "";
    },

    LoadShipToDetailView: function(shipTo) {
      var shipTodetail = new ShipToDetailView({
        el: $("#shipto-inner"),
        model: shipTo
      });

      shipTodetail.on("ProcessShipTo", this.ProcessShipTo, this);
      this.shipTo = shipTo;
      this.HideButtons("ShipToDetail");
    },

    /*
     *  Customer List
     */
    RenderCustomerListTemplate: function() {
      $("#headerInfoContainer").prepend(_.template(CustomerListTemplate));
    },

    LoadCustomer: function() {
      $("#spin").remove();
      //this.DisableButton();
      this.ShowSpinner();
      this.InitializeCustomer(100, this.criteria);
      this.InitializeCustomerView();
    },

    RetrieveCurrentCustomer: function(code) {
      var self = this;

      this.currentCustomer = new CustomerCollection();
      this.currentCustomer.url = Global.ServiceUrl + Service.CUSTOMER + Method.LOADCUSTOMERBYCODE + code;
      this.currentCustomer.fetch({
        success: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Retrieving Customer");
        }
      });
    },

    InitializeCustomer: function(_rows, _criteria, type, selectFirstModel) {
      var self = this;
      var customerLookup = new LookupCriteriaModel();
      //Initialize collection
      this.customerCollection = new CustomerCollection();
      this.customerCollection.on('selected', this.LoadCustomerDetail, this);
      this.customerCollection.on('viewDetail', this.SetSelectedCustomer, this);
      this.customerCollection.on('create', this.SetNewCustomer, this);

      if (!selectFirstModel) selectFirstModel = false;
      customerLookup.set({
        StringValue: _criteria
      })

      customerLookup.url = Global.ServiceUrl + Service.CUSTOMER + Method.CUSTOMERLOOKUP + _rows;
      customerLookup.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();

          self.customerCollection.reset(response.Customers);
          if (type === "Edit Customer") self.ProcessUpdatedCustomer(response);
          if (type === "New Customer") self.SetSelectedCustomer(self.customerCollection.at(0));

          if (selectFirstModel) self.SetSelectedCustomer(self.customerCollection.at(0));

          self.HideActivityIndicator();
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.HideActivityIndicator();
          model.RequestError(error, "Error Retrieving Customer List");
        }
      });
    },

    InitializeCustomerView: function() {
      this.customerView = new CustomersView({
        el: ("#customer-content"),
        collection: this.customerCollection
      });
    },

    AllowChangeCustomer: function() {
      console.log("AllowChangeCustomer: " + Global.TransactionType);
      if (Global.TransactionType === Enum.TransactionType.Sale ||
        Global.TransactionType === Enum.TransactionType.Quote ||
        Global.TransactionType === Enum.TransactionType.Order ||
        Global.TransactionType === Enum.TransactionType.Return) {
        return true;
      }

      var msg = "";
      if (Global.TransactionType == Enum.TransactionType.ConvertOrder) msg = "converting an order";
      if (Global.TransactionType == Enum.TransactionType.ConvertQuote) msg = "converting a quote.";
      if (Global.TransactionType == Enum.TransactionType.UpdateOrder) msg = "updating an order.";
      if (Global.TransactionType == Enum.TransactionType.UpdateQuote) msg = "updating a quote.";
      if (msg.length > 0) msg = "Your action is not allowed when " + msg;
      if (msg.length == 0) msg = "Your action is not allowed for '" + Global.TransactionType.toString() + "'.";

      console.log(msg);
      navigator.notification.alert(msg, null, "Action Not Allowed", "OK");
      return false;
    },

    LoadCustomerDetail: function(customer) {
      var self = this;
      this.customer = customer;
      this.customerCollection = new CustomerCollection();
      this.customerCollection.url = Global.ServiceUrl + Service.CUSTOMER + Method.LOADCUSTOMERBYCODE + customer.get("CustomerCode");
      this.customerCollection.fetch({
        success: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.GetCustomer(customer.get("CustomerCode"));
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Loading Customer Detail");
        }
      });
    },

    GetCustomer: function(code) {
      var self = this;
      this.customerCollection.each(function(model) {
        if (code === model.get("CustomerCode")) {
          self.selectedCustomer = model;
          self.LoadCustomerDetailView(model);
        }
      });
    },

    LoadCustomerDetailView: function(customer) {
      var customerdetail = new CustomerDetailView({
        el: $("#customer-inner"),
        model: customer
      });

      customerdetail.on("ProcessCustomer", this.ProcessCustomer, this);
      this.HideButtons("CustomerDetail");
    },

    /*
     * Load Customer Form
     */
    LoadCustomerForm: function() {
      $("#headerInfoContainer").append("<div id='FormContainer'></div>");
      var customerform = new CustomerFormView({
        el: $("#FormContainer"),
        FormType: "New Customer"
      });

      customerform.on('createdCustomer', this.ProcessCustomer, this);
      $("#main-transaction-blockoverlay").show();
    },

    LoadEditCustomerForm: function() {
      $("#customer").remove();
      $("#headerInfoContainer").append("<div id='FormContainer'></div>");
      var customerform = new CustomerFormView({
        el: $("#FormContainer"),
        FormType: "Edit Customer"
      });

      customerform.on('updatedCustomer', this.ProcessCustomer, this);
      customerform.on('formLoaded', this.EditCustomer, this);

      $("#main-transaction-blockoverlay").show();
    },

    EditCustomer: function(view) {
      if (view) view.EditCustomer(this.selectedCustomer);
      this.selectedCustomer = null;
    },

    /*
     * Sales Rep List
     */
    RenderSalesRepListTemplate: function() {
      if (Global.TransactionType === Enum.TransactionType.SalesCredit ||
          Global.TransactionType === Enum.TransactionType.SalesPayment ||
          Global.TransactionType === Enum.TransactionType.SalesRefund ||
          Global.TransactionType === Enum.TransactionType.Suspend ||
          Global.TransactionType === Enum.TransactionType.ResumeSale ||
          Global.TransactionType === Enum.TransactionType.VoidTransaction ||
          Global.TransactionType === Enum.TransactionType.Recharge ) {

        var msg = "Your action is not allowed for '" + Global.TransactionType.toString() + "'.";

        console.log(msg);
        navigator.notification.alert(msg, null, "Action Not Allowed", "OK");
      }
      else {
        var salesrepview = new SalesRepView({
        rows: 100
        });
        salesrepview.on("hideSpinner", function () {
          this.HideActivityIndicator();
        }.bind(this));
      }

      $("#salesrep-container").append(salesrepview.render().el);
      $("#spin").remove();
      this.HideActivityIndicator();
    },

    /*
     * Hide List Container
     */
    HideListContainer: function() {
      this.HideActivityIndicator();
      Shared.FocusToItemScan();
      $("#customer").hide();
      $("#shipto").hide();
      $("#noteList").remove();
      $("#main-transaction-blockoverlay").hide();
    },

    HideButtons: function(type) {
      switch (type) {
        case "CustomerList":
          $("#back-customer").hide();
          $("#select-customer").hide();

          $("#customer-inner").css("height", "538px");
          $("#customer-footer").hide();
          break;
        case "CustomerDetail":
          $("#done-customer").hide();
          $("#back-customer").show();
          $("#select-customer").show();

          $("#customer-inner").css("height", "495px");
          $("#customer-footer").show();
          break;
        case "ShipToList":
          $("#back-shipto").hide();
          $("#select-shipto").hide();
          break;
        case "ShipToDetail":
          $("#done-shipto").hide();
          $("#back-customerDetail").hide();
          $("#back-shipto").show();
          $("#select-shipto").show();
          break;
        case "CustomerNoteList":
          $("#select-noteList").hide();

          $("#noteList-inner").css("height", "538px");
          $("#noteList-footer").hide();
          break;
        case "CustomerNoteDetail":
          $("#noteList-customer").hide();
          $("#noteList-customer").show();
          $("#noteList-customer").show();

          $("#noteList-inner").css("height", "495px");
          $("#noteList-footer").show();
          break;
      }
    },

    /*
     * Spinner
     */
    ShowSpinner: function(targetID) {
      $("#main-transaction-blockoverlay").show();
      var defaultTargetId = (Shared.IsNullOrWhiteSpace(targetID)) ? 'main-transaction-page' : targetID;
      target = document.getElementById(defaultTargetId);
      this.ShowActivityIndicator(target);
      $("<h5>Loading...</h5>").appendTo($("#spin"));
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

    /*
     * Enable / Disable lookup button
     */
    DisableButton: function() {
      $("#done-customer").addClass('ui-disabled');
    },

    EnableLookupButton: function() {
      $("#done-customer").removeClass('ui-disabled');
    },

    /*
     * Show and Hide Clear Button
     */
    ShowClearBtn: function(e) {
      e.stopPropagation();

      var _id = e.target.id;
      //e.stopPropagation();
      var _val = $("#" + _id).val();
      var _strLength = _val.length;
      var _pos = $("#" + _id).position(); // retrieves the position of the given element
      var _width = $("#" + _id).width();
      //console.log(_id);
      if (_strLength <= 0) {
        this.HideClearBtn();
      } else {
        console.log(_id);
        if (_pos !== null || _pos !== "") {
          $("#" + _id + "ClearBtn").css({
            top: (_pos.top + 7),
            left: (_pos.left + (_width - 18))
          });
          $("#" + _id + "ClearBtn").show();
        }
      }
    },

    HideClearBtn: function() {
      $(".clearTextBtn").fadeOut();
    },

    ClearText: function(e) {
      var _id = e.target.id;
      var id = _id.substring(0, _id.indexOf('ClearBtn'));
      $("#" + id).val("");
      this.HideClearBtn();
    },

    ResetCurrentCustomerChanged: function(e) {
      Global.CurrentCustomerChanged = false;
    },

    ProcessCustomer: function(model, type) {
      //this.SetSelectedCustomer(model);
      this.InitializeCustomer(1, model.get("CustomerCode"), type);
    },

    ProcessUpdatedCustomer: function(response) {
      var updatedCustomer = new BaseCollection();
      updatedCustomer.reset(response.Customers);

      this.SetSelectedCustomer(updatedCustomer.at(0), true);
      //this.UpdatePreference(updatedCustomer.at(0));
    },

    ProcessShipTo: function(model) {
      this.InitializeShipTo(1, model.get("ShipToCode"), "update");
      //this.RecalculatePrice();
    },

    ProcessUpdatedShipTo: function(response) {
      var updatedShipTo = new BaseCollection();
      updatedShipTo.reset(response.ShipToCollection);

      this.SetSelectedShipTo(updatedShipTo.at(0));
    },

    RenderNoteListTemplate: function() {
      var _template = _.template(NoteListTemplate);
      if (this.selectedCustomer.get("CustomerName").length > 15) {
        var customerName = this.selectedCustomer.get("CustomerName").substring(0, 14) + "...";
        this.selectedCustomer.set({
          CustomerName: customerName
        });
      }
      $("#headerInfoContainer").prepend(_template(this.selectedCustomer.toJSON()));
      $("#done-customer").text("Detail");
    },

    LoadCustomerNote: function() {
      var self = this;
      var noteCollection = new BaseCollection();
      var noteModel = new BaseModel();

      if (noteCollection._callBacks != null || noteCollection._callBacks != undefined) noteCollection.unbind();
      else {
        noteCollection.on('viewDetail', this.LoadNoteDetail, this);
        noteCollection.on('removeNote', this.RemoveNote, this);
      }

      noteModel.set({
        CustomerCode: this.selectedCustomer.get("CustomerCode"),
        CriteriaString: this.criteria
      });

      noteModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.LOADCUSTOMERNOTELOOKUP;
      noteModel.save(noteModel, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.RenderNoteList(noteCollection, response);
          self.criteria = "";
        }
      });
    },

    RenderNoteList: function(collection, response) {

      var notesView = new NotesListView({
        el: $("#noteList-content"),
        collection: collection
      });

      collection.reset(response.OrderNotes);
      $("#customer").hide();
    },

    ReloadCustomer: function(e) {
      e.preventDefault();
      $("#noteList").remove();
      $("#customer").show();
    },

    LoadNoteDetail: function(model) {
      this.trigger("customernotes", Global.NoteType.Customer, model.set({
        CustomerName: this.selectedCustomer.get("CustomerName")
      }), Global.MaintenanceType.UPDATE);
    },

    ShowOrderNotesForm: function() {
      this.trigger("customernotes", Global.NoteType.Customer, this.selectedCustomer, Global.MaintenanceType.CREATE);
    },

    ReloadNote: function() {
      $("#noteList").remove();
      this.ShowCustomerNoteList();
    },

    RemoveNote: function(model) {
      this.trigger("removeNote", Global.NoteType.Customer, model.set({
        CustomerName: this.selectedCustomer.get("CustomerName")
      }), Global.MaintenanceType.DELETE);
    }

  });
  return HeaderInfoView;
});
