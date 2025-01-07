/**
 * Connected Business | 06-19-2012
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
  'collection/base',
  'collection/workstations',
  'collection/localpreferences',
  'collection/invoices',
  'collection/payments',
  'collection/reportsettings',
  'model/lookupcriteria',
  'model/workstation',
  'model/print',
  'model/base',
  'model/reportsetting',
  'view/25.0.0/pos/pos',
  'view/25.0.0/settings/general/general',
  'view/25.0.0/settings/category/categories',
  'view/25.0.0/settings/receipt/receipt',
  'view/25.0.0/settings/reason/reason',
  'view/25.0.0/settings/discount/discount',
  'view/25.0.0/settings/signature/signature',
  'view/25.0.0/settings/manager/managerpage',
  'view/25.0.0/settings/misc/misc',
  'view/25.0.0/settings/payment/payment',
  'view/25.0.0/settings/user/user',
  'view/25.0.0/settings/dejavoo/dejavoo',
  'view/25.0.0/pos/drawerbalance/closingamount',
  'view/25.0.0/pos/print/printpreview',
  'view/25.0.0/pos/print/dynamicprint',
  'view/25.0.0/pos/print/printer',
  'text!template/25.0.0/settings/settings.tpl.html',
  'view/spinner',
], function($, $$, _, Backbone, Global, Method, Service, Shared,
  BaseCollection, WorkstationCollection, LocalPreferenceCollection, InvoiceCollection, PaymentCollection, ReportSettingCollection,
  LookupCriteriaModel, WorkstationModel, PrintModel, BaseModel, ReportSettingModel,
  MainView, GeneralSettingsView, CategorySettingsView, ReceiptSettingsView, ReasonSettingsView, DiscountSettingsView, SignatureSettingsView,
  ManagerSettingsView, MiscSettingsView, PaymentGatewaySettingsView, UserSettingsView, DejavooSettingsView,
  ClosingAmountView, PrintPreviewView, DynamicPrintPreview, PrinterView,
  template, Spinner) {
  var _this = null;
  var SettingsView = Backbone.View.extend({
    _template: _.template(template),
    _page: 'pos',
    events: {
      "tap #general-settings": "InitializeGeneralSettings",
      "tap #category-settings": "InitializeCategorySettings",
      "tap #creditcard-settings": "InitializeCreditCardSettings",
      "tap #discount-settings": "InitializeDiscountSettings",
      "tap #dejavoo-settings": "InitializeDejavooSettings",
      "tap #receipt-settings": "InitializeReceiptSettings",
      "tap #override-settings": "InitializeOverrideSettings",
      "tap #reason-settings": "InitializeReasonSettings",
      "tap #signature-settings": "InitializeSignatureSettings",
      "tap #misc-settings": "InitializeMiscSettings",
      "tap #user-settings": "InitializeUserSettings",

      "tap #back-main": "BackToMain",
      "tap #back-general": "BackToGeneral",
      "tap #add-workstation-btn": "AddWorkstationTapped",
      "tap #add-user-btn": "AddUserTapped",

      "keyup #settings-default-customer": "keyupCustomer",
      "keyup #settings-workstation-input": "keyupWorkstation",
      "keyup #settings-default-location": "keyupLocation",
      "keyup #search-user": "keyupUser",

      "keyup #search-report": "keyupReport",
      "tap .clearTextBtn": "ClearText",
      "blur #settings-workstation-input": "HideClearBtn",
      "keypress #settings-workstation-input": "WorkStation_OnKeypress"

    },

    InitializeChildViews: function() {
      console.log("SettingsViewVersion:" + " 13.2.1");
      this.InitializeFirstPage(); //temporary
      this.InitializeLocalPreference();
      this.$("#settings-page").trigger("create");

      navigator.notification.overrideAlert(true); //Notification
    },

    render: function() {
      this._BackToMain = false;
      Global.BackToMain = false;
      this.$el.html(this._template);
      return this;
    },

    keyupWorkstation: function(e) {
      this.ShowClearBtn(e);
      if (e.keyCode === 13) {
        this.InitializeWorkstationCheck();
      }
      return;
    },

    keyupCustomer: function(e) {
      this.ShowClearBtn(e);
      if (e.keyCode === 13) {
        this.InitializeCustomerSearch();
      }
    },

    keyupLocation: function(e) {
      if (e.keyCode === 13) {
        this.InitializeLocationSearch();
      }
    },

    keyupUser: function(e) {
      this.ShowClearBtn(e);
      if (e.keyCode === 13) {
        this.InitializeUserSearch();
      }
    },

    keyupReport: function(e) {
      this.DisplayClearBtn(e);
      if (e.keyCode === 13) {
        this.InitializeReportSearch();
      }
    },

    InitializeFirstPage: function() {
      this.ToggleSettingsDisplay("General");
      // this.$("#back-general").hide();
      if (this.generalSettingsView) {
        this.generalSettingsView.render();
      } else {
        // #left-pane-content to be changed with #settings-main-content?? - pao
        this.generalSettingsView = new GeneralSettingsView({
          el: $("#settings-main-content"),
        });
        this.generalSettingsView.on("SaveCompleted", this.SaveCompleted, this);
        this.generalSettingsView.on("forceUserToSetPrinter", this.ForceUserToSetPrinter, this);
        this.generalSettingsView.on("showClosingAmount", this.ShowClosingAmount, this);
        this.generalSettingsView.render();
      }

      if (!Global._UserIsAdmin && Global._HasAdmins) {
        $('#left-pane-content').find('li').addClass('ui-disabled');
        $('#left-pane-content').find('li#general-settings').removeClass('ui-disabled');
      }
    },

    InitializeWorkstationCheck: function() {
      var _id = $("#settings-workstation-input").val();
      this.generalSettingsView.trigger('SearchWorkstation', _id, this);
      $("#settings-workstation-input").blur();
    },

    InitializeCustomerSearch: function() {
      var _criteria = $("#settings-default-customer").val();
      this.generalSettingsView.trigger('CustomerLookup', _criteria, this);
      $("#settings-default-customer").val("").blur();
    },

    InitializeLocationSearch: function() {
      var _criteria = $("#settings-default-location").val();
      this.generalSettingsView.trigger('LocationLookup', _criteria, this);
      $("#settings-default-location").val("").blur();
    },

    InitializeUserSearch: function() {
      var _criteria = $("#search-user").val();
      this.userSettingsView.trigger('searchUser', _criteria, this);
      $("#search-user").val("").blur();
    },


    InitializeReportSearch: function() {
      console.log('InitializeReportSearch');
      var _criteria = $("#search-report").val();
      this.receiptSettingsView.trigger('ReportLookup', _criteria, this);
      $("#search-report").val("").blur();
    },

    //method that displays clear button.
    DisplayClearBtn: function(e) {
      e.stopPropagation();
      var _id = e.target.id;
      var _val = $("#" + _id).val();
      var _strLength = _val.length;
      var _pos = $("#" + _id).position(); // retrieves the position of the given element
      var _width = $("#" + _id).width();

      if (_strLength <= 0) {
        this.HideClearBtn();
      } else {
        if (_pos !== null || _pos !== "") {
          $("#" + _id + "ClearBtn").css({
            top: (_pos.top + 7),
            left: (_width - 2)
          });
        }
        $("#" + _id + "ClearBtn").show();
      }
    },

    ShowClearBtn: function(e) {
      e.stopPropagation();
      var _id = e.target.id;
      var _val = $("#" + _id).val();
      var _strLength = _val.length;
      var _pos = $("#" + _id).position(); // retrieves the position of the given element
      var _width = $("#" + _id).width();

      if (_strLength <= 0) {
        this.HideClearBtn();
      } else {
        var _left = '646px'
        if (e.target.id == "settings-workstation-input") _left = '512px';
        else if (e.target.id == "settings-default-customer") _left = '550px';
        else if (e.target.id == "search-user") _left = '805px';

        _style = {
          top: (_pos.top + 8),
          left: _left
        };

        if (_pos !== null || _pos !== "") {
          $("#" + _id + "ClearBtn").css(_style)
            //$("#"+_id+"ClearBtn").css({top: (_pos.top + 8), left: '586px'});
        }
        $("#" + _id + "ClearBtn").show();
      }
    },

    HideClearBtn: function() {
      $(".clearTextBtn").fadeOut();
    },

    ClearText: function(e) {
      var _id = e.target.id;
      var id = _id.substring(0, _id.indexOf('ClearBtn'));
      $("#" + id).val("");
      $(".clearTextBtn").hide();
    },

    InitializeGeneralSettings: function() {
      this.SelectedPage = "General";
      this.Save();
    },

    InitializeCategorySettings: function() {
      this.SelectedPage = "Category";
      this.Save();
    },

    InitializeCreditCardSettings: function() {
      this.SelectedPage = "Credit Card";
      this.Save();
    },

    InitializeDiscountSettings: function() {
      this.SelectedPage = "Discount";
      this.Save();
    },

    InitializeReceiptSettings: function() {
      this.SelectedPage = "Receipt";
      this.Save();
    },

    InitializeUserSettings: function() {
      this.SelectedPage = "User";
      this.Save();
    },

    InitializeOverrideSettings: function() {
      this.SelectedPage = "Manager Override";
      this.Save();
    },

    InitializeReasonSettings: function() {
      this.SelectedPage = "Reason";
      this.Save();
    },

    InitializeSignatureSettings: function() {
      this.SelectedPage = "Signature";
      this.Save();
    },

    InitializeMiscSettings: function() {
      this.SelectedPage = "Miscellaneous";
      this.Save();
    },

    InitializeDejavooSettings: function() {
      this.SelectedPage = "Dejavoo";
      this.Save();
    },

    ToggleSettingsDisplay: function(type) {
      this.PreviousPage = type;

      $("#settings-title").text(type);
      $("#settings-left-pane ul li").removeClass("selected-category");
      $("#right-pane-content").empty();
      $("#right-pane-content").html('');
      // this.removeAndHide();
      switch (type) {
        case "General":
          //$("#general-settings").addClass("selected-category");
          this.ChangeDisplayTab('#general-settings');
          this.SelectedSettingPage("General");
          break
        case "Category":
          this.ChangeDisplayTab('#category-settings');
          //$("#category-settings").addClass("selected-category");
          break;
        case "Reason":
          this.ChangeDisplayTab('#reason-settings');
          $("#settings-title").text(type + " Code");
          //$("#reason-settings").addClass("selected-category");
          break;
        case "Receipt":
          this.ChangeDisplayTab('#receipt-settings');
          //$("#receipt-settings").addClass("selected-category");
          break;
        case "Discount":
          this.ChangeDisplayTab('#discount-settings');
          //$("#discount-settings").addClass("selected-category");
          break;
        case "Signature":
          this.ChangeDisplayTab('#signature-settings');
          //$("#signature-settings").addClass("selected-category");
          break;
        case "Manager Override":
          this.ChangeDisplayTab('#override-settings');
          //$("#override-settings").addClass("selected-category");
          break;
        case "Miscellaneous":
          //$("#misc-settings").addClass("selected-category");
          break;
        case "User":
          this.ChangeDisplayTab('#user-settings');
          //$("#user-settings").addClass("selected-category");
          break;
        case "Dejavoo":
          this.ChangeDisplayTab('#dejavoo-settings');
          break;
      }
      this.DisableButton();
    },

    BackToMain: function(e) {
      e.preventDefault();
      Global.BackToMain = true;
      this._BackToMain = true;
      this.Save();
    },

    BackToGeneral: function(e) {
      e.preventDefault();
      Shared.FixRightPanelPadding();
      Global.BackToGeneralTriggered = true;
      switch (this.PreviousPage) {
        case "General":
          this.generalSettingsView.ReinitializeGeneralDisplay();
          //this.InitializeGeneralSettings();
          break;
        case "Manager Override":
          this.InitializeOverrideSettings();
          break;
        case "Receipt":
          this.InitializeReceiptSettings();
          break;
        case "User":
          this.InitializeUserSettings();
          break;

      }
    },

    removeAndHide: function() {
      $("#settings-customer-search").remove();
      $("#settings-workstation-container").remove();
      $("#settings-location-search").remove();
      $("#settings-user-container").remove();
      $("#settings-user-container").remove();
      $("#settings-report-search").remove();
      $("#settings-salesexempttaxcode-search").remove();
      $("#back-general").hide();
    },

    DisableButton: function() {
      $("#left-pane-content ul>li").removeClass('setting-category-disable'); //remove class
      $("#left-pane-content ul>li").each(function(index, elem) {
        if ($(elem).hasClass('selected-category')) {
          //$(elem).addClass('setting-category-disable');
        }
      });
    },

    DisposeViews: function() {
      this.undelegateEvents();
    },

    SelectedSettingPage: function(selectedPage) {
      $("#general-settings").removeClass('active');
      $("#category-settings").removeClass('active');
      $("#creditcard-settings").removeClass('active');
      $("#discount-settings").removeClass('active');
      $("#override-settings").removeClass('active');
      $("#reason-settings").removeClass('active');
      $("#receipt-settings").removeClass('active');
      $("#signature-settings").removeClass('active');
      $("#user-settings").removeClass('active');
      $("#dejavoo-settings").removeClass('active');
      switch (selectedPage) {
        case "General":
          $("#general-settings").addClass('active')
          break;
        case "Category":
          $("#category-settings").addClass('active')
          break;
        case "Credit Card":
          $("#creditcard-settings").addClass('active')
          break;
        case "Discount":
          $("#discount-settings").addClass('active')
          break;
        case "Manager Override":
          $("#override-settings").addClass('active')
          break;
        case "Reason":
          $("#reason-settings").addClass('active')
          break;
        case "Manager Override":
          $("#override-settings").addClass('active')
          break;
        case "Reason":
          $("#reason-settings").addClass('active')
          break;
        case "Dejavoo":
          $("#dejavoo-settings").addClass('active')
          break;
        case "Receipt":
          $("#receipt-settings").addClass('active')
          break;
        case "Signature":
          $("#signature-settings").addClass('active')
          break;
        case "User":
          $("#user-settings").addClass('active')
          break

      }
      if (!Global._UserIsCS) {
        $("#creditcard-settings").css("display", "none");
        $("#user-settings").css("display", "none");
      }
    },

    GetPreviousPage: function() {
      if (!this.generalSettingsView.isValid) {
        this._page = 'settings';
      } else if (Global.PreviousPage === "dashboard") {
        this._page = 'dashboard';
        Global.PreviousPage = "";
      } else if (Global.ApplicationType === "Kiosk") {
        this._page = 'kiosk';
      } else if (Global.ApplicationType === "Settings") {
        this._page = 'dashboard';
      } else if (Global.ApplicationType === "Secondary") {
        this._page = 'secondary';
      } else if (Global.ApplicationType === "Products") {
        this._page = 'products';
      } else if (Global.ApplicationType === "Customers") {
        this._page = 'customers';
      } else if (Global.ApplicationType === "Reports") {
        this._page = 'reports';
      } else if (Global.ApplicationType === "POS") {
        this._page = 'pos';
      }
    },

    Save: function(allowToProceed) {
      if (!allowToProceed)
        if (!this.AllowToSwitchPreference()) return;

      switch (this.PreviousPage) {
        case "General":
          if (this.generalSettingsView) {
            this.generalSettingsView.isValid = true;
            this.generalSettingsView.Save();
            this.GetPreviousPage();
          }
          break;
        case "Category":
          if (this.categorySettingsView) {
            this.categorySettingsView.Save();
          }
          break;
        case "Credit Card":
          if (this.paymentGatewaySettingsView) {
            this.paymentGatewaySettingsView.Save();
          }
          break;
        case "Discount":
          if (this.discountSettingsView) {
            this.discountSettingsView.Save();
          }
          break;
        case "Manager Override":
          if (this.managerSettingsView) {
            this.managerSettingsView.Save();
          }
          break;
        case "Reason":
          if (this.reasonSettingsView) {
            this.reasonSettingsView.Save();
          }
          break;
        case "Dejavoo":
          if (this.dejavooSettingsView) {
            this.dejavooSettingsView.Save();
          }
          break;
        case "Receipt":
          if (this.receiptSettingsView) {
            if (this._BackToMain) this.receiptSettingsView.backToMain = this._BackToMain;
            this.receiptSettingsView.AllowSilentSave = false;
            this.receiptSettingsView.Save();

          }
          break;
        case "Signature":
          if (this.signatureSettingsView) {
            this.signatureSettingsView.Save();
          }
          break;
        case "Miscellaneous":
          if (this.miscSettingsView) {
            this.miscSettingsView.Save();
          }
          break;
        case "User":
          if (this.userSettingsView) {
            this.userSettingsView.Save();
          }
          break;
      }
    },

    SaveCompleted: function() {
      this._BackToMain = Global.BackToMain;
      if (Global.isBrowserMode) Shared.FixRightPanelPadding();
      if (this._BackToMain) {
        if (this._page === 'pos') {
          window.location.hash = this._page;
          this.DisposeViews();
        } else {
          this.GetPreviousPage();
          window.location.hash = this._page;
        }
        return;
      }

      this.SelectedSettingPage(this.SelectedPage)
      switch (this.SelectedPage) {
        case "General":
          this.ToggleSettingsDisplay("General");
          // this.$("#back-general").hide();
          if (this.generalSettingsView) {
            this.generalSettingsView.render();
          } else {
            this.generalSettingsView = new GeneralSettingsView({
              el: $("#settings-main-content"),
            });
            this.generalSettingsView.on("SaveCompleted", this.SaveCompleted, this);
            this.generalSettingsView.on("showClosingAmount", this.ShowClosingAmount, this);
            this.generalSettingsView.render();
          }
          break;
        case "Category":
          if (this.generalSettingsView.isValid) {
            this.ToggleSettingsDisplay("Category");
            if (this.categorySettingsView) {
              this.categorySettingsView.render();
            } else {
              this.categorySettingsView = new CategorySettingsView({
                el: $("#settings-main-content")
              });
              this.categorySettingsView.on("SaveCompleted", this.SaveCompleted, this);
            }
          }
          break;
        case "Credit Card":
          if (this.generalSettingsView.isValid) {
            this.ToggleSettingsDisplay("Credit Card");
            if (this.paymentGatewaySettingsView) {
              this.paymentGatewaySettingsView.render();
            } else {
              this.paymentGatewaySettingsView = new PaymentGatewaySettingsView({
                el: $("#settings-main-content")
              });
              this.paymentGatewaySettingsView.on("SaveCompleted", this.SaveCompleted, this);
              this.paymentGatewaySettingsView.on('deviceChanged', this.DeviceChanged, this);
            }
          }
          break;
        case "Discount":
          if (this.generalSettingsView.isValid) {
            this.ToggleSettingsDisplay("Discount");
            if (this.discountSettingsView) {
              this.discountSettingsView.render();
            } else {
              this.discountSettingsView = new DiscountSettingsView({
                el: $("#settings-main-content")
              });
              this.discountSettingsView.on("SaveCompleted", this.SaveCompleted, this);
            }
          }
          break;
        case "Manager Override":
          if (this.generalSettingsView.isValid) {
            this.ToggleSettingsDisplay("Manager Override");
            // this.$("#back-general").hide();
            if (this.managerSettingsView) {
              this.managerSettingsView.render();
            } else {
              this.managerSettingsView = new ManagerSettingsView({
                el: $("#settings-main-content")
              });
              this.managerSettingsView.on("SaveCompleted", this.SaveCompleted, this);
            }
          }
          break;
        case "Reason":
          if (this.generalSettingsView.isValid) {
            this.ToggleSettingsDisplay("Reason");
            if (this.reasonSettingsView) {
              this.reasonSettingsView.render();
            } else {
              this.reasonSettingsView = new ReasonSettingsView({
                el: $("#settings-main-content")
              });
              this.reasonSettingsView.on("SaveCompleted", this.SaveCompleted, this);
            }
          }
          break;
        case "Dejavoo":
          if (this.generalSettingsView.isValid) {
            this.ToggleSettingsDisplay("Dejavoo");
            if (this.dejavooSettingsView) {
              this.dejavooSettingsView.render();
            } else {
              this.dejavooSettingsView = new DejavooSettingsView({
                el: $("#settings-main-content")
              });
              this.dejavooSettingsView.on("SaveCompleted", this.SaveCompleted, this);
            }
          }
          break;
        case "Receipt":
          if (this.generalSettingsView.isValid) {
            this.ToggleSettingsDisplay("Receipt");
            if (this.receiptSettingsView) {
              this.receiptSettingsView.render();
            } else {
              this.receiptSettingsView = new ReceiptSettingsView({
                el: $("#settings-main-content")
              });
              this.receiptSettingsView.on("SaveCompleted", this.SaveCompleted, this);
            }
          }
          break;
        case "Signature":
          if (this.generalSettingsView.isValid) {
            this.ToggleSettingsDisplay("Signature");
            if (this.signatureSettingsView) {
              this.signatureSettingsView.render();
            } else {
              this.signatureSettingsView = new SignatureSettingsView({
                el: $("#settings-main-content"),
              });
              this.signatureSettingsView.on("SaveCompleted", this.SaveCompleted, this);
            }
          }
          break;
        case "Miscellaneous":
          if (this.generalSettingsView.isValid) {
            this.ToggleSettingsDisplay("Miscellaneous");
            if (this.miscSettingsView) {
              this.miscSettingsView.render();

            } else {
              this.miscSettingsView = new MiscSettingsView({
                el: $("#settings-main-content"),
              });
              this.miscSettingsView.on("SaveCompleted", this.SaveCompleted, this);
            }
          }
          break;
        case "User":
          if (this.generalSettingsView.isValid) {
            this.ToggleSettingsDisplay("User");
            if (this.userSettingsView) {
              this.userSettingsView.render();
            } else {
              this.userSettingsView = new UserSettingsView({
                el: $("#settings-main-content")
              });
              this.userSettingsView.on("SaveCompleted", this.SaveCompleted, this);
            }
          }
          break;
      }

    },

    Show: function() {
      this.$el.append(this._template);
      $("#customerForm").trigger('create');
      $("#main-transaction-blockoverlay").hide();
    },

    InitializeLocalPreference: function() {
      var self = this;
      this.localpreference = new LocalPreferenceCollection();
      this.localpreference.fetch({
        error: function(collection, error, response) {
          collection.RequestError(error, "Error Retrieving Local Preference");
        }
      });
    },

    AddWorkstationTapped: function(e) {
      e.preventDefault();
      if (!this.workstationCollection) this.FetchAvailableWorkstation();
      var _id = $("#settings-workstation-input").val();
      //this.generalSettingsView.trigger('SearchWorkstation', _id, this);
      if (this.ValidateID(_id)) {
        this.generalSettingsView.trigger('iSaveWorkStationID', _id, this);
        $("#settings-workstation-input").blur();
      }
    },

    WorkStation_OnKeypress: function(e) {
      var alphaNumeric = new RegExp("[a-zA-Z0-9]+$");
      var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
      // 8:backspace, 46:delete , 37:arrowleft, 39:arrowright ,32:space
      var code = e.charchode || e.which || e.keyCode;
      // console.log("KEY PRESS : " + code + "KEY : " + key  + "keycode" + e.keyCode);
      var regularKeys = (code == 8 || (code == 46 && key != '.') || (code == 37 && key != "%") || (code == 39 && key != "'") || code == 32);
      if (!(alphaNumeric.test(key) || regularKeys)) {
        e.preventDefault();
      }
    },

    AddUserTapped: function(e) {
      e.preventDefault();
      this.CheckAvailableLicenseCount();
    },

    CheckAvailableLicenseCount: function() {
      var _self = this;
      _self.ProdceedToAddUserAction();

      return;
      //NOTE: Allow creation of new user account regardless of available licences.
      //OLD CODES
      var _mdl = new BaseModel();
      _mdl.url = Global.ServiceUrl + Service.POS + Method.GETAVAILABLELICENSECOUNT + Global.ProductType
      _mdl.fetch({
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (response.ErrorMessage) {
            _self.NotifyMsg(response.ErrorMessage, "Error fetching available license");
            return;
          }
          if (response.Value <= 0) {
            _self.NotifyMsg("There is no available user license left for Connected Sale.", "Invalid Action");
            return;
          }
          _self.ProdceedToAddUserAction();
        },
        error: function(model, error, option) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Fetching available license");
        }
      })
    },

    ProdceedToAddUserAction: function() {
      // this.removeAndHide();
      this.$("#back-general").show();
      this.userSettingsView.trigger('addNewUserView', this);
    },

    FetchAvailableWorkstation: function() {
      this.workstationCollection = new WorkstationCollection();
      var self = this;
      var _criteria = "";
      var _preference = new LookupCriteriaModel();
      var _rowsToSelect = 100;

      _preference.set({
        StringValue: _criteria
      })

      _preference.url = Global.ServiceUrl + Service.POS + Method.PREFERENCELOOKUP + _rowsToSelect;
      _preference.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.FillWorkStationCollection(response.Preferences);
        }
      });

    },

    FillWorkStationCollection: function(collection) {
      this.workstationCollection.reset(collection);
    },

    ValidateID: function(_workstationID) {
      var _id = _workstationID.trim();
      //var _model = new LookupCriteriaModel();

      //for null id..
      if (_id === "") {
        //this.NotifyMsg("Empty");
        return false;
      }
      if (!this.workstationCollection) {
        this.FetchAvailableWorkstation();
      }
      //validation for duplicate id..
      for (var i = 0; i < this.workstationCollection.length; i++) {
        if (_id === this.workstationCollection.at(i).get("WorkstationID")) {
          this.NotifyMsg("Duplicate");
          return false;
        }
      }

      return true;
    },

    NotifyMsg: function(msg, header) {
      var _content, _header;
      switch (msg) {
        case "Empty":
          _content = "Cannot add an empty Worksation ID."
          _header = "Workstation ID is Required"
          break;
        case "Duplicate":
          _content = "Workstation ID already exists!"
          _header = "Error Saving"
          break;
        default:
          _content = msg;
          _header = header;
      }
      navigator.notification.alert(_content, null, _header, "OK");
    },

    ShowClosingAmount: function(model) {
      var allowCancel = false;
      if (!this.closingAmountView) {
        this.closingAmountView = new ClosingAmountView({
          el: $("#closingAmountContainer"),
          AllowCancel: allowCancel
        });
        this.closingAmountView.on("SaveAmount", this.CloseWorkstation, this);
      } else {
        this.closingAmountView.Show(allowCancel);
      }
      $("#settings-blockoverlay").show();
    },

    CloseWorkstation: function(closeAmount) {
      var _self = this;
      var workstationID = Global.POSWorkstationID;
      var status = Global.Status;
      status.CloseAmount = closeAmount;
      //status.IsOpen = false;

      if (workstationID === "" || workstationID === null) {
        console.log("Workstation ID is required to close workstation.");
        navigator.notification.alert("Workstation ID is required to close workstation.", null, "Workstation ID is Required", "OK");
      }

      var workstationModel = new WorkstationModel(status);
      workstationModel.url = Global.ServiceUrl + Service.POS + Method.CLOSEWORKSTATION + Global.POSWorkstationID;
      workstationModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.CloseWorkstationCompleted(model, response);
          console.log("CloseWorkstation");
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Closing Workstation");
        }
      });
    },

    CloseWorkstationCompleted: function(model, response) {
      if (response != null) {
        var adminRole = Global.AdministratorRole;
        this.PrintWorkstationReport(model, false);
      }
    },

    ProcessLogout: function() {
      this.LockTransactionScreen(true, "Logging Out...");
      var _model = new BaseModel();
      var self = this;
      _model.url = Global.ServiceUrl + Service.POS + Method.SIGNOUT;
      _model.save(null, {
        success: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.LockTransactionScreen(false, "", false);
          var _url = window.location.href.split('#')[0];
          _url = _url + "#login";
          window.location.href = _url;
        },
        error: function(model, error) {
          self.LockTransactionScreen(false, "", false);
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Logging out");
        }
      });
    },

    PrintWorkstationReport: function(StatusModel, isXtape) {
      var _self = this;
      //this.InitializePrintModel();
      isClosedWorkstation = true;
      this.reportType = "LastZtape";
      this.openDate = "";
      this.closeDate = "";

      var myDate = new Date();
      var displayDate = (myDate.getMonth() + 1) + (myDate.getDate()) + myDate.getFullYear() + myDate.getHours() + myDate.getMinutes() + myDate.getSeconds();
      this.GenerateReport(this.reportType, "z-tape-" + Global.Preference.WorkstationID + "-" + displayDate);
      return;

      //remove below
      if (Global.PrintOptions.CustomizePrint) {
        var myDate = new Date();
        var displayDate = (myDate.getMonth() + 1) + (myDate.getDate()) + myDate.getFullYear() + myDate.getHours() + myDate.getMinutes() + myDate.getSeconds();
        this.GenerateReport(this.reportType, "z-tape-" + Global.Preference.WorkstationID + "-" + displayDate);
      } else {
        var _query = "?workstationId=" + StatusModel.get("WorkstationID") + "&openDate=" + StatusModel.get("OpenDate") + "&endDate=" + StatusModel.get("CloseDate") + "&isXtape=" + isXtape;
        this.printModel.url = Global.ServiceUrl + Service.SOP + Method.GETPOSSTATUSREPORT + _query;
        this.printModel.save(this.transactionModel, {
          timeout: 0
        });
      }
    },


    ProcessPrintPreview: function(pages, code, isWorkstation) {

      if (!this.receiptPrint) {
        this.receiptPrint = new PrinterView({
          el: this.$el
        });
        this.receiptPrint.on("SignOut", this.ProcessLogout, this);
      }
      this.receiptPrint.ProcessPrinting(pages, code, isWorkstation);
      this.LockTransactionScreen(false, "", true);
    },

    InitializeReportSettingsModel: function() {
      if (!this.printreportSettingModel) {
        this.printreportSettingModel = new ReportSettingModel();
        this.printreportSettingModel.on('sync', this.PrintReportComplete, this);
        this.printreportSettingModel.on('error', this.PrintReportFailed, this);
      }
      return this.printreportSettingModel;
    },

    //Receiver of the Received data from the Server
    PrintReportComplete: function(model, response, options) { //xyxy
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();

      if (Global.Preference.IsAirprint) this.PrintDynamicReceipt(response, this._transactionCode, this._reportCode);
      else this.PrintDynamicReceipt(response, this._transactionCode, this._reportCode, true, this._isWorkstation); //this.ProcessPrintPreview(response, this._transactionCode, this._isWorkstation);
    },

    GenerateReport: function(type, transactionCode) {
      this.LockTransactionScreen(true, "Loading...");
      var preference = Global.Preference;
      var reportService = Global.ServiceUrl + "ReportService.svc";
      var serviceContentUri = Global.ServiceUrl + Service.POS + Method.EXPORTREPORT;
      var reportCode = preference.ZTapeReportCode;
      var isXtape = false,
        isZtape = true;
      var transactionType = "Sale";
      var documentCodeName = "";
      var self = this;

      var isSilentPrint = ((Global.Preference.AutoPrintReceipt && Global.PrintOptions.SilentPrint) || Global.PrintOptions.SilentPrint);
      if (!isSilentPrint) {
        if (Global.isBrowserMode) serviceContentUri = Global.ServiceUrl + Service.POS + Method.SAVEREPORT
      }

      var _parameters = this.CreateReportSettingParameters(transactionCode, documentCodeName, type, isXtape, isZtape, transactionType);

      var _model = this.InitializeReportSettingsModel();
      var onSuccess = function(collection) {
        Shared.Reporting.AssignWorkstationID(_parameters, collection);
        _model.set({
          ServiceUri: reportService,
          ServiceContentUri: serviceContentUri,
          ReportName: reportCode,
          UserName: Global.Username,
          Password: Global.Password,
          Parameters: _parameters,
          IsEmail: Global.PrintOptions.EmailReceipt,
          IsAirPrint: preference.IsAirprint,
          RecipientEmailAddress: Global.PrintOptions.EmailAddress,
          IsBrowserMode: Global.isBrowserMode,
          ReportFileName: transactionCode
        });

        self.reportCodeModel = transactionCode;

        self._transactionCode = transactionCode;
        self._isWorkstation = (isXtape || isZtape);
        self._reportCode = reportCode;


        _model.url = serviceContentUri;
        _model.save({
          timeout: 180000
        });
      }
      Shared.Reporting.GetReportCriterias(onSuccess, "", reportCode);
    },

    CreateReportSettingParameters: function(transactionCode, documentCodeName, type, isXtape, isZtape, transactionType) //jj 1-30
      {
        var _parameters = new ReportSettingCollection();
        var _receiptCodes = "";
        var _openDate = "",
          _closeDate = "";
        if (isXtape === true || isZtape === true) {
          if (isZtape === true) {
            _openDate = this.openDate;
            _closeDate = this.closeDate;
          }
        } else {
          _receiptCodes = this.receiptCodes;
        }

        _parameters.add([{
          Name: "TransactionType",
          Value: transactionType
        }, {
          Name: "CreditCardReportCode",
          Value: ""
        }, {
          Name: "IsSinglePageTransactionReceipt",
          Value: true
        }, {
          Name: "DocumentCode",
          Value: documentCodeName
        }, {
          Name: "TransactionCode",
          Value: transactionCode
        }, {
          Name: "IsXTapeReport",
          Value: isXtape
        }, {
          Name: "IsZTapeReport",
          Value: isZtape
        }, {
          Name: "ReceiptCodes",
          Value: _receiptCodes
        }]);
        _parameters = this.CreateZtapeParameters(type, _parameters, _openDate, _closeDate);

        return _parameters;
      },

    CreateZtapeParameters: function(type, parameters, openDate, closeDate) {
      var _parameters = parameters;
      var _openDate = openDate;
      var _closeDate = closeDate;
      switch (type) {
        case "SpecificZtape":
          _parameters.add([{
            Name: "OpenDateStart",
            Value: _openDate
          }, ]);
          break;
        case "DateZtape":
          _parameters.add([{
            Name: "OpenDateStart",
            Value: _openDate
          }, {
            Name: "OpenDateEnd",
            Value: _closeDate
          }, ]);
          break;
      }
      return _parameters;
    },

    PrintDynamicReceipt: function(pages, transactionCode, reportType, isReceiptPrinter, isWorkStation) {
      $("#printPreviewContainer").html('<div></div>');
      this.dynamicPrintView = new DynamicPrintPreview({
        el: $("#printPreviewContainer div"),
        model: transactionCode,
        reportType: reportType
      });

      this.dynamicPrintView.IsReceiptPrinter = isReceiptPrinter || false;
      this.dynamicPrintView.IsWorkStation = isWorkStation || false;
      if (isClosedWorkstation) this.dynamicPrintView.on('formclosed', this.ProcessLogout, this);
      this.dynamicPrintView.on('AutoSignOut', this.ProcessLogout, this);
      //this.HideActivityIndicator();
      this.LockTransactionScreen(false, "", true);
      this.dynamicPrintView.Show(pages);

    },


    LockTransactionScreen: function(lock, message, dontHideOverlay) {
      switch (lock) {
        case true:
          $("#settings-blockoverlay").show();
          target = document.getElementById('settings-page');
          this.ShowActivityIndicator(target);
          $("<h5>" + message + "</h5>").appendTo($("#spin"));
          break;
        default:
          if (!dontHideOverlay) $("#settings-blockoverlay").hide();
          this.HideActivityIndicator();
          break;
      }
    },

    AllowToSwitchPreference: function() {
      _this = this;
      switch (this.PreviousPage) {
        case "User":
          if (!this.userSettingsView.HasChanges) return true;
          var _msg = null;
          if (this.userSettingsView.EditMode) _msg = "Do you want to cancel changes you made?";
          else if (this.userSettingsView.AddMode) _msg = "Do you want to cancel this new user record?";

          navigator.notification.confirm(_msg, (_this.CancelUserChanges), "Confirmation", "Yes,No");
          return false;
          break;
      }
      return true;
    },

    CancelUserChanges: function(cancel) {
      if (cancel == 1) {
        _this.userSettingsView.AddMode = false;
        _this.userSettingsView.EditMode = false;
        _this.userSettingsView.HasChanges = false;
        _this.Save(true);
      } else {
        _this.SelectedPage = "User"
      }
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
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      _spinner = Spinner;
      _spinner.stop();
      $("#spin").remove();
    },

    RemoveScreenOverLay: function() {
      $("#settings-blockoverlay").hide();
    },

    ForceUserToSetPrinter: function() {
      this.ToggleSettingsDisplay("Receipt");
      if (this.receiptSettingsView) {
        this.receiptSettingsView.render();
      } else {
        this.receiptSettingsView = new ReceiptSettingsView({
          el: $("#right-pane-content")
        });
        this.receiptSettingsView.on("SaveCompleted", this.SaveCompleted, this);
      }
    },

    ChangeDisplayTab: function(tabID){
      $(".setting-item-list .settings-item-tab-active").addClass("settings-item-tab");
      $(".setting-item-list .settings-item-tab").removeClass("settings-item-tab-active");
      $(tabID).addClass("settings-item-tab-active");
      $(tabID).removeClass("settings-item-tab");
    }

  });

  return SettingsView;
});
