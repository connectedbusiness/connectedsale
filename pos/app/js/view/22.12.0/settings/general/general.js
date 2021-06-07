/**
 * Connected Business | 06-19-2012
 * Required: collection
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'base64',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'model/lookupcriteria',
  'model/preference',
  'model/website',
  'collection/base',
  'collection/websites',
  'collection/customers',
  'collection/categories',
  'collection/locations',
  'collection/shippingMethods',
  'collection/merchant',
  'collection/paymenttype',
  'collection/preferences',
  'collection/workstations',
  'collection/userroles',
  'collection/localpreferences',
  'view/22.12.0/settings/modal/modal',
  'view/22.12.0/settings/general/imagesize/imagesize',
  'view/22.12.0/settings/general/website/websitelist',
  'view/22.12.0/settings/general/customer/customers',
  'view/22.12.0/settings/general/taxscheme/taxschemes',
  'view/22.12.0/settings/general/location/locations',
  'view/22.12.0/settings/general/gateway/gateways',
  'view/22.12.0/settings/general/paymenttype/paymenttypes',
  'view/22.12.0/settings/general/workstation/workstations',
  'view/22.12.0/settings/general/kiosk/kiosk',
  'view/22.12.0/settings/general/pos/pos',
  'view/22.12.0/settings/general/email/email',
  'text!template/22.12.0/settings/general/generalpage.tpl.html',
  'text!template/22.12.0/settings/general/email/defaultmessage.tpl.html',
  'js/libs/ui.checkswitch.min.js',
  'js/libs/iscroll.js',
], function($, $$, _, Backbone, base64, Global, Service, Method, Shared, BaseModel, LookupCriteriaModel, PreferenceModel, WebsiteModel,
  BaseCollection, WebsiteCollection, CustomerCollection, CategoryCollection, LocationCollection, ShippingMethodCollection, GatewayCollection, PaymentTypeCollection, PreferenceCollection, WorkstationCollection, UserRoleCollection, LocalPreferenceCollection,
  SettingsModal, ImageSizePreference, WebsiteListPreference, CustomersPreference, TaxSchemePreference, LocationsPreference,GatewaysPreference, PaymentTypesPreference, WorkstationsPreference, KioskPreference, POSPreference, EmailPreference,
  template, DefaultMessageTemplate) {
  var allowSales, allowQuotes, allowOrders, allowReturns, _type = "",
    _model, criteria = "",
    _workstation, _workstationValue, _this;

  var GeneralSettingsView = Backbone.View.extend({
    _template: _.template(template),
    _defaultMessageTemplate: _.template(DefaultMessageTemplate),
    isValid: true,
    isReceiptInvalid: false,
    events: {
      "tap #customer-preference-btn": "buttonCustomerPreference_tap",
      "tap #location-preference-btn": "buttonLocationPreference_tap",
      "tap #shippingmethod-preference-btn": "buttonShippingMethodPreference_tap",
      "tap #gateway-preference-btn": "buttonGatewayPreference_tap",
      "tap #paymenttype-preference-btn": "buttonPaymentTypePreference_tap",
      "tap #workstation-preference-btn": "buttonWorkstationPreference_tap",
      "tap #kiosk-preference-btn": "buttonKioskPreference_tap",
      "tap #pos-preference-btn": "buttonPOSPreference_tap",
      "tap #website-preference-btn": "buttonWebsitePreference_tap",
      "tap #image-size-preference-btn": "buttonImageSizePreference_tap",
      "tap #salestaxexempt-preference-btn": "buttonSalesTaxPreference_tap",
      "tap #email-preference-btn": "buttonEmailPreference_tap",

      "change #OrderExpiration": "OrderExpiration_Change",
      "blur #OrderExpiration": "RevertPreviousValue",
      "focus #OrderExpiration": "SaveAndClearValue",

      "change #NotificationInterval": "NotificationInterval_Change",
      "blur #NotificationInterval": "RevertPreviousValue",
      "focus #NotificationInterval": "SaveAndClearValue",

      "tap #AllowSales, #AllowQuotes, #AllowOrders, #AllowReturns, #AllowChangePrice, #AllowAddCustomer, #AllowChangeClassTemplate, #AllowChangePaymentTerm, #AllowChangeTaxCode, #AllowTaxOnLineItems, #IsUseCustomerShipToPaymentType,#IsUsePOSShippingMethod, #UseForcePayment, #IsDepositPayment, #AutoSignOutUser, #IsOverrideSalesRep, #TaxByLocation, #ShowCouponList, #ShowWholesalePrice, #UseCashDrawer, #IsUseItemDescription, #TrackDrawerBalance, #BlindClose, #IsAllowViewZXTape, #IsUseISEImage, #AskForCustomerPO, #AskForShipDate, #AskForSource, #IsAutoAdjustmentStock, #IsTrackStorePickUp": "Chkbox_click"

    },

    buttonPOSPreference_tap: function(e) {
      e.preventDefault();
      this.UpdateCollection();
      this.InitializePOSDisplay(this.preferenceCollection.at(0));
    },

    buttonKioskPreference_tap: function(e) {
      e.preventDefault();
      this.UpdateCollection();
      this.InitializeKioskDisplay(this.preferenceCollection.at(0));
    },

    buttonCustomerPreference_tap: function(e) {
      e.preventDefault();
      this.UpdateCollection();
      this.FetchCustomer(100, "");
    },

    buttonLocationPreference_tap: function(e) {
      e.preventDefault();
      this.UpdateCollection();
      this.InitializeLocationDisplay(this.locationCollection);
    },

    
    buttonShippingMethodPreference_tap: function(e) {
      e.preventDefault();
      this.UpdateCollection();
      this.InitializeShippingMethodDisplay(this.shippingMethodCollection);
    },

    buttonGatewayPreference_tap: function(e) {
      e.preventDefault();
      this.UpdateCollection();
      this.InitializeGatewayDisplay(this.gatewayCollection);
    },

    buttonPaymentTypePreference_tap: function(e) {
      e.preventDefault();
      this.UpdateCollection();
      this.InitializePaymentTypeDisplay(this.paymentTypeCollection);
    },

    buttonWebsitePreference_tap: function(e) {
      e.preventDefault();
      this.UpdateCollection();
      this.FetchWebsite(100, " ");
    },

    buttonImageSizePreference_tap: function(e) {
      e.preventDefault();
      this.UpdateCollection();
      this.InitializeImageSizeDisplay(this.preferenceCollection.at(0));
    },

    buttonSalesTaxPreference_tap: function(e) {
      e.preventDefault();
      this.UpdateCollection();
      this.FetchTaxSchemes("");
    },

    buttonWorkstationPreference_tap: function(e) {
      e.preventDefault();
      if (!this.IsWebSiteURLSpecified()) return;
      Global.PreviousWorkstationID = this.preferenceCollection.at(0).get("WorkstationID"); // Added by : PR.Ebron 2.7.13 : INTMOBA-670
      this.isWorkstationPage = true;
      if (Global.PreviousWorkstationID !== null) {
        this.preventSaveCompleted = true;
        this.Save();
      }
      Global.BackToGeneralTriggered = false;
      /*this.preventSaveCompleted = true;
			this.Save();*/
      this.FetchWorkstation(100, "");
    },

    buttonEmailPreference_tap: function(e) {
      e.preventDefault();

      var _settings = this.preferenceCollection.at(0);
      if (!_settings.get("WorkstationID")) {
        console.log("WorkstationID must not be null");
        navigator.notification.alert("Please select a Workstation first.", null, "Workstation ID is Required", "OK");
        return;
      }

      this.pickupEmailPreference.set({
        WorkstationID: _settings.get("WorkstationID")
      });

      // this.emailPreference = new EmailPreference({
      //   el: this.$el,
      //   model: this.pickupEmailPreference
      // });

      this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        model: this.pickupEmailPreference,
        preferencetype: "Email"
      });
      this.settingsModal.on('ModalClose', this.RemoveClassOnEmail, this);
    },

    RemoveClassOnEmail: function(){
      $("#settings-modal-container").removeClass("settings-modal-email-template");
    },

    Chkbox_click: function(e){
      e.preventDefault();
      var _elementID = '#' + e.currentTarget.id;
      var _chkState = this.GetCheckState(_elementID);
      this.SetChkState(e.currentTarget.id, !_chkState);
    },

    GetCheckState: function(elementID){
      return $(elementID).hasClass('icon-ok-sign') ? true : false;
    },

    SetChkState: function(setting, isChecked){
    var _self = this;
      // Manage Bindings
          switch (setting) {
            case "AllowSales":
              allowSales = isChecked;
              _self.CheckTransactionState(isChecked, setting);
              break;
            case "AllowQuotes":
              allowQuotes = isChecked;
              _self.CheckTransactionState(isChecked, setting);
              break;
            case "AllowOrders":
              allowOrders = isChecked;
              _self.CheckTransactionState(isChecked, setting);
              break;
            case "AllowReturns":
              allowReturns = isChecked;
              _self.CheckTransactionState(isChecked, setting);
              break;
            case "AllowChangePrice":
              allowChangePrice = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "AllowAddCustomer":
              allowAddCustomer = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "AllowChangeClassTemplate":
              allowChangeClassTemplate = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "AllowChangePaymentTerm":
              allowChangePaymentTerm = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "AllowChangeTaxCode":
              allowChangeTaxCode = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "AllowTaxOnLineItems":
              allowTaxOnLineItems = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "IsDepositPayment":
              isDepositPayment = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "AutoSignOutUser":
              autoSignOutUser = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "IsOverrideSalesRep":
              isOverrideSalesRep = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "TaxByLocation":
              taxByLocation = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "ShowCouponList":
              showCouponList = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "ShowWholesalePrice":
              showWholesalePrice = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "IsUseItemDescription":
              isUseItemDescription = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "AskForCustomerPO":
              askForCustomerPO = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "AskForShipDate":
              askForShipDate = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "AskForSource":
              askForSource = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "IsAutoAdjustmentStock":
              isAutoAdjustmentStock = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "IsTrackStorePickUp":
              trackStorePickUp = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "TrackDrawerBalance":
              trackDrawerBalance = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              Global.trackDrawerBalanceState = isChecked;
              _self.DisableBlindClose();
              _self.trackDrawerBalance_change(isChecked);
              break;
            case "BlindClose":
              if (!trackDrawerBalance) isChecked = false;
              blindClose = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              if (!isChecked) _self.AllowBlindClose();
              else _self.BlindCloseOn();
              break;
            case "IsUseISEImage":
              IsUseISEImage = isChecked;
              Global.IsUseImage = isChecked;
              _self.EnableISEImageSettings(isChecked);
              _self.ToggleCheckbox(setting, isChecked);
              break;
            case "IsUseCustomerShipToPaymentType":
              isUseCustomerShipToPaymentType = isChecked;
              _self.isUseCustomerShipToPaymentType_change(isChecked);
              _self.ToggleCheckbox(setting, isChecked);
                break;
            case "IsUsePOSShippingMethod":
                 isUsePOSShippingMethod = isChecked;
                _self.isUsePOSShippingMethod_change(isChecked);
                _self.ToggleCheckbox(setting, isChecked);
                  break;
            case "UseForcePayment":
              useForcePayment = isChecked;
              _self.CheckTransactionState(isChecked, setting);
              //_self.useForcePayment_change(isChecked);
              _self.ToggleCheckbox(setting, isChecked);
                break;

            case "IsAllowViewZXTape":
              if (!blindClose) isChecked = false;
              isAllowViewZXTape = isChecked;
              _self.ToggleCheckbox(setting, isChecked);
              _self.isAllowViewZXTape_change(isChecked)
                break;
            case "UseCashDrawer":
              useCashDrawer = isChecked;
              _self.useCashDrawer_change(isChecked);
              _self.ToggleCheckbox(setting, isChecked);
              break;
              // case "IsTrackStorePickUp":
              // chk.bind({
              //    'checkSwitch:on': function (e) {
              //        _self.ToggleTrackStorePickUp();
              //          _self.wasInitialized = (_self.wasInitialized == undefined) ? false : true;
              //   },
              //  'checkSwitch:off': function (e) {
              //      _self.wasInitialized = true;
              //      }
              //  });
              //    break;
          };
    },

    ToggleCheckbox: function(elementID, chkState){
      if (!chkState){
        $('#' + elementID).addClass("icon-circle-blank").css("color","#DADADA");
        $('#' + elementID).removeClass("icon-ok-sign");
      }else{
        $('#' + elementID).addClass("icon-ok-sign").css("color","");
        $('#' + elementID).removeClass("icon-circle-blank");
      }
    },

    AssignNumericValidation: function(e) {
      if (Global.InventoryPreference.IsAllowFractional) {
        Shared.Input.NonNegative('#' + e.target.id);
      } else {
        Shared.Input.NonNegativeInteger('#' + e.target.id);
      }
    },

    SaveAndClearValue: function(e) {
      var elem = '#' + e.target.id;
      var val = $(elem).val();
      this.lastQty = val;
      $(elem).val('');
      this.AssignNumericValidation(e);
    },

    RevertPreviousValue: function(e) {
      var elemID = '#' + e.target.id
      var val = $(elemID).val();
      var lastVal = '';

      if (val !== '') lastVal = parseFloat(val);
      else lastVal = this.lastQty;

      $(elemID).val(lastVal)
    },

    OrderExpiration_Change: function(e) {
      if (this.preferenceCollection.at(0)) {
        this.preferenceCollection.at(0).set({
          OrderExpiration: parseInt($("#OrderExpiration").val())
        });
      }
    },

    NotificationInterval_Change: function(e) {
      if (this.preferenceCollection.at(0)) {
        var val = parseInt($("#NotificationInterval").val());

        if (val < Global.MinimumNotificationInterval) { //Minimum of 5 Minutes
          val = Global.MinimumNotificationInterval;
          $("#NotificationInterval").val(val)
          Shared.ShowNotification('Minimum Notification Interval is ' + Global.MinimumNotificationInterval + ' Minutes', true);
        }
        this.preferenceCollection.at(0).set({
          NotificationInterval: val
        });
      }
    },

    trackDrawerBalance_change: function(checked) {
      Global.Preference.TrackDrawerBalance = checked;
      //console.log("ISOPEN : " + Global.Status.IsOpen + "|| TrackDrawerBalance" + Global.Preference.TrackDrawerBalance);
      if (!Global.Preference.TrackDrawerBalance && Global.Status.IsOpen && !checked) {
        Global.PromptCloseWorkstation = true;
        var _errorMessage = "Warning! This workstation is still open, you'll be asked to close this workstation after you save your changes.";
        console.log(_errorMessage);
        this.trackDrawerSwitch = checked;

        navigator.notification.confirm(_errorMessage, (_this.ForceCloseWorkstationConfirmation), "Workstation Still Open.", "Yes,No");
      } else {
        Global.PromptCloseWorkstation = false;
      }
    },

    isAllowViewZXTape_change: function(checked) {
       Global.Preference.AllowViewPrintZXTape = checked
       this.preferenceCollection.at(0).set({
         IsAllowViewZXTape: checked
      });
    },

    isUseCustomerShipToPaymentType_change: function(_enable) {
      if (_enable) {

        //$("#website-preference-btn").addClass('ui-disabled');
        $("#paymenttype-preference-btn").addClass('ui-disabled');
        $("#gateway-preference-btn").addClass('ui-disabled');

        $("#paymenttype-preference-btn").css('opacity', '1');
        $("#gateway-preference-btn").css('opacity', '1');
        // $("#paymenttype-preference-btn").css('display','none');
        // $("#gateway-preference-btn").css('display','none');
       $("#IsUseCustomerShipToPaymentTypeLabel").css('background-color','#E2E2E2');
      } else {
        //$("#website-preference-btn").removeClass('ui-disabled');
        $("#paymenttype-preference-btn").removeClass('ui-disabled');
        $("#gateway-preference-btn").removeClass('ui-disabled');
        // $("#paymenttype-preference-btn").css('display','block');
        // $("#gateway-preference-btn").css('display','block');

         $("#IsUseCustomerShipToPaymentTypeLabel").css('background-color','#FFF');
        $("#IsUseCustomerShipToPaymentTypeLabel").css('margin-bottom','12px');
      }
      // this.preferenceCollection.at(0).set({
      //   IsUseCustomerShipToPaymentType: _enable
      // });

    },

    isUsePOSShippingMethod_change: function(_enable) {
      if (_enable) {
         $("#shippingmethod-preference-btn").removeClass('ui-disabled');
         $("#IsUsePOSShippingMethodLabel").css('margin-bottom','12px');
         $("#IsUsePOSShippingMethodLabel").css('background-color','#E2E2E2');  

      } else {
        $("#shippingmethod-preference-btn").addClass('ui-disabled');
        $("#shippingmethod-preference-btn").css('opacity', '1');
        $("#IsUsePOSShippingMethodLabel").css('background-color','#FFF');
             
      }
    },


    // useForcePayment_change: function(_enable) {
    //   if (_enable) {
    //    $("#UseForcePaymentLabel").css('background-color','#E2E2E2');
    //   } else {
    //      $("#UseForcePaymentLabel").css('background-color','#FFF');
    //     $("#UseForcePaymentLabel").css('margin-bottom','12px');
    //   }
    // },

    useCashDrawer_change: function(checked) {
      this.useCashDrawer = checked;
    },

    goToReceipts: function(button) {
      if (button === 1) {
        _this.isRedirectToReceipts = true;

        console.log("UseCashDrawer: " + _this.preferenceCollection.at(0).get("UseCashDrawer"));
        _this.UpdateCollection();
        _this.Save();
        _this.trigger("forceUserToSetPrinter", this);
      } else {

        _this.useCashDrawer.off();
        return;
      }

    },

    initialize: function() {
      _this = this;
      this.preventSaveCompleted = false;
      this.on('CustomerLookup', this.SearchCustomer, this);
      this.on('SearchWorkstation', this.CheckIfWorkstationExist, this);
      this.on('iSaveWorkStationID', this.SaveWorkStationID, this);
      this.on('LocationLookup', this.SearchLocation, this);

      console.log("IP - " + Global.Printer.IpAddress + " MODEL - " + Global.Printer.PrinterModel);
      //this.render(); //temporary
      //window.localStorage.clear();
    },

    render: function() {
      _this = this;
      this.removeAndHide();
      this.isValid = true;
      this.InitializeLocalPreference();
      this.InitializeAllowBlindClose(); //Misc * 12/7/2012
      if (this.localpreference.length === 0) {
        Global.POSWorkstationID = "NoWorkstationId" + Math.random();
        this.ShowView();
      } else {
        this.FetchWorkstation(100, this.localpreference.at(0).get("WorkstationID"), "Check");
      }
    },

    AllowBlindClose: function() {
      if (this.userRoleCollection) {
        if (this.userRoleCollection.length > 0) { // Gemini : CSL-5068 : PR.Ebron : 04.09.13
          if (Global.trackDrawerBalanceState == true && Global.AdministratorRole == false && Global.IsOnLoad == false && Global.Preference.BlindClose == true) {
            $("#BlindClose-container > h1 > span").removeClass('ui_check_switch_off').addClass('ui_check_switch_on');
            $("#BlindClose-container > h1 > span .ui_check_switch_slider").css("margin-left", "0px");
            $("#BlindClose").attr("checked", true);

            navigator.notification.alert("You are not authorized to change this setting.", null, "Action Not Allowed", "OK");
          } else {
            $("#AllowViewZXTape-li").addClass('ui-disabled');
            $("#IsAllowViewZXTape").attr("checked", false);
            $("#AllowViewZXTape-container > h1 > span").removeClass('ui_check_switch_on').addClass('ui_check_switch_off');
            $("#AllowViewZXTape-container > h1 > span .ui_check_switch_slider").css("margin-left", "-50px");

            this.ToggleCheckbox('IsAllowViewZXTape', false);
          }
        }
      }
      $("#AllowViewZXTape-li").addClass('ui-disabled');
      Global.IsOnLoad = false;
    },

      BlindCloseOn : function(checkSwitch){
        if(checkSwitch){
            $("#AllowViewZXTape-li").addClass('ui-disabled');
            $("#IsAllowViewZXTape").attr("checked", false);
            $("#AllowViewZXTape-container > h1 > span").removeClass('ui_check_switch_on').addClass('ui_check_switch_off');
            $("#AllowViewZXTape-container > h1 > span .ui_check_switch_slider").css("margin-left", "-50px");
        } else {
            $("#AllowViewZXTape-li").removeClass('ui-disabled');
        }
      },

    DisableBlindClose: function(checkSwitch) {
      if (!trackDrawerBalance) {
        $("#BlindClose-li").addClass('ui-disabled');
        $("#BlindClose").attr("checked", false);
        $("#BlindClose-container > h1 > span").removeClass('ui_check_switch_on').addClass('ui_check_switch_off');
        $("#BlindClose-container > h1 > span .ui_check_switch_slider").css("margin-left", "-50px");

        $("#AllowViewZXTape-li").addClass('ui-disabled');
        $("#IsAllowViewZXTape").attr("checked", false);
        $("#AllowViewZXTape-container > h1 > span").removeClass('ui_check_switch_on').addClass('ui_check_switch_off');
        $("#AllowViewZXTape-container > h1 > span .ui_check_switch_slider").css("margin-left", "-50px");

        this.ToggleCheckbox('BlindClose', false);
        this.ToggleCheckbox('IsAllowViewZXTape', false);
      } else {
        $("#BlindClose-li").removeClass('ui-disabled');

        //console.log(this.userRoleCollection.length + '<len');

        if (!this.userRoleCollection) return;
        if (this.userRoleCollection.length <= 0) return;

        //if(Global.AdministratorRole == false && Global.Preference.BlindClose == true)
        if (Global.AdministratorRole == false) {
          $("#BlindClose-container > h1 > span").removeClass('ui_check_switch_off').addClass('ui_check_switch_on');
          $("#BlindClose-container > h1 > span .ui_check_switch_slider").css("margin-left", "0px");
          $("#BlindClose").attr("checked", true);
          Global.Preference.BlindClose = true;
          Global.Preference.AllowViewPrintZXTape = true;
        }
      }
    },

    //Misc * BEGIN * 12/7/2012
    InitializeAllowBlindClose: function() {
      Global.trackDrawerBalanceState = Global.TrackDrawerBalance;
      if (Global.Preference.BlindClose == true && Global.TrackDrawerBalance == true) {
        Global.IsOnLoad = false;
      } else {
        Global.IsOnLoad = true;
      }
    },

    //Misc * END * 12/7/2012

    SearchCustomer: function(criteria) {
      console.log(criteria);
      this.FetchCustomer(100, criteria);
    },

    SearchLocation: function(criteria) {
      console.log(criteria);
      this.FetchLocation(100, criteria);
    },

    SearchMerchant: function(criteria) {
      console.log(criteria);
      this.FetchMerchant(100, criteria);
    },

    SearchPaymentType: function(criteria) {
      //console.log(criteria);
      this.FetchPaymentType(100, criteria);
    },

    //added by PR.Ebron(03.22.13) >> INTMOBA-810 >> ISE web images
    InitializeImageSizeDisplay: function(model) {
      // this.imagesizePreference = new ImageSizePreference({
      //   el: this.$el,
      //   model: model
      // });
      // this.imagesizePreference.general = this;
      // this.imagesizePreference.on("selected", this.imageSizeSelected_changed, this);


      this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        model: model,
        preferencetype: "ImageSize",
        general: this
      });

      this.settingsModal.imageSizePreference.on("selected", this.imageSizeSelected_changed, this);
    },

    imageSizeSelected_changed: function(imgSize) {
      var imgSizeSelected = imgSize.selectedImagesize;
      this.preferenceCollection.at(0).set({
        ISEImageSize: imgSizeSelected
      });
      this.FetchImageSizeEquivalent();
    },

    //added by PR.Ebron(03.22.13) >> INTMOBA-810 >> ISE web images
    FetchImageSizeEquivalent: function() {
      var value;
      switch (this.preferenceCollection.at(0).get("ISEImageSize")) {
        case 0:
          value = "Medium";
          break;
        case 1:
          value = "Large";
          break;
        case 2:
          value = "Icon";
          break;
        case 3:
          value = "Minicart";
          break;
        case 4:
          value = "Mobile";
          break;
      }
      this.$("#ISEImageSizeContent").text(value)
    },

    removeAndHide: function() {
      $("#settings-customer-search").remove();
      $("#settings-workstation-container").remove();
      $("#settings-location-search").remove();
      $("#settings-website-search").remove();
      $("#settings-salesexempttaxcode-search").remove();
      $("#back-general").hide();
    },

    ShowView: function() {
      if (this.ValidateData()) {
        this.FetchPreference();
      } else {
        this.InitializeGeneralDisplay();
      }
    },

    ReinitializeGeneralDisplay: function() { //jjx
      this.isWorkstationPage = false;
      this.removeAndHide();
      this.InitializeGeneralDisplay();
      //this.Save();this.FetchPreference();
    },

    InitializeCustomerDisplay: function(collection) {
      // this.customersPreference = new CustomersPreference({
      //   el: this.$el,
      //   collection: collection
      // });
      this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        collection: collection,
        preferencetype: "Customer",
        selectedCustomer: this.preferenceCollection.at(0).get('CustomerCode')
      });
    },

    InitializeTaxSchemeDisplay: function(collection) {
      this.taxSchemesPreference = new TaxSchemePreference({
        el: this.$el,
        collection: collection
      });

    },

    InitializeGeneralDisplay: function() {
      this.wasInitialized = undefined;

      Shared.FixRightPanelPadding();
      //if(Global.PreviousServiceUrl !== Global.ServiceUrl) this.preferenceCollection.at(0).set({ WorkstationID : "" })
      var _custName = this.preferenceCollection.at(0).get("CustomerName")
      var _merchantLogin = this.preferenceCollection.at(0).get("MerchantLogin")
      var _paymentType = this.preferenceCollection.at(0).get("PaymentType")
      this.preferenceCollection.at(0).set({
        FormattedCustomerName: Shared.Escapedhtml(_custName),
        MerchantLogin: _merchantLogin,
        PaymentType: _paymentType
      })
      if (!this.preferenceCollection.at(0).get('WebSiteDescription')) this.preferenceCollection.at(0).set({
        WebSiteDescription: 'None'
      });
      if (!this.preferenceCollection.at(0).get('SalesExemptTaxCode')) this.preferenceCollection.at(0).set({
        SalesExemptTaxCode: 'None'
      });

      if (this.preferenceCollection.at(0))
        if (parseInt(this.preferenceCollection.at(0).get('NotificationInterval')) < Global.MinimumNotificationInterval) {
          this.preferenceCollection.at(0).set({
            NotificationInterval: Global.MinimumNotificationInterval
          });
        }

      this.$el.html(this._template(this.preferenceCollection.at(0).toJSON()));
      this.ToggleCheckboxes();

      this.$("#settings-general").trigger("create");

      if (Global.isBrowserMode){
        Shared.UseBrowserScroll('.settings-right-pane #general-right-pane-content');
      }
      else {
        this.myScroll = new iScroll('general-right-pane-content', {
        onBeforeScrollStart: function(e) {
          var target = e.target;
          while (target.nodeType != 1) target = target.parentNode;

          if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
            e.preventDefault();
        }
      });

      }
      this.checkAirprintSetting(this.preferenceCollection.at(0).attributes);
      this.FetchPOSDefaultTransaction();
      this.FetchImageSizeEquivalent();
      if (!Global._UserIsAdmin && Global._HasAdmins) {
        $('div#settings-general').find('li').addClass('ui-disabled');
        $('div#settings-general').find('li#workstation-preference-btn').removeClass('ui-disabled');
      }
      //this.ShowAllowChangeClassTemplate();
    },

    checkAirprintSetting: function(preference) {
      if (Global.isBrowserMode) return;
      if (preference.IsAirprint) $("#li-UseCashDrawer").addClass('ui-disabled');
    },

    ShowAllowChangeClassTemplate: function() {
      if (Global._UserIsCS) {
        $("#li-AllowChangeClassTemplate").addClass('ui-screen-hidden');
        // $("#li-AllowAddCustomer").addClass('ui-corner-bottom');
      }
    },


    InitializeLocalPreference: function() {
      var self = this;

      if (!this.localpreference) {
        this.localpreference = new LocalPreferenceCollection();
        this.localpreference.on('add', this.ProcessWorkstation, this);
      }
      this.localpreference.fetch({
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Retrieving Local Preference");
        }
      });
    },

    InitializeLocationDisplay: function(collection) {
      // this.locationsPreference = new LocationsPreference({
      //   el: this.$el,
      //   collection: collection
      // });
        this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        collection: collection,
        preferencetype: "Location",
        selectedLocation: this.preferenceCollection.at(0).get('DefaultLocation')
      });
    },

    InitializeShippingMethodDisplay: function(collection) {
      // this.locationsPreference = new LocationsPreference({
      //   el: this.$el,
      //   collection: collection
      // });
        this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        collection: collection,
        preferencetype: "ShippingMethod",
        selectedShippingMethod: this.preferenceCollection.at(0).get('POSShippingMethod')
      });
    },

    InitializeGatewayDisplay: function(collection) {
      // if(collection){
      //   this.gatewaysPreference = new GatewaysPreference({
      //     el: this.$el,
      //     collection: collection
      //   });
      // }
      if (collection){
        this.settingsModal = new SettingsModal({
          el: $("#settings-modal-container"),
          collection: collection,
          preferencetype: "Gateway",
          selectedGateway: this.preferenceCollection.at(0).get('MerchantLogin')
        });
      }

    },

    InitializePaymentTypeDisplay: function(collection) {
      // if(collection){
      //   this.paymenttypesPreference = new PaymentTypesPreference({
      //     el: this.$el,
      //     collection: collection
      //   });
      // }
      if (collection){
        this.settingsModal = new SettingsModal({
          el: $("#settings-modal-container"),
          collection: collection,
          preferencetype: "PaymentType",
          selectedPaymentType: this.preferenceCollection.at(0).get('PaymentType')
        });
      }
    },

    InitializeWorkstationDisplay: function(collection) {
      collection.sort();
      this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        collection: collection,
        preferencetype: "Workstation",
        selectedWorkstation: this.preferenceCollection.at(0).get('WorkstationID')
      });

      // this.workstationsPreference = new WorkstationsPreference({
      //   el: $("#right-pane-content"),
      //   collection: collection,
      // });
    },

    InitializePOSDisplay: function(model) {

      // Global.Preference.DefaultPOSTransaction = model.get("DefaultPOSTransaction");
      // this.posPreference = new POSPreference();
      // this.posPreference.general = this;
      // this.posPreference.on("selected", this.POSSelectedTransaction, this);

      this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        model: model,
        preferencetype: "POS",
        general: this
      });
      this.settingsModal.posPreference.on("selected", this.POSSelectedTransaction, this);
    },

    InitializeKioskDisplay: function(model) {
      this.kioskPreference = new KioskPreference({
        el: this.$el,
        model: model
      });
      this.kioskPreference.general = this;
      this.kioskPreference.on("selected", this.KiosSelectedTransaction, this);
    },

    ClearLocalPreference: function(model) {
      model.destroy(); //remove each item on the local preference collection
    },

    FetchPOSDefaultTransaction: function() { //jj
      switch (this.preferenceCollection.at(0).get("DefaultPOSTransaction")) {
        case 0:
          //this.preferenceCollection.at(0).set({D_DefaultPOSTransaction:"Sale"});
          this.$("#DefaultPOSTransaction").text("Sale");
          break;
        case 1:
          //this.preferenceCollection.at(0).set({D_DefaultPOSTransaction:"Order"});
          this.$("#DefaultPOSTransaction").text("Order");
          break;
        case 2:
          //this.preferenceCollection.at(0).set({D_DefaultPOSTransaction:"Quote"});
          this.$("#DefaultPOSTransaction").text("Quote");
          break;
        case 3:
          //this.preferenceCollection.at(0).set({D_DefaultPOSTransaction:"Return"});
          this.$("#DefaultPOSTransaction").text("Return");
          break;
      }

    },

    // FetchKioskDefaultTransaction : function() {//jj
    // 	switch( this.preferenceCollection.at(0).get("KioskDefaultTransaction")) {
    // 			case 0:
    // 			//this.preferenceCollection.at(0).set({D_KioskDefaultTransaction:"Order"});
    // 			this.$("#KioskDefaultTransaction").text("Order");
    // 			break;
    // 			case 1:
    // 			this.$("#KioskDefaultTransaction").text("Sale");
    // 			//this.preferenceCollection.at(0).set({D_KioskDefaultTransaction:"Sale"});
    // 			break;
    // 		}
    // },

    POSSelectedTransaction: function(pos) {
      switch (pos.selectedTransaction) {
        case 0:
          this.preferenceCollection.at(0).set({
            DefaultPOSTransaction: 0
          });
          break;
        case 1:
          this.preferenceCollection.at(0).set({
            DefaultPOSTransaction: 1
          });
          break;
        case 2:
          this.preferenceCollection.at(0).set({
            DefaultPOSTransaction: 2
          });
          break;
        case 3:
          this.preferenceCollection.at(0).set({
            DefaultPOSTransaction: 3
          });
          break;
      }
      this.FetchPOSDefaultTransaction();
      //this.InitializeGeneralDisplay();
    },

    // KiosSelectedTransaction : function(kiosk) {
    // 	switch(kiosk.defaultTransaction){
    // 		case 0:
    // 			this.preferenceCollection.at(0).set({KioskDefaultTransaction : 0});
    // 		break;
    // 		case 1:
    // 			this.preferenceCollection.at(0).set({KioskDefaultTransaction : 1});
    // 		break;
    // 	}
    // 	this.FetchKioskDefaultTransaction();
    // 	//this.InitializeGeneralDisplay();
    // },

    FetchCustomer: function(_rows, _criteria) {
      var _self = this;
      var _customerLookup = new LookupCriteriaModel();
      var _rowsToSelect = _rows;

      //Initialize collection
      if (!this.customerCollection) {
        this.customerCollection = new CustomerCollection();
        this.customerCollection.on('selected', this.SelectedCustomer, this);
      }

      _customerLookup.set({
        StringValue: _criteria
      })

      _customerLookup.url = Global.ServiceUrl + Service.CUSTOMER + Method.CUSTOMERLOOKUP + _rowsToSelect;
      _customerLookup.save(null, {
        success: function(model, response) {
          _self.customerCollection.reset(response.Customers);
          _self.customerCollection.sort();
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!response.Customers) {
            console.log("Customer not found");
            navigator.notification.alert("Customer does not exist.", null, "Customer Not Found", "OK");
          } else {
            _self.InitializeCustomerDisplay(_self.customerCollection);
          }
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving Customer");
        }
      });
    },

    FetchTaxSchemes: function(criteria) {
      var _mdl = new BaseModel();
      if (!criteria) criteria = "";


      if (!this.taxSchemeCollection) {
        this.taxSchemeCollection = new BaseCollection();
        this.taxSchemeCollection.on('selected', this.SelectedSalesExemptTaxCode, this);
      }

      _mdl.on('sync', this.FetchTaxSchemeSuccess, this)
      _mdl.on('error', this.FetchTaxSchemeFailed, this)

      _mdl.url = Global.ServiceUrl + Service.CUSTOMER + Method.TAXSCHEMELOOKUP + 100 + '/' + Global.Preference.CompanyCountry;
      _mdl.set({
        StringValue: criteria
      });
      _mdl.save();
    },

    FetchTaxSchemeSuccess: function(model, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (response.ErrorMessage) {
        navigator.notification.alert('Fetching Tax Response : ' + response.ErrorMessage, null, "Error", "OK");
        return;
      }

      if (!response.SystemTaxSchemes) {
        navigator.notification.alert("Tax scheme does not exist.", null, "Tax scheme not found", "OK");
      } else {
        this.taxSchemeCollection.reset(response.SystemTaxSchemes);
        this.InitializeTaxSchemeDisplay(this.taxSchemeCollection);
      }
    },

    FetchTaxSchemeFailed: function(error, xhr, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      navigator.notification.alert(error, "Error Fetching Tax Schemes");
    },

    FetchLocalPreference: function() {
      var self = this;
      this.localpreference.fetch({
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.each(self.ClearLocalPreference, this);
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Retrieving Local Preference");
        }
      })
    },

    FetchLocation: function() {
      if (!this.locationCollection) {
        this.locationCollection = new LocationCollection();
        this.locationCollection.on('selected', this.SelectedLocation, this);
      }
    },

    
    FetchShippingMethod: function() {
      if (!this.shippingMethodCollection) {
        this.shippingMethodCollection = new ShippingMethodCollection();
        this.shippingMethodCollection.on('selected', this.SelectedShippingMethod, this);
      }
    },

    FetchMerchant: function() {
      if (!this.gatewayCollection) {
        this.gatewayCollection = new GatewayCollection();
        this.gatewayCollection.on('selected', this.SelectedMerchant, this);
      }
    },
    FetchPaymentType: function() {
      if (!this.paymentTypeCollection) {
        this.paymentTypeCollection = new PaymentTypeCollection();
        this.paymentTypeCollection.on('selected', this.SelectedPaymentType, this);
      }
    },
    FetchPreference: function() {
      this.FetchLocation();
      this.FetchMerchant();
      this.FetchShippingMethod();
      this.FetchPaymentType();
      if (!this.preferenceCollection) {
        this.preferenceCollection = new PreferenceCollection();
        this.preferenceCollection.on('change:DefaultCustomer', this.ChangeCustomer, this);
        this.preferenceCollection.on('change:DefaultLocation', this.ChangeLocation, this);
        this.preferenceCollection.on('change:POSShippingMethod', this.ChangeShippingMethod, this);
        this.preferenceCollection.on('change:MerchantLogin', this.ChangeMerchant, this);
        this.preferenceCollection.on('change:PaymentType', this.ChangePaymentType, this);
        this.preferenceCollection.on('change:WorkstationID', this.ChangeWorkstation, this);
        this.preferenceCollection.on('change:SalesExemptTaxCode', this.ChangeSalesExemptTaxCode, this);
      }

      if (!this.pickupEmailPreference) {
        this.pickupEmailPreference = new BaseModel();
      }

      var self = this;
      this.preferenceCollection.url = Global.ServiceUrl + Service.POS + Method.GETPREFERENCEBYWORKSTATION + Global.POSWorkstationID;
      this.preferenceCollection.fetch({
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.ResetPreferenceCollection(response.Preference);
          self.ResetPickupEmailPreference(response.PickupEmailPreference);
          self.ResetLocationCollection(response.Warehouses);
          self.ResetShippingMethodCollection(response.POSShippingMethods);
          self.ResetGatewayCollection(response.CreditCardGateways);
          self.ResetPaymentTypeCollection(response.PaymentType);
          self.ResetCategoryCollection(response.Categories);
          self.ResetUserRoleCollection(response.UserRoles);
          self.ResetStatusCollection(response.Status);
          self.ValidateDefaultLocation(response.Warehouses);
          self.ResetCustomerPreference(response.CustomerPreference);
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Retrieving Workstation Preference");
        }
      });
    },

    FetchPaymentTypePreference: function(){
            var self = this;
            this.paymentTypeCollection.url = Global.ServiceUrl + Service.POS + "getpaymenttypebymerchant/" + Global.POSWorkstationID + "/" + Global.MerchantLogin;
            this.paymentTypeCollection.fetch({
              success: function(collection, response) {
                if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                self.ResetPaymentTypeCollection(response.SystemPaymentTypes);
              },
              error: function(collection, error, response) {
                if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                collection.RequestError(error, "Error Retrieving Workstation Preference");
              }
            });
      },


    ToBeAdded: function(button) {
      if (button === 1) {
        _model.set({
          WorkstationID: _model.get("ToBeAdded")
        });
        _this.Save();
      } else {
        return;
        //_workstation.FetchWorkstation(100, criteria);
      }
    },

    FetchWorkstation: function(_rows, _criteria, type) {
      var self = this;
      Global.WorkstationValue = _criteria;
      //console.log(Global.WorkstationValue);
      //type = 'Check';
      var _preference = new LookupCriteriaModel();
      var _rowsToSelect = _rows;
      _preference.set({
        StringValue: _criteria
      })

      _preference.url = Global.ServiceUrl + Service.POS + Method.PREFERENCELOOKUP + _rowsToSelect;
      _preference.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!response.Preferences) {
            switch (type) {
              case "Add":
                _model = self.preferenceCollection.at(0);
                _model.set({
                  ToBeAdded: _criteria
                }, {
                  silent: true
                });
                navigator.notification.confirm("The Workstation ID you entered doesn't exist. Instead would you like it to be added as a new Workstation?", (self.ToBeAdded), "Workstation ID doesn't exist.", ['Yes', 'No']);
                //self.ToBeAdded(1);
                break;
              case "Check":
                Global.POSWorkstationID = "Test";
                self.ShowView();
                break;
              default:
                criteria = _criteria;
                self.ResetWorkstation(response.Preferences);
                break;
            }

          } else {
            switch (type) {
              case "Add":
                criteria = _criteria;
                //console.log("on the other hand");
                self.ResetWorkstation(response.Preferences);

                break;
              case "Check":
                self.ShowView();
                break;
              default:
                self.ResetWorkstation(response.Preferences);
                break;
            }
          }
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving Workstation");
        }
      });
    },

    FetchWebsite: function(_rows, _criteria) {
      var _self = this;
      var _websiteModel = new WebsiteModel();
      _websiteModel.url = Global.ServiceUrl + Service.POS + Method.ECOMMERCESITELOOKUP + _rows;

      if (!this.websiteCollection) {
        this.websiteCollection = new WebsiteCollection();
        this.websiteCollection.on('selected', this.SaveWebsiteSelected, this);
      }

      _websiteModel.set({
        StringValue: _criteria
      });

      _websiteModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();

          if (!_self.preferenceCollection.at(0).get('IsUseISEImage')) {
            var ecommerceSitesCount = response.EcommerceSites.length;
            response.EcommerceSites[ecommerceSitesCount] = {
              WebSiteDescription: 'None',
              WebSiteURL: null,
              WebSiteCode: null,
              ErrorMessage: null,
              WebServiceURL: null
            }
          }
          _self.websiteCollection.reset(response.EcommerceSites);
          _self.ValidateCollection(_self.websiteCollection);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving Websites");
        }
      });
    },

    SaveWebsiteSelected: function(_model) {
      var _self = this;
      var _preferenceModel;
      _previousValue = this.preferenceCollection.at(0).get('WebSiteCode')
      if (_previousValue !== _model.get('WebsiteCode')) {
        this.preferenceCollection.at(0).set({
          WebSiteCode: _model.get('WebSiteCode'),
          WebSiteDescription: _model.get('WebSiteDescription'),
          WebSiteURL: _model.get('WebSiteURL'),
        });
        this.removeAndHide();
        this.InitializeGeneralDisplay();
        this.CloseModal();
      }
    },

    ValidateCollection: function(_collection) {
      if (_collection.length === 0) {
        this.NotifyMsg("No Website found.", "No Website Found.");
      } else {
        this.ShowWebsitePage(_collection);
      }
    },

    ShowWebsitePage: function(_collection) {
      // _selectedWebsite = this.preferenceCollection.at(0).get('WebSiteCode');
      // this.websiteListPref = new WebsiteListPreference({
      //   el: this.$el,
      //   collection: _collection,
      // });
      // if (!_selectedWebsite) _selectedWebsite = null;
      // //if (this.preferenceCollection.at(0).get('IsUseISEImage') && !_selectedWebsite) {
      // //    _selectedWebsite = _collection.at(0).get('WebSiteCode');
      // //    this.SaveWebsiteSelected(_collection.at(0));
      // //}
      // this.websiteListPref.SetSelected(_selectedWebsite);
      this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        collection: _collection,
        preferencetype: "Website",
        selectedWebsite: this.preferenceCollection.at(0).get('WebSiteCode')
      });
    },

    ResetWorkstation: function(collection) {
      if (!this.workstationCollection) {
        this.workstationCollection = new WorkstationCollection();
        this.workstationCollection.on('selected', this.SelectedWorkstation, this);
      }
      this.workstationCollection.reset(collection);
      this.workstationCollection.sort();
      this.InitializeWorkstationDisplay(this.workstationCollection);
    },

    ResetCategoryCollection: function(categories) {
      if (!this.categoryCollection) {
        this.categoryCollection = new CategoryCollection();
      }
      this.categoryCollection.reset(categories);
    },

    ResetUserRoleCollection: function(userroles) {
      if (!this.userRoleCollection) {
        this.userRoleCollection = new UserRoleCollection();
      }
      this.userRoleCollection.reset(userroles);

      //checks if the currentuser is admin
      if (userroles.length > 0) {
        for (var i = 0; i < userroles.length; i++) {
          if (userroles[i].RoleCode == Global.UserInfo.RoleCode) {
            Global._UserIsAdmin = true;
            Global.AdministratorRole = true;
          }
        }
      }

    },

    ResetStatusCollection: function(status) {
      Global.IsWorkstationIDStillOpen = status.IsOpen;
      Global.Status = status;
    },


    ResetPreferenceCollection: function(preferences) {
      this.preferenceCollection.reset(preferences);
      Global.Preference = preferences;
      Global.Preference.AutoSignOutUser = true;
      Global.PrintOptions.CustomizePrint = preferences.IsAirprint;
      Global.CardDeviceType = preferences.CardDeviceType;
      this.InitializeGeneralDisplay();
    },

    ResetLocationCollection: function(warehouses) {
      this.locationCollection.reset(warehouses);
    },

    
    ResetShippingMethodCollection: function(shippingMethods) {
      this.shippingMethodCollection.reset(shippingMethods);
    },

    ResetGatewayCollection: function(gateways) {
      this.gatewayCollection.reset(gateways);
    },

    ResetPaymentTypeCollection: function(paymenttypes) {
      this.paymentTypeCollection.reset(paymenttypes);
    },

    ResetCustomerPreference: function(customerPreference) {
      if (!this.customerPreference) this.customerPreference = new BaseModel();
      this.customerPreference.set(customerPreference);
    },

    ResetPickupEmailPreference: function(pickupEmailPreference) {
      if (!this.pickupEmailPreference) this.pickupEmailPreference = new BaseModel();

      var tplContent;
      if (pickupEmailPreference) {
        this.pickupEmailPreference.set(pickupEmailPreference);
        tplContent = this.pickupEmailPreference.get('B64EmailTemplate') || '';
      }

      //Set Default Template
      if (!pickupEmailPreference || !tplContent) {
        this.pickupEmailPreference.set({
          B64EmailTemplate: Base64.encode(this._defaultMessageTemplate())
        });
      }

      Global.PickupEmailPreference = this.pickupEmailPreference;
    },

    ConvertDefaultTransaction: function() {
      var _transaction = [];
      switch (Global.Preference.DefaultPOSTransaction) {
        case 0:
          _transaction[0] = "Sale";
          break;
        case 1:
          _transaction[0] = "Order";
          break;
        case 2:
          _transaction[0] = "Quote";
          break;
        case 3:
          _transaction[0] = "Return";
          break;
      }

      // switch(Global.Preference.KioskDefaultTransaction){
      // 	case 0: _transaction[1] = "Order";  break;
      // 	case 1: _transaction[1] = "Sale"; break;
      // }

      return _transaction;
    },

    AllowTransactionChange: function(settings) {
      var _booleanSettings = ["AllowSales", "AllowOrders", "AllowQuotes", "AllowReturns"];
      // var _defaultTransactions = [ this.preferenceCollection.at(0).get("DefaultPOSTransaction"), this.preferenceCollection.at(0).get("KioskDefaultTransaction") ]
      var _defaultTransactions = [this.preferenceCollection.at(0).get("DefaultPOSTransaction")]
      var _checked = false;
      var _transaction = [];
      var _applicationType = ["POS", "Kiosk"];
      //var _defaultTransaction = this.preferenceCollection.at(0).get("DefaultPOSTransaction");//Global.Preference.DefaultPOSTransaction;
      for (var i = 0; i < _defaultTransactions.length; i++) { // CSL - 6527	: 4.23.13
          if (_booleanSettings[_defaultTransactions[i]] != settings) return true;
        switch (_booleanSettings[_defaultTransactions[i]]) {
          case "AllowSales":
            _checked = allowSales == null ? this.preferenceCollection.at(0).attributes['AllowSales'] : allowSales;
            break;
          case "AllowOrders":
            _checked = allowOrders == null ? this.preferenceCollection.at(0).attributes['AllowOrders'] : allowOrders;
            break;
          case "AllowQuotes":
            _checked = allowQuotes == null ? this.preferenceCollection.at(0).attributes['AllowQuotes'] : allowQuotes;
            break;
          case "AllowReturns":
            _checked = allowReturns == null ? this.preferenceCollection.at(0).attributes['AllowReturns'] : allowReturns;
            break;
            if (_checked) break;
        };

        //If no transaction is checked, revert original setting
        if (!_checked) {
          switch (settings) {
            case "AllowSales":
              allowSales = true;
              this.ToggleCheckbox(settings, true);
              break;
            case "AllowQuotes":
              allowQuotes = true;
              this.ToggleCheckbox(settings, true);
              break;
            case "AllowOrders":
              allowOrders = true;
              this.ToggleCheckbox(settings, true);
              break;
            case "AllowReturns":
              allowReturns = true;
              this.ToggleCheckbox(settings, true);
              break;
          }
          _transaction = this.ConvertDefaultTransaction(); //parameter 'i' determines which defaultTransaction.
          this.NotifyMsg(_transaction[i] + " Transaction is used as Default " + _applicationType[i] + " Transaction.", "Action Not Allowed");
          //navigator.notification.alert(_transaction+" Transaction is used as Default Transaction.", null, "Action Not Allowed", "OK");
          return false;
        }
        _booleanSettings = ["AllowOrders", "AllowSales"]; //switches the AllowOrders and AllowSales Position the second loop. for checking of Kiosk Default Transaction.

      }


    },
    CheckTransactionState: function(checkSwitch, settingsPage) {
      var _settings = this.preferenceCollection.at(0);
      var _booleanSettings = ["AllowSales", "AllowQuotes", "AllowOrders", "AllowReturns"];
      var _checked = false;

      if (this.AllowTransactionChange(settingsPage)){
          // for (var i = 0, j = _booleanSettings.length; i < j; i++) {
        switch (settingsPage) {
          case "AllowSales":
            _checked = allowSales;
            _settings.set({
              AllowSales: _checked
            });
            Global.Preference.AllowSales = _checked;
            this.ToggleCheckbox(settingsPage, _checked);
            break;
          case "AllowQuotes":
            _checked = allowQuotes;
            _settings.set({
              AllowQuotes: _checked
            });
            Global.Preference.AllowQuotes = _checked;
            this.ToggleCheckbox(settingsPage, _checked);
            break;
          case "AllowOrders":
            _checked = allowOrders;
            _settings.set({
              AllowOrders: _checked
            });
            Global.Preference.AllowOrders = _checked;
            this.ToggleCheckbox(settingsPage, _checked);
            break;
          case "AllowReturns":
            _checked = allowReturns;
            _settings.set({
              AllowReturns: _checked
            });
            Global.Preference.AllowReturns = _checked;
            this.ToggleCheckbox(settingsPage, _checked);
            break;
        }

        if (settingsPage == "UseForcePayment")
        {
            _settings.set({
              UseForcePayment: useForcePayment
            });
        }

      }


        //	if (_checked) break;
      // };
    },



    //	ToggleTrackStorePickUp : function() {
    //		if(this.customerPreference)
    //			if(!this.customerPreference.attributes.IsRequirePickingNote)
    //				if(this.wasInitialized == true) navigator.notification.alert("Please turn on the Require pick note preference in CB to maximize this feature.", null, "Information", "OK", true);
    //	},


    ToggleCheckboxes: function() {
      var _settings = this.preferenceCollection.at(0);
      var _booleanSettings = ["AllowSales", "AllowQuotes", "AllowOrders", "AllowReturns",
        "AllowChangePrice", "AllowAddCustomer", "TaxByLocation",
        "ShowCouponList", "IsUseItemDescription", "IsDepositPayment",
        "IsOverrideSalesRep", "ShowWholesalePrice",
        "AutoSignOutUser", "TrackDrawerBalance", "BlindClose",
        "UseCashDrawer", "IsUseISEImage", "AllowChangeClassTemplate", "AllowTaxOnLineItems",
        "AskForCustomerPO", "AskForShipDate", "AskForSource", "IsTrackStorePickUp",
        "AllowChangePaymentTerm", "AllowChangeTaxCode", "IsUseCustomerShipToPaymentType","IsUsePOSShippingMethod","UseForcePayment","IsAllowViewZXTape", "IsAutoAdjustmentStock"
      ];

      var _self = this;
      _.each(_booleanSettings,
        function(setting) {

          var elementID = "#" + setting;
          // var chk = CheckSwitch(elementID);

          // if (_settings.get(setting)) {
          //  // chk.on();
          //   _self.SetChkState(setting, true);
          // } else {
          //   _self.SetChkState(setting, false);
          // }
          switch (setting) {
            case "AllowSales":
              allowSales = _settings.attributes['AllowSales'];
              break;
            case "AllowQuotes":
              allowQuotes = _settings.attributes['AllowQuotes'];
              break;
            case "AllowOrders":
              allowOrders = _settings.attributes['AllowOrders'];
              break;
            case "AllowReturns":
              allowReturns = _settings.attributes['AllowReturns'];
              break;
            case "AllowChangePrice":
              this.allowChangePrice = _settings.attributes['AllowChangePrice'];
              break;
            case "AllowChangePaymentTerm":
              this.allowChangePaymentTerm = _settings.attributes['AllowChangePaymentTerm'];
              break;
            case "AllowChangeTaxCode":
              this.allowChangeTaxCode = _settings.attributes['AllowChangeTaxCode'];
              break;
            case "AllowAddCustomer":
              this.allowAddCustomer = _settings.attributes['AllowAddCustomer'];
              break;
            case "TaxByLocation":
              this.taxByLocation = _settings.attributes['TaxByLocation'];
              break;
            case "ShowCouponList":
              this.showCouponList = _settings.attributes['ShowCouponList'];
              break;
            case "IsUseItemDescription":
              this.isUseItemDescription = _settings.attributes['IsUseItemDescription'];
              break;
            case "IsDepositPayment":
              this.isDepositPayment = _settings.attributes['IsDepositPayment'];
              break;
            case "IsOverrideSalesRep":
              this.isOverrideSalesRep = _settings.attributes['IsOverrideSalesRep'];
              break;
            case "ShowWholesalePrice":
              this.showWholesalePrice = _settings.attributes['ShowWholesalePrice'];
              break;

              //Misc * BEGIN * 12/7/2012
            case "AutoSignOutUser":
              this.autoSignOutUser = _settings.attributes['AutoSignOutUser'];
              break;
            case "TrackDrawerBalance":
              this.trackDrawerBalance = _settings.attributes['TrackDrawerBalance'];
              break;
            case "BlindClose":
              this.blindClose = _settings.attributes['BlindClose'];
              break;
            case "UseCashDrawer":
              this.useCashDrawer = _settings.attributes['UseCashDrawer'];
              break;
              //Misc * END * 12/7/2012
            case "IsUseISEImage": //added by PR.Ebron(03.22.13) >> INTMOBA-810 >> ISE web images
              this.isUseISEImage = _settings.attributes['IsUseISEImage'];
              break;
            case "AllowChangeClassTemplate":
              this.allowChangeClassTemplate = _settings.attributes['AllowChangeClassTemplate'];
              break;
            case "AllowTaxOnLineItems":
              this.allowTaxOnLineItems = _settings.attributes['AllowTaxOnLineItems'];
              break;

              //VER. 14
            case "AskForCustomerPO":
              this.askForCustomerPO = _settings.attributes['AskForCustomerPO'];
              break;
            case "AskForShipDate":
              this.askForShipDate = _settings.attributes['AskForShipDate'];
              break;
            case "AskForSource":
              this.askForSource = _settings.attributes['AskForSource'];
              break;
            case "IsTrackStorePickUp":
              this.trackStorePickUp = _settings.attributes['IsTrackStorePickUp'];
              break;
            case "IsUseCustomerShipToPaymentType":
              this.isUseCustomerShipToPaymentType = _settings.attributes['IsUseCustomerShipToPaymentType'];
              break;
            case "IsUsePOSShippingMethod":
              this.isUsePOSShippingMethod = _settings.attributes['IsUsePOSShippingMethod'];
              break;
            case "UseForcePayment":
              this.useForcePayment = _settings.attributes['UseForcePayment'];
              break;
            case "IsAllowViewZXTape":
              this.isAllowViewZXTape = _settings.attributes['IsAllowViewZXTape'];
              break;
            case "IsAutoAdjustmentStock":
              this.isAutoAdjustmentStock = _settings.attributes['IsAutoAdjustmentStock'];
              break;
          };

          //Misc * BEGIN * 12/7/2012
          if (_settings.get(setting)) {
            _self.SetChkState(setting, true);
            // $("#BlindClose-li").removeClass('ui-disabled');
          } else {
            _self.SetChkState(setting, false);
            // $("#BlindClose-li").addClass('ui-disabled');
          }

        });
    },

    SelectedCustomer: function(model) {
      var _settings = this.preferenceCollection.at(0);
      console.log("Previous: " + _settings.get("DefaultCustomer"));
      _settings.set({
        DefaultCustomer: model.get("CustomerCode"),
        CustomerCode: model.get("CustomerCode"),
        CustomerName: model.get("CustomerName")
      });
      this.CloseModal();
    },

    SelectedSalesExemptTaxCode: function(model) {
      var _settings = this.preferenceCollection.at(0);
      _settings.set({
        SalesExemptTaxCode: model.get("TaxCode")
      });
    },

    ChangeCustomer: function(model) {
      console.log("Default: " + model.get("DefaultCustomer") + " Name :" + model.get("CustomerName"));
      Global.CustomerCode = model.get("CustomerCode");
      Global.CustomerName = model.get("CustomerName");
      this.removeAndHide();
      this.InitializeGeneralDisplay();
    },

    ChangeSalesExemptTaxCode: function(model) {
      this.removeAndHide();
      this.InitializeGeneralDisplay();
    },

    SelectedLocation: function(model) {
      var _settings = this.preferenceCollection.at(0);
      console.log("Previous: " + _settings.get("DefaultLocation"));
      _settings.set({
        DefaultLocation: model.get("WarehouseCode")
      });
      this.CloseModal();
    },

    SelectedShippingMethod: function(model) {
      var _settings = this.preferenceCollection.at(0);
      console.log("Previous: " + _settings.get("ShippingMethodCode"));
      _settings.set({
        POSShippingMethod: model.get("ShippingMethodCode")
      });
      this.CloseModal();
    },

    SelectedMerchant: function(model) {
      var _settings = this.preferenceCollection.at(0);
      //console.log("Previous: " + _settings.get("MerchantLogin"));
      _settings.set({
        MerchantLogin: model.get("MerchantLogin")
      });
      this.CloseModal();
    },

    SelectedPaymentType: function(model) {
      var _settings = this.preferenceCollection.at(0);
      //console.log("Previous: " + _settings.get("PaymentType"));
      _settings.set({
        PaymentType: model.get("PaymentTypeCode")
      });
      this.CloseModal();
    },

    ChangeLocation: function(model) {
      console.log("Default:" + model.get("DefaultLocation"));
      Global.LocationCode = model.get("DefaultLocation");
      this.removeAndHide();
      this.InitializeGeneralDisplay();
    },

    ChangeShippingMethod: function(model) {
      console.log("Default:" + model.get("POSShippingMethod"));
      Global.ShippingMethod = model.get("POSShippingMethod");
      this.removeAndHide();
      this.InitializeGeneralDisplay();
    },

    ChangeMerchant: function(model) {
      this.removeAndHide();
      Global.MerchantLogin = model.get("MerchantLogin");
      this.InitializeGeneralDisplay();
      this.FetchPaymentTypePreference();
      this.preferenceCollection.at(0).set("PaymentType","");
    },

    ChangePaymentType: function(model) {
      this.removeAndHide();
      this.InitializeGeneralDisplay();
    },

    SelectedWorkstation: function(model) {
      var _settings = this.preferenceCollection.at(0);
      var _TrackDrawerON = this.preferenceCollection.at(0).get("TrackDrawerBalance");
      var _differentID = model.get("WorkstationID") !== _settings.get("WorkstationID");
      if (Global.IsWorkstationIDStillOpen && _differentID && Global.PreviousWorkstationID !== null) {
        navigator.notification.alert("Unable to change WorkstationID. The current Workstation (" + _settings.get("WorkstationID") + ") is still open. Please close the current workstation before switching to new workstation.", null, "Workstation Still Open", "OK");
      } else {
        if (_differentID || Global.PreviousWorkstationID !== null) {
          Global.POSWorkstationID = model.get("WorkstationID");
          _settings.set({
            WorkstationID: model.get("WorkstationID")
          }, {
            silent: true
          });
          this.removeAndHide();
          this.FetchPreference();

          this.CloseModal();
        }
      }
    },

    CloseModal: function(){
      if (this.settingsModal != null){
            this.settingsModal.close();
          }
    },

    ChangeWorkstation: function(model) {
      if (Global.BackToGeneralTriggered) {
        Global.BackToGeneralTriggered = false;
        Global.POSWorkstationID = model.get("WorkstationID");
        return;
      }
      _this = this;
      var _settings = this.preferenceCollection.at(0);
      Global.POSWorkstationID = model.get("WorkstationID");
      var _IsSameID = Global.PreviousWorkstationID === model.get("WorkstationID");
      if (Global.IsWorkstationIDStillOpen) {
        if (Global.PreviousWorkstationID === null || _IsSameID) {
          this.removeAndHide();
          this.InitializeGeneralDisplay();
        } else {
          var msg = "Unable to change WorkstationID. The current Workstation (" + Global.PreviousWorkstationID + ") is still open. Please close the current workstation before switching to new workstation."
          this.NotifyMsg(msg, "Cannot change Workstation.");
        }
      } else {
        this.removeAndHide();
        this.InitializeGeneralDisplay();
      }
    },

    RevertToPreviousWorkstation: function() {
      var prevID = Global.PreviousWorkstationID;
      console.log('unbind.' + 'Global.PreviousWorkstationID : ' + Global.PreviousWorkstationID);
      this.preferenceCollection.at(0).set({
        WorkstationID: Global.PreviousWorkstationID
      }, {
        silent: true
      });
      this.FetchWorkstation(100, "");
      console.log(_this.preferenceCollection.at(0).get('WorkstationID') + '<<');
    },

    CheckIfWorkstationExist: function(_workstationID) {
      //this.FetchWorkstation(100, _workstationID, "Add");
      this.FetchWorkstation(100, _workstationID, "Add");
    },

    SaveWorkStationID: function(_workstationID) {
      _this = this;
      _model = _this.preferenceCollection.at(0);
      _model.set({
        ToBeAdded: _workstationID
      }, {
        silent: true
      });
      this.ToBeAdded(1);
      this.CloseModal();
    },

    AddWorkstation: function(_workstationID) {
      var _settings = this.preferenceCollection.at(0);
      console.log("Previous: " + _settings.get("WorkstationID"));
      _settings.set({
        WorkstationID: _workstationID
      });
    },

    SaveLocalPreference: function() {
      var _settings = this.preferenceCollection.at(0);

      this.FetchLocalPreference();

      this.localpreference.create({
        WorkstationID: _settings.get("WorkstationID"),
        IsUseCustomerShipToPaymentType: _settings.get("IsUseCustomerShipToPaymentType"),
        IsUsePOSShippingMethod: _settings.get("IsUsePOSShippingMethod"),
        POSShippingMethod: _settings.get("POSShippingMethod"),
        PaymentType: _settings.get("PaymentType"),
        UseForcePayment: _settings.get('UseForcePayment')
      });
    },

    Save: function() {
      if (!this.preferenceCollection) {
        return;
      } else {

        //FIGUEROA JAN-19-2013 //Make sure that the current User is set as Administrator if there are no Administrator set.
        if (!(Global._HasStations && !Global._HasAdmins) && this.userRoleCollection.length == 0) {
          var _userRoleModel = {
            UserCode: '',
            RoleCode: Global.UserInfo.RoleCode,
            Message: '',
            AppVersion: '',
            Selected: true
          }
          this.userRoleCollection.add(_userRoleModel);
        };

        this.UpdateCollection();
        if (this.ValidateData()) {
          this.UpdateCollection();
          this.SaveLocalPreference();

          this.pickupEmailPreference.set({
            WorkstationID: this.preferenceCollection.at(0).get('WorkstationID')
          });

          //my code
          var _settings = new PreferenceModel();
          _settings.set({
              Preference: this.preferenceCollection.at(0),
              Categories: this.categoryCollection,
              UserRoles: this.userRoleCollection,
              Warehouses: this.locationCollection,
              POShippingMethods:this.shippingMethodCollection,
              PickupEmailPreference: this.pickupEmailPreference
            })
            //

          //var _settings = this.preferenceCollection.at(0);
          var _self = this;
          _settings.url = Global.ServiceUrl + Service.POS + Method.UPDATEPREFERENCE;
          _settings.save(null, {
            success: function(model, response) {
              if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
              Global.Preference = response.Preference;
              _this.isValid = true;
              if (!_this.preventSaveCompleted) {
                _self.preventSaveCompleted = false;
                _self.SaveCompleted();
              } else {
                _this.preventSaveCompleted = false;
              }

            },
            error: function(model, error, response) {
              if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
              model.RequestError(error, "Error Updating Preference");
            }
          });
        } else {
          if (!this.isRedirectToReceipts) {
            this.isValid = false;
            console.log("Failed Validation: " + this.isValid);
          } else {
            this.isValid = true;
            console.log("PASSED Validation: " + this.isValid);
          }

        }
      }
    },

    SaveCompleted: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      var stationID = this.preferenceCollection.at(0).get("WorkstationID");
      this.isValid = true;
      var websiteCodeSearch = $("#settings-website-search");
      if (websiteCodeSearch.is(":visible")) websiteCodeSearch.remove();

      if (Global.IsWorkstationIDStillOpen && this.isWorkstationPage && !Global.BackToMain) {
        if (Global.PreviousWorkstationID === null || (Global.PreviousWorkstationID === stationID)) {
          this.trigger("SaveCompleted", this);
        } else {
          console.log('RevertToPreviousWorkStation');
          this.RevertToPreviousWorkstation();
        }
      } else {
        this.isWorkstationPage = false;
        this.trigger("SaveCompleted", this);
      }
    },

    UpdateCollection: function() {
      var _settings = this.preferenceCollection.at(0);
      var _booleanSettings = ["AllowSales", "AllowQuotes", "AllowOrders",
        "AllowReturns", "AllowChangePrice", "AllowAddCustomer",
        "TaxByLocation", "ShowCouponList", "IsUseItemDescription",
        "IsDepositPayment", "IsOverrideSalesRep", "ShowWholesalePrice",
        "AutoSignOutUser", "TrackDrawerBalance", "BlindClose", "UseCashDrawer", "AllowChangeClassTemplate", "AllowTaxOnLineItems",
        "AskForCustomerPO", "AskForShipDate", "AskForSource", "IsTrackStorePickUp",
        "AllowChangePaymentTerm", "AllowChangeTaxCode","IsUseCustomerShipToPaymentType","IsUsePOSShippingMethod", "UserForcePayment", "IsAllowViewZXTape", "IsAutoAdjustmentStock"
      ];

      _.each(_booleanSettings,
        function(setting) {
          var _checked = false;
          switch (setting) {
            case "AllowSales":
              _checked = allowSales;
              _settings.set({
                AllowSales: _checked
              });
              Global.Preference.AllowSales = _checked;
              break;
            case "AllowQuotes":
              _checked = allowQuotes;
              _settings.set({
                AllowQuotes: _checked
              });
              Global.Preference.AllowQuotes = _checked;
              break;
            case "AllowOrders":
              _checked = allowOrders;
              _settings.set({
                AllowOrders: _checked
              });
              Global.Preference.AllowOrders = _checked;
              break;
            case "AllowReturns":
              _checked = allowReturns;
              _settings.set({
                AllowReturns: _checked
              });
              Global.Preference.AllowRetruns = _checked;
              break;
            case "AllowChangePrice":
              _checked = this.allowChangePrice;
              _settings.set({
                AllowChangePrice: _checked
              });
              break;
            case "AllowChangePaymentTerm":
              _checked = this.allowChangePaymentTerm;
              _settings.set({
                AllowChangePaymentTerm: _checked
              });
              break;
            case "AllowChangeTaxCode":
              _checked = this.allowChangeTaxCode;
              _settings.set({
                AllowChangeTaxCode: _checked
              });
              break;
            case "AllowAddCustomer":
              _checked = this.allowAddCustomer;
              _settings.set({
                AllowAddCustomer: _checked
              });
              break;
            case "TaxByLocation":
              _checked = this.taxByLocation;
              _settings.set({
                TaxByLocation: _checked
              });
              break;
            case "ShowCouponList":
              _checked = this.showCouponList;
              _settings.set({
                ShowCouponList: _checked
              });
              break;
            case "IsUseItemDescription":
              _checked = this.isUseItemDescription;
              _settings.set({
                IsUseItemDescription: _checked
              });
              break;
            case "IsDepositPayment":
              _checked = this.isDepositPayment;
              _settings.set({
                IsDepositPayment: _checked
              });
              break;
            case "IsUseCustomerShipToPaymentType":
              _checked = this.isUseCustomerShipToPaymentType;
              _settings.set({
                IsUseCustomerShipToPaymentType: _checked
              });
              break;
            case "IsUsePOSShippingMethod":
              _checked = this.isUsePOSShippingMethod;
              _settings.set({
                IsUsePOSShippingMethod: _checked
              });
              break;
            case "UseForcePayment":
              _checked = this.useForcePayment;
              _settings.set({
                UseForcePayment: _checked
              });
              break;
            case "IsAllowViewZXTape":
              _checked = this.isAllowViewZXTape;
              _settings.set({
                IsAllowViewZXTape: _checked
              });
              break;
            case "IsOverrideSalesRep":
              _checked = this.isOverrideSalesRep;
              _settings.set({
                IsOverrideSalesRep: _checked
              });
              break;
            case "ShowWholesalePrice":
              _checked = this.showWholesalePrice;
              _settings.set({
                ShowWholesalePrice: _checked
              });
              break;

              //Misc * BEGIN * 12/7/2012
            case "AutoSignOutUser":
              _checked = this.autoSignOutUser;
              _settings.set({
                AutoSignOutUser: _checked
              });
              break;
            case "TrackDrawerBalance":
              _checked = this.trackDrawerBalance;
              _settings.set({
                TrackDrawerBalance: _checked
              });
              Global.TrackDrawerBalance = _checked;
              break;
            case "BlindClose":
              _checked = this.blindClose;
              _settings.set({
                BlindClose: _checked
              })
              Global.Preference.BlindClose = _checked;
              break;
            case "UseCashDrawer":
              _checked = this.useCashDrawer;
              _settings.set({
                UseCashDrawer: _checked
              });
              break;
              //Misc * END * 12/7/2012
            case "IsUseISEImage": //added by PR.Ebron(03.22.13) >> INTMOBA-810 >> ISE web images
              _checked = this.isUseISEImage;
              _settings.set({
                IsUseISEImage: _checked
              });
              break;
            case "AllowChangeClassTemplate":
              _checked = this.allowChangeClassTemplate;
              _settings.set({
                AllowChangeClassTemplate: _checked
              });
              break;
            case "AllowTaxOnLineItems":
              _checked = this.allowTaxOnLineItems;
              _settings.set({
                AllowTaxOnLineItems: _checked
              });
              break;

              //VER. 14
            case "AskForCustomerPO":
              _checked = this.askForCustomerPO;
              _settings.set({
                AskForCustomerPO: _checked
              });
              break;
            case "AskForShipDate":
              _checked = this.askForShipDate;
              _settings.set({
                AskForShipDate: _checked
              });
              break;
            case "AskForSource":
              _checked = this.askForSource;
              _settings.set({
                AskForSource: _checked
              });
              break;
            case "IsTrackStorePickUp":
              _checked = this.trackStorePickUp;
              _settings.set({
                IsTrackStorePickUp: _checked
              });
              break;
            case "IsAutoAdjustmentStock":
              _checked = this.isAutoAdjustmentStock;
              _settings.set({
                IsAutoAdjustmentStock: _checked
              });
              break;

          }
        });
      this.preferenceCollection.reset(_settings);
    },

    isRedirectToReceipts: false,

    ValidateData: function() {
      if (!this.preferenceCollection) {
        return true;
      }
      var _settings = this.preferenceCollection.at(0);

      if (!_settings.get("WorkstationID")) {
        console.log("WorkstationID must not be null");
        navigator.notification.alert("Workstation ID must not be empty.", null, "Workstation ID is Required", "OK");
        Global.BackToMain = false;
        return false;
      } else if (!_settings.get("DefaultCustomer")) {
        console.log("Default Customer must not be null");
        navigator.notification.alert("Default Customer must not be empty.", null, "Default Customer is Required", "OK");
        Global.BackToMain = false;
        return false;
      } else if(!_settings.get("IsUseCustomerShipToPaymentType") && (!_settings.get("PaymentType"))){
            navigator.notification.alert("Default Payment Type must not be empty.", null, "Default Payment Type is Required", "OK");
            Global.BackToMain = false;
            return false;
      } else if(_settings.get("IsUsePOSShippingMethod") && (!_settings.get("POSShippingMethod"))){
        navigator.notification.alert("Default Shipping Method must not be empty.", null, "Default Shipping Method is Required", "OK");
        Global.BackToMain = false;
        return false;
      } else if (!_settings.get("DefaultLocation")) {
        console.log("Default Location must not be null");
        navigator.notification.alert("Default Location must not be empty.", null, "Default Location is Required", "OK");
        Global.BackToMain = false;
        return false;
      } else if (_settings.get("IsUseISEImage") && (_settings.get("WebSiteCode") === null || _settings.get("WebSiteCode") === undefined || _settings.get("WebSiteCode") === "")) {
        this.NotifyMsg("The CBE Image is turned ON. Please specify a website first.", "Website is Required");
        Global.BackToMain = false;
        return false;
      } else if (!Global.isBrowserMode && _settings.get("UseCashDrawer") && (Shared.IsNullOrWhiteSpace(Global.Printer.IpAddress) && Shared.IsNullOrWhiteSpace(Global.Printer.PrinterModel))) {
        if (!this.isRedirectToReceipts) {
          navigator.notification.confirm("You must set the printer IP first in order to enable Use Cash Drawer. Would you like to be redirected to the Receipt settings instead?.", (_this.goToReceipts), "Required Action", "Yes,No");
        } else {
          this.preventSaveCompleted = true;
          this.isRedirectToReceipts = false;

          return true;
        }
      } else {
        return true;
      }
    },



    //navigator.notification.confirm("The Workstation ID you entered doesn't exist. Instead would you like it to be added as a new Workstation?", (self.ToBeAdded), "Workstation ID doesn't exist.","Yes,No");

    ForceCloseWorkstationConfirmation: function(button) {
      if (button === 1) {
        Global.Preference.TrackDrawerBalance = false;
        if (Global.Preference.UseCashDrawer === true) {
          Global.isOkToOpenCashDrawer = true;
        }
        if (!Global.Preference.TrackDrawerBalance && Global.Status.IsOpen) {
          _this.preventSaveCompleted = true;
          _this.UpdateCollection();
          _this.Save();
          Global.ClosingWorkStation = true;
          _this.trigger("showClosingAmount", _this);

        }
        //_this.LoadCloseWorkstation()

      } else {
        Global.Preference.TrackDrawerBalance = true;
        // trackDrawerBalance.on();
        _this.SetChkState('TrackDrawerBalance', true);
        return;
        //_workstation.FetchWorkstation(100, criteria);
      }
    },

    EnableISEImageSettings: function(_enable) {
      if (!_enable) {
        //$("#website-preference-btn").addClass('ui-disabled');
        $("#image-size-preference-btn").addClass('ui-disabled');
        $("#image-size-preference-btn").css('opacity', '1');
        $("#IsUseISEImageLabel").css('background-color','#FFF');
      } else {
        //$("#website-preference-btn").removeClass('ui-disabled');
        $("#image-size-preference-btn").removeClass('ui-disabled');
        // $("#image-size-preference-btn").css('display','block');
        $("#IsUseISEImageLabel").css('background-color','#E2E2E2');
      }
      this.preferenceCollection.at(0).set({
        IsUseISEImage: _enable
      });
    },

    IsWebSiteURLSpecified: function() {
      var _isUseISEImage = this.preferenceCollection.at(0).get("IsUseISEImage");
      if (!_isUseISEImage) return true;
      else {
        var _websiteCode = this.preferenceCollection.at(0).get("WebSiteCode");
        if (_websiteCode === null || _websiteCode === undefined || _websiteCode === "") {
          this.NotifyMsg("The CBE Image is Turned ON. Please specify a website first.", "Website is Required");
          return false;
        }
        return true;
      }
    },

    //checks if the default location is active.
    ValidateDefaultLocation: function(collection) {
      var _settings = this.preferenceCollection.at(0);
      var _location = _settings.get("DefaultLocation");
      var _locationArray = _.pluck(collection, "WarehouseCode");
      var _validLocation = _.contains(_locationArray, _location);
      if (!_validLocation) {
        this.NotifyMsg("The Current Status of the Default Location is Inactive. Please change your Default Location.", "Invalid Location");
        Global.ValidLocation = false;
      } else {
        Global.ValidLocation = true;
      }
    },

    NotifyMsg: function(content, header) {
      console.log(content);
      navigator.notification.alert(content, null, header, "OK");
    },

  });

  return GeneralSettingsView;
});
