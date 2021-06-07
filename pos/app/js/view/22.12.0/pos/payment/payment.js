/**
 * Connected Business | 05-8-2012
 * Required: el, collection
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'model/base',
  'collection/base',
  'shared/enum',
  'shared/global',
  'shared/method',
  'shared/service',
  'shared/shared',
  'model/postal',
  'model/country',
  'collection/postal',
  'collection/countries',
  'view/22.12.0/pos/keypad/keypad',
  'view/22.12.0/pos/payment/gift',
  'view/22.12.0/pos/payment/loyaltypoints',
  'view/22.12.0/pos/postal/addpostal',
  'text!template/22.12.0/pos/payment/payment.tpl.html',
  'text!template/22.12.0/pos/payment/cash.tpl.html',
  'text!template/22.12.0/pos/payment/check.tpl.html',
  'text!template/22.12.0/pos/payment/creditcard.tpl.html',
  'view/spinner',
  'js/libs/jSignature.min.js',
  'js/libs/moment.min.js',
  'js/libs/format.min.js'
], function($, $$, _, Backbone, BaseModel, BaseCollection, Enum, Global, Method, Service, Shared,
  PostalModel, CountryModel,
  PostalCollection, CountryCollection,
  KeypadView, GiftView, LoyaltyView, AddPostalView,
  template, CashTemplate, CheckTemplate, CreditCardTemplate, Spinner) {
  var _timeOut, _timeOut1, _track1, _ksn, _magnePrint, _magnePrintStatus;
  var _amountPaid, _paymentForm;
  var _view;
  var confirmAddPostal = function(button) {
    if (button == 1) {
      _view.AddNewPostal();
    } else {
      _view.ClearPostalDetails();
    }
  }
  var PaymentView = Backbone.View.extend({
    _template: _.template(template),
    _cashTemplate: _.template(CashTemplate),
    _checkTemplate: _.template(CheckTemplate),
    _creditCardTemplate: _.template(CreditCardTemplate),

    events: {
      "tap #keypad-done-btn": 'btnSave_tap',
      "tap #cmdDone": 'btnSave_tap',
      "tap #btn-cancelPayment": 'btnClose_tap',
      "tap .btn-clear-signature": 'btnClearSignature_tap',
      "tap #cc-swipe": "btnUni",
      "change #cc-msg": "processMsg",
      "change #isUnimag": "checkUnimag",
      "tap #btn-more": "btnLoadMoreInfo_tap",

      "change #ccCountry": "CountryChanged",
      "change #ccCity": "CityChanged",
      "keyup #ccPostal": "keyupPostal",
      "blur  #ccPostal": "blurPostal",
      "blur #ccEmail": "blurEmail",
      "keydown #ccPhone": "txtPhone_Keydown",
      "keyup #cardNumber": "cardNumber_keyup",
      //events below are added for CSL - 8822
      "focus #cardNumber": "AssignNumericValidation",
      "focus #cvNumber": "AssignNumericValidation",
      "focus #ccPhoneExt": "AssignNumericValidation",
      "focus #ccPhone": "AssignNumericValidation",

      "tap #btn-ask-to-sign": "btn_AskToSign",
      "tap #btn-stop-asking": "btnCancel_Retrieval",

      "blur #expDate": "ExpDate_blur",
      "keydown #ccPhone": "CCPhone_keydown",
      "keydown #expDate": "ExpDate_keydown",
    },

    ExpDate_keydown: function(e) {
      if (!Global.isBrowserMode) return;
      if (e.keyCode == 9) {
        $('#cvNumber').focus();
        e.preventDefault();
        return false;
      }
    },

    CCPhone_keydown: function(e) {
      if (!Global.isBrowserMode) return;
      if (e.keyCode == 9) {
        $('#ccPhoneExt').focus();
        e.preventDefault();
        return false;
      }
    },

    ExpDate_blur: function() {
      $('#cvNumber').focus();
    },

    btn_AskToSign: function(e) {
      e.preventDefault();
      this.$('.btn-ask-to-sign').attr('id', 'btn-stop-asking');
      _showActivityIndicator();
      this.trigger("allowUserToAttachSign", "Payment", this);
    },

    btnCancel_Retrieval: function(e) {
      e.preventDefault();
      console.log('btnCancel_Retrieval');

      this.$('.btn-ask-to-sign').attr('id', 'btn-ask-to-sign');
      _revertTextBack();
      this.trigger("cancelSignRetrieval", "Refund", this);
    },

    SketchSignature: function(base64String) {
      _revertTextBack();
      signatureHasChanges = true;
      this.sketchView = true;
      this.ShowSignatureDisplay();
      this.LoadSignature(base64String);
    },

    LoadSignature: function(signatureSVG) {
      if (signatureSVG != null) {
        var i = new Image();
        i.src = "data:image/svg+xml;base64," + signatureSVG
        this.$(".signatureDisplay").html($(i));
      }
    },

    ShowSignatureDisplay: function() {
      if (this.sketchView) {
        this.$(".signature").jSignature("reset");
        this.$(".signature").hide();
        this.$(".signatureDisplay").show();
      }
    },

    keyupPostal: function(e) {
      if (e.keyCode === 13) {
        this.keyupIsTriggered = true;
        var postal = $("#ccPostal").val();
        this.LoadPostal(postal);
      }
    },

    AssignNumericValidation: function(e) {
      if (!Global.isBrowserMode) Shared.Input.NonNegativeInteger('#' + e.target.id);
    },

    blurPostal: function(e) {
      if (Shared.IsNullOrWhiteSpace(this.keyupIsTriggered)) {
        var postal = $("#ccPostal").val();
        this.LoadPostal(postal);
      }
      this.keyupIsTriggered = false;
    },

    blurEmail: function(e) {
      var email = $("#ccEmail").val();

      if (Shared.ValidateEmailFormat(email)) {
        navigator.notification.alert("Email format is invalid.", null, "Invalid Email", "OK");
        return;
      }
    },

    txtPhone_Keydown: function(e) {
      var c = e.keyCode;
      if (c == 8 || (c > 47 && c < 58) || (c > 95 && c < 106)) return;
      else e.preventDefault();
    },

    cardNumber_keyup: function(e) {
      if (e.keyCode === 13) {
        var cardNumber = $('#cardNumber').val();
        if (Global.isBrowserMode) {
          if (cardNumber.length > 16) {
            this.isUnimag = false;
            Shared.CreditCard.ParseCreditCardMagWithValidation(cardNumber, this.isUnimag);
          }
        }
      }
    },

    checkUnimag: function(e) {
      e.preventDefault();
      var unimag = $("#isUnimag").text();
      console.log("IsUnimag :" + unimag);
      if (Global.isBrowserMode) {
        $("#cc-msg").text("Enter Credit card details.");
      } else {
        if (unimag === "true") $("#cc-msg").text("Establishing connection...");
      }
    },

    btnClearSignature_tap: function(e) {
      e.preventDefault();
      this.ClearSignature();
    },

    ClearSignature: function() {
      var _svg = Global.Signature;
      if (this.sketchView) {
        this.$(".signature").show();
        this.$(".signatureDisplay").hide();
        if (_svg) {
          if (_svg.indexOf("[SVGID]:") !== -1) this.trigger("deleteSavedSignature", Global.Signature, this);
          else Global.Signature = null;
        }
      } else {
        this.$(".signature").jSignature("reset");
      }
      this.sketchView = false;
      signatureHasChanges = false;
    },

    btnSave_tap: function(e) {
      e.preventDefault();
      if (this.IsWaiting()) {
        navigator.notification.alert("Waiting for customer's signature", null, "Invalid Action", "OK");
        return;
      }
      if ($('#keypad-done-btn').hasClass('keypad-btn-faded')) return;
      this.SavePayment();
    },

    btnClose_tap: function(e) {
      e.preventDefault();
      if (this.giftView) {
        if (this.giftView.IsWaiting()) return;
      }
      if (this.CheckIfShowSignature()) {
        if (this.IsWaiting()) {
          navigator.notification.alert("Waiting for customer's signature", null, "Invalid Action", "OK");
          return;
        }
      }

      this.Close();
      $("#main-transaction-blockoverlay").hide();
    },

    CheckIfShowSignature: function() {
      var _showSignature = false
      if (Global.PaymentType == Enum.PaymentType.Check) {
        _showSignature = Global.Preference.RequireSignatureOnCheck;
      }
      if (Global.PaymentType == Enum.PaymentType.CreditCard) {
        _showSignature = Global.Preference.RequireSignatureOnCreditCard;
      }

      return _showSignature;
    },

    IsWaiting: function() { //jj15
      return this.$('#signature').hasClass('ui-disabled');
    },

    btnLoadMoreInfo_tap: function(e) {
      e.preventDefault();

      switch (e.currentTarget.innerHTML) {
        case "More":
          $("#paymentAdditionalFields").show();
          $("#paymentPrimaryFields").hide();
          $(".signature-container").css("visibility", "hidden");
          $("#cc-msgContainer").css("visibility", "hidden");
          $("#btn-more").text("Back");
          this.InitializePostal();
          this.InitializeCountry();
          $("#ccPostal").focus();
          break;
        case "Back":
          $("#paymentAdditionalFields").hide();
          $("#paymentPrimaryFields").show();
          $(".signature-container").css("visibility", "visible");
          $("#cc-msgContainer").css("visibility", "visible");
          $("#btn-more").text("More");
          $("#cardNumber").focus();
          break;
      }
    },

    btnUni: function(e) {
      e.preventDefault();
      if (Global.isBrowserMode) {
        $("#cardNumber").focus();
        this.RequestSwipe("Please swipe card.");
        Shared.CreditCard.ClearCreditCardInfo();
        $('#expDate').removeClass("ui-disabled");
      } else {
        var unimag = $("#isUnimag").text();

        if (unimag === "true") {
          this.RequestSwipe("Please swipe card.");
        } else {
          this.LoadUnimagPlugin();
        }
      }

    },

    processCard: function(e) {
      e.preventDefault();
      console.log("CHANGED CARD");

      this.HideActivityIndicator();

      $(".keypad").removeClass("ui-disabled");

      $(".left-popover-btn").removeClass("ui-disabled");

      $(".right-popover-btn").removeClass("ui-disabled");
    },

    processMsg: function(e) {
      e.preventDefault();
      this.HideActivityIndicator();


      var msg = $("#cc-msg").text();

      var t1 = $("#track1").text();

      var t2 = $("#track2").text();

      var ksn = $("#ksn").text();

      var magnePrint = $("#magnePrint").text();

      var magnePrintStatus = $("#magnePrintStatus").text();

      console.log("Payment: " + msg);
      if (msg === "Card unreadable. Try again.") {
        this.RequestSwipe("Please swipe card again.");
      } else if (msg === "Successfully retrieved credit card information.") {
        if (t1 === "" && t2 === "" && ksn === "") {
          console.log("Unable to read card information.");
          $("#cardNumber").val("");

          Shared.SetDefaultToday("#expDate", "YYYY-MM");

          $("#cardName").val("");

          $("#track1").text("");

          $("#track2").text("");

          $("#ksn").text("");

          $("#magnePrint").text("");

          $("#magnePrintStatus").text("");

          if (!Global.isBrowserMode) navigator.notification.alert("Unable to get credit card information. Please swipe again.", null, "Unable to Proceed", "OK");
        }
      }
    },

    CountryChanged: function(e) {
      var _id = e.target.id;
      var _val = $('#' + _id).val();
      var _postalVal = $('#ccPostal').val();
      if (this.countrySelected != _val) {
        if (_postalVal.length > 0) {
          this.ClearPostalInfo();
        }
      }
      this.countrySelected = _val;
      this.PreviousCountrySelected = _val;
      //this.FetchClassCodes(_val);
    },

    CityChanged: function(e) {
      e.preventDefault();

      this.SetState();
    },

    initialize: function() {
      var _showForm = this.options.showForm;
      this.transactionBalance = this.options.balance;
      _view = this;
      if (_showForm) {
        this.render();
        this.InitializeSignature();
        this.SetFocusedField();
      }
      this.on("processPINCaptured", this.TiggerPopulateTextFields);
    },

    render: function() {
      /*jj*/
      _paymentForm = this;
      var _balance = this.transactionBalance;
      if (_balance >= 10000000000) {
        navigator.notification.alert("Total exceeded the allowed maximum amount of 10,000,000,000.00", null, "Error", "OK");
      } else {
        this.$el.html(this._template({
          PaymentType: Global.PaymentType
        }));
        if (Global.TermDiscount > 0) this.$("#term-discount").text("Term Discount " + Global.CurrencySymbol + Global.TermDiscount.toFixed(2)).show();

        this.InitializePaymentDetail();
        this.ToggleFields();
        $("#main-transaction-blockoverlay").show();
      }
      this.countrySelected = null;
      if (Global.isBrowserMode) this.BindLastElement();
      if (!Global.isBrowserMode) this.ActivateUnimagPlugin();
      if(Global.PaymentType == Enum.PaymentType.CreditCard){
          if(Global.TransactionType == Enum.TransactionType.SalesRefund) {         
            $("#cc-msgContainer").hide();
            $("#authorizationNumber").addClass('ui-disabled');
            $("#cardReferenceNumber").addClass('ui-disabled');
            
          } 
          else if (Global.TransactionType == Enum.TransactionType.Return) {         
            $("#cc-msgContainer").show(); 
            $("#authorizationNumber").addClass('ui-disabled');
            $("#cardReferenceNumber").addClass('ui-disabled');
           
           }
          else {          
            $("#cc-msgContainer").show();
            $("#authorizationNumber").removeClass('ui-disabled');
            $("#cardReferenceNumber").removeClass('ui-disabled');

        } 
        
      }
     
    },

    BindLastElement: function() {
      if (!Global.isBrowserMode) return;
      $('#paymentBody input:visible:last').on('keydown', function(e) {
        if (e.keyCode == 9) {
          $('#paymentBody input:visible:first').focus();
          e.preventDefault();
          return false;
        }
      });
    },

    //added by PR.Ebron 1.2.12 for lock screen bug.
    RemoveScreenOverLay: function() {
      $("#main-transaction-blockoverlay").hide();
    },

    LoadUnimagPlugin: function() {
      Shared.NMIPaymentGateway.ActivateUnimag();
      Shared.NMIPaymentGateway.isConnected();

      //CSL-25082 FEB.28.2014
      var self = this;
      $("#cc-msg").off("failedToDetectDevice");
      $("#cc-msg").on("failedToDetectDevice", function() {
        navigator.notification.confirm("The device was not detected, would you like to try again?", function(button) {
          if (button == 1) {
            console.log("Attemping to detect device.");
            Shared.NMIPaymentGateway.DeactivateUnimag();
            self.LoadUnimagPlugin();
          }
        }, "Unable to Detect Device", ['Yes', 'No']);
      });
    },

    InitializePaymentDetail: function() {
      switch (Global.PaymentType) {
        case Enum.PaymentType.Cash:
          this.InitializeCashPayment();
          break;
        case Enum.PaymentType.Check:
          this.InitializeCheckPayment();
          break;
        case Enum.PaymentType.CreditCard:
          this.InitializeCreditCardPayment();
          break;
        case Enum.PaymentType.Gift:
          this.InitializeGiftPayment();
          break;
        case Enum.PaymentType.Loyalty:
          this.InitializeLoyaltyPayment();
          break;
      }
      this.$(".paymentDetails").trigger("create");
      if (Global.PaymentType != Enum.PaymentType.Loyalty) {
        this.InitializeKeypadView();
        $(".complete-btn-container").removeClass("loyaltyBtn");
        $("#keypad-done-btn").show();
        $("#btn-donePayment").hide();
      } else {
        $(".complete-btn-container").addClass("loyaltyBtn");
        $("#keypad-done-btn").hide();
        $("#btn-donePayment").show();
      }
      this.ToggleSize();
    },

    InitializePostal: function() {
      if (!this.postalmodel) this.postalmodel = new PostalModel();

      if (!this.postalCollection) this.postalCollection = new PostalCollection();
    },

    LoadPostal: function(postal) {
      if (postal == "") {
        this.ClearCity();
      } else {

        var self = this;
        Shared.LoadPostalByCode(postal,
          function(collection) {
            self.postalCollection.reset(collection);
            self.DisplayResultOnPostal(postal);
          },
          function(error) {
            self.postalCollection.reset();
            self.postalCollection.RequestError(error, "Error Loading Postal Code");
            $("#ccPostal").val("");
          });
      }
    },

    AddNewPostal: function() {
      var _el = $("#addPostalCodeContainer");
      var _postal = $("#ccPostal").val();
      var country = $("#ccCountry option:selected").val();
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
      this.newPostalView.Show(_postal, country, this.countryCollection);
    },

    AcceptPostal: function(response) {
      this.disableEnter = false;
      this.countrySelected = response.CountryCode;
      this.SetSelectedCountry(this.countrySelected);
      $("#ccPostal").val(response.PostalCode);
      $("#ccCity").val(response.StateCode);
      this.postal = response.PostalCode;
      this.city = response.City;
      this.LoadPostal(this.postal, this.city);
    },

    ClearPostalDetails: function() {
      this.disableEnter = false;
      $("#ccPostal").val("");
      this.postal = "";
      this.ClearCity();
    },

    DisplayResultOnPostal: function(postal) {
      this.newCollection = new PostalCollection();
      this.postalCollection.each(this.RemoveInvalidPostals, this);
      this.postalCollection = this.newCollection;
      if (this.postalCollection.length === 0) {
        this.disableEnter = true;
        navigator.notification.confirm("The Postal Code '" + postal + "' does not exist in the Country selected. Do you want to add '" + postal + "' ?", confirmAddPostal, "Postal Not Found", ['Yes', 'No']);
      } else {
        $('#ccCity > option[val !=""]').remove();
        this.LoadRetrievedPostal();
        $("#ccCity").prop("selectedIndex", 0);
        $("#ccCity").trigger('change');
      }

    },

    LoadRetrievedPostal: function() {
      this.postalCollection.each(this.SetFields, this);
    },

    RemoveInvalidPostals: function(model) {
      var _country = model.get("CountryCode");
      if (_country === this.countrySelected) {
        this.newCollection.add(model);
      }
    },

    ClearPostalInfo: function() {
      $("#ccPostal").val("");
      $("#ccState").val("");
      this.ClearCity();
    },

    ClearCity: function() {
      $('#ccCity > option[val !=""]').remove();
      $('#ccCity').append(new Option("City...", ""));
      $("#ccCity").prop("selectedIndex", 0);
      $("#ccCity").trigger('change');
      $("#ccState").val("");
    },

    SetState: function() {

      var _city = $("#ccCity option:selected").val();
      if (_city != "") {
        var _model = this.postalCollection.find(function(model) {
          return _city = model.get("City");
        });
        var _state = _model.get("StateCode");
        $("#ccState").val(_state);
      } else {
        $("#ccState").val("");
      }

    },

    SetFields: function(postal) {
      var city = postal.get("City");
      $('#ccCity').append(new Option(city, city));

      $('#ccCity').selectmenu("refresh", true);

      this.SetState();
    },

    InitializeCountry: function() {
      if (!this.countryModel) {
        this.countryModel = new CountryModel();
        this.countryModel.on('sync', this.SuccessCountryLookupResult, this);
        this.countryModel.on('error', this.ErrorCountryLookupResult, this);
      }

      if (!this.countryCollection) {
        this.countryCollection = new CountryCollection();
        this.countryCollection.on('reset', this.DisplayCountries, this);
        this.LoadCountry();
      } else if (this.countryCollection.length === 0) {
        this.LoadCountry();
      } else {
        this.ReloadCountry(this.countryCollection);
      }
    },

    LoadCountry: function() {
      _rows = 10000;
      this.index = 0;
      this.countryModel.set({
        Criteria: ""
      });

      this.countryModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.COUNTRYCODELOOKUP + _rows;

      this.countryModel.save();
    },

    SuccessCountryLookupResult: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.countryCollection.reset(response.Countries);
    },

    ErrorCountryLookupResult: function(model, error, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      model.RequestError(error, "Error Loading Country List");
    },

    DisplayCountries: function(collection) {
      if (collection.length === 0) {
        console.log("no countries available.");
        navigator.notification.alert("No country available.", null, "No Country Found", "OK");
      } else {
        this.ReloadCountry(collection);
      }
    },

    LoadRetrievedCountry: function(collection) {
      collection.each(this.SetCountryOptions, this);
      $("#ccCountry").selectmenu('refresh', true);
    },

    SetCountryOptions: function(country) {
      var countryCode = country.get("CountryCode");
      $('#ccCountry').append(new Option(countryCode, countryCode));
    },

    ReloadCountry: function(collection) {
      $('#ccCountry > option[val !=""]').remove();
      this.LoadRetrievedCountry(collection);

      if (this.countrySelected === null || this.countrySelected === undefined) {
        this.countrySelected = (Global.CurrentCustomer.Country) ? Global.CurrentCustomer.Country : Global.ShipTo.Country;
      }

      this.SetSelectedCountry(this.countrySelected);
    },

    SetSelectedCountry: function(country) {
      $("#ccCountry > option[value='" + country + "']").attr("selected", "selected");
      $("#ccCountry").selectmenu('refresh', true);
    },

    InitializeCashPayment: function() {
      // $(".paymentDetails").html(this._cashTemplate({Balance: this.transactionBalance}));
    },

    InitializeCheckPayment: function() {
      $(".paymentDetails").html(this._checkTemplate({
        Balance: this.transactionBalance
      }));
    },

    InitializeCreditCardPayment: function() {
       if (!Global.OfflineCharge) {
          $(".paymentDetails").html(this._creditCardTemplate({
            NameOnCard: Global.CurrentCustomer.CustomerName,
            Balance: this.transactionBalance
              }));
          Shared.BrowserModeDatePicker("#expDate", "datepicker", "yy-mm");
          if (Global.isBrowserMode) $("#cardNumber").focus();
          $("#cc-msg").text("Enter Credit card details.");
       }
    },

    InitializeGiftPayment: function() {
      if (this.giftView) {
        this.giftView.unbind();
        this.giftView.remove();
      }
      $(".paymentDetails").html("<div></div>");
      this.giftView = new GiftView({
        el: ".paymentDetails div"
      });

      this.giftView.on('askToEnterPIN', this.TriggerAskToEnterPIN, this);
      this.giftView.on('stopAskingPIN', this.TriggerStopPINRetrieval, this);
      this.giftView.on('changeKeypadAmount', this.GiftChangeKeypadAmount, this);
    },

    GiftChangeKeypadAmount: function(value) {
      var balance = this.transactionBalance;
      if (value > balance) {
        //  value 500 > balance 50
        this.keypadView.SetAmount(balance.toString());
      } else {
        //  value 50 < balance 500
        this.keypadView.SetAmount(value.toString());
      }

    },

    PopulatePINFields: function(pin) {
      if (this.giftView) this.giftView.PopulatePINFields(pin);
    },

    TriggerAskToEnterPIN: function(pinType) {
      this.trigger('askToEnterPIN', pinType, this);
    },

    TriggerStopPINRetrieval: function() {

      this.trigger('stopAskingPIN', 'payment', this);
    },

    InitializeLoyaltyPayment: function() {
      if (!Shared.IsNullOrWhiteSpace(this.loyaltyView)) {
        this.loyaltyView.unbind();
      }
      var self = this;
      console.log("Balance : " + this.transactionBalance);
      this.loyaltyView = new LoyaltyView({
        el: ".paymentDetails"
      });
      this.loyaltyView.paymentCollection = this.collection;
      this.loyaltyView.render(this.transactionBalance);
    },

    ToggleSize: function() {
      var _showSignature = false;
      switch (Global.PaymentType) {
        case Enum.PaymentType.Cash:
          this.$("#paymentBody").addClass("cashPayment");
          this.$(".paymentDetails").hide();
          break;
        case Enum.PaymentType.Check:
          _showSignature = Global.Preference.RequireSignatureOnCheck;
          if (_showSignature) {
            this.$("#paymentBody").addClass("checkPaymentWithSignature");
          } else {
            this.$("#paymentBody").addClass("checkPayment");
          }
          this.$(".keypad").addClass("keypadWithLeftPadding");
          break;

        case Enum.PaymentType.CreditCard:
          _showSignature = Global.Preference.RequireSignatureOnCreditCard;
              if (Global.OfflineCharge || Global.DejavooEnabled) {
                  this.$("#paymentBody").addClass("cashPayment");
                  this.$(".paymentDetails").hide();
              }
            else {
                if (_showSignature) {
                    this.$("#paymentBody").addClass("creditCardPaymentWithSignature");
                } else {
                    this.$("#paymentBody").addClass("creditCardPayment");
                }
                this.$(".keypad").addClass("keypadWithLeftPadding");
              }
             // if (_showSignature) {
             //        this.$("#paymentBody").addClass("creditCardPaymentWithSignature");
             //    } else {
             //        this.$("#paymentBody").addClass("creditCardPayment");
             //    }
             //    this.$(".keypad").addClass("keypadWithLeftPadding");

             
         
          break;
        case Enum.PaymentType.Gift:
          this.$("#paymentBody").addClass("giftPayment");
          this.$(".keypad").addClass("keypadWithLeftPadding");
          break;
        case Enum.PaymentType.Loyalty:
          this.$("#paymentBody").addClass("loyaltyPayment");
          break;
      }

      if (Global.PaymentType == Enum.PaymentType.Cash) return;
      else if (Global.PaymentType == Enum.PaymentType.Loyalty) this.AdjustPaymentBodyHeight(true)
      else this.AdjustPaymentBodyHeight();
    },

    DestroyCountryAndPostal: function() {
      if (this.postalModel) this.postalModel.clear();
      if (this.countryModel) this.countryModel.clear();

      if (this.countryCollection) this.countryCollection.reset(undefined, {
        silent: true
      });
      if (this.postalCollection) this.postalCollection.reset(undefined, {
        silent: true
      });
    },

    Close: function() {
      if (Global.PaymentType == Enum.PaymentType.CreditCard || Global.PaymentType == Enum.PaymentType.Check) {
        if (!Global.OfflineCharge) {
          if (this.CheckIfShowSignature()) this.ClearSignature();  
        }
      }
      Global.Signature = null;
      this.DestroyCountryAndPostal();
      this.Hide();
      $("#paymentContainer").removeClass("paymentFormLarge");
      this.trigger("formClosed", this); //v14
    },

    GetExistingNewLoyaltyPayment: function() {
      if (Global.PaymentType != Enum.PaymentType.Loyalty) return 0;
      if (!this.collection) return 0;
      if (this.collection.length == 0) return 0;
      var loyaltyPayment = this.collection.find(function(model) {
        return model.get("PaymentType") == Enum.PaymentType.Loyalty && model.get("IsNew") == true
      });
      if (loyaltyPayment) return parseFloat(loyaltyPayment.get("AmountPaid"));
      return 0;
    },

    Show: function(balance) {
      this.sketchView = false;
      this.cancelledPayment = false;
      this.transactionBalance = parseFloat(balance) + this.GetExistingNewLoyaltyPayment();
      this.render();
      this.$el.show();
      this.InitializeSignature();
      this.SetFocusedField();
    },

    Hide: function() {
      $(document).unbind('keydown');
      if (!this.isFullPayment) this.RemoveScreenOverLay();
      console.log("Payment Type: " + Global.PaymentType);
      this.DeactiveUnimag();
      this.$el.html("");
      this.$el.hide();
    },

    ActivateUnimagPlugin: function() {
      if (window.plugins != undefined) {
        if (Global.PaymentType === "Credit Card") {
          //window.plugins.cbUnimag = cordova.require(Global.Plugins.Unimag);
          if (!Global.isBrowserMode) this.LoadUnimagPlugin();
        }
      }

      var unimag = $("#isUnimag").text();

      if (unimag === "false") {
        $("#cc-msg").text("Device is not connected.");
      }
    },

    DeactiveUnimag: function() {
      if (window.plugins != undefined) {
        if (Global.PaymentType === "Credit Card") {
          //if(!Global.isBrowserMode) window.plugins.cbUnimag.DeactivateUnimag();
          if (!Global.isBrowserMode) Shared.NMIPaymentGateway.DeactivateUnimag();
        }
      }
    },

    InitializeSignature: function() {
      var _showSignature = false;
      signatureHasChanges = false;
      switch (Global.PaymentType) {
        case Enum.PaymentType.Check:
          _showSignature = Global.Preference.RequireSignatureOnCheck;
          break;
        case Enum.PaymentType.CreditCard:
          _showSignature = Global.Preference.RequireSignatureOnCreditCard;
          break;
      }

      if (_showSignature) {
        this.$(".signature-container").show();
        this.$(".signature").jSignature({
          height: "100px"
        });
        this.$(".signature").bind("change", this.SignatureChanged);
        $("#paymentContainer").addClass("paymentFormLarge");
      }
    },

    SignatureChanged: function(e) {
      signatureHasChanges = true;
    },

    MustOverwriteExistingGift: function() {
      if (Global.TransactionType == Enum.TransactionType.Order ||
        Global.TransactionType == Enum.TransactionType.UpdateOrder ||
        Global.TransactionType == Enum.TransactionType.ConvertQuote ||
        Global.TransactionType == Enum.TransactionType.ConvertOrder) return true;
      return false;
    },

    IsGiftAlreadyExist: function() {
      var isExist = false;
      if (Global.PaymentType == Enum.PaymentType.Gift && this.giftView) {
        var self = this;
        if (this.collection && this.collection.length > 0) {
          this.collection.each(function(model) {
            var isNew = model.get("IsNew") || false;
            var paymentType = model.get("PaymentType") || "";
            var serial = model.get("SerialLotNumber") || "";
            //if(!isExist && (isNew || self.MustOverwriteExistingGift()) && paymentType == Enum.PaymentType.Gift && serial.toUpperCase() == self.giftView.gift.get("SerialLotNumber").toUpperCase()) isExist = true; //old code
            if (!isExist && (isNew) && paymentType == Enum.PaymentType.Gift && serial.toUpperCase() == self.giftView.gift.get("SerialLotNumber").toUpperCase()) {
              if (!(Shared.IsNullOrWhiteSpace(isNew))) {
                isExist = true;
              }

            }
          });
        }
        if (isExist) {
          navigator.notification.confirm("This Gift Card/Certificate is already added as payment.\nWould you like to use this amount instead?", _changeGiftAmount, "Gift Exists", ['Yes', 'No']);
        }
      }
      return isExist;
    },

    ChangeGiftAmountToUse: function() {
      var _amountPaid = this.keypadView.GetAmount();
      if (this.collection && this.collection.length > 0) {
        var gcModel;
        var self = this;
        this.collection.each(function(model) {
          var isNew = model.get("IsNew") || false;
          var paymentType = model.get("PaymentType") || "";
          var serial = model.get("SerialLotNumber") || "";
          if (!gcModel && (isNew || self.MustOverwriteExistingGift()) && paymentType == Enum.PaymentType.Gift && serial.toUpperCase() == self.giftView.gift.get("SerialLotNumber").toUpperCase()) {
            if (!(Shared.IsNullOrWhiteSpace(isNew))) {
              gcModel = model;
            }
          }
        });
        if (gcModel) {
          this.collection.remove(gcModel);
          this.transactionBalance = this.options.GetTransactionBalance() || 0;
          this.SavePayment();
        }
      }
    },

    createForcePaymentGuid: function()
   {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  },

    ValidateGift: function(amountPaid, sender, callBack, args) {
      //JHZ! Validate Gift Payment
      if (Global.PaymentType == Enum.PaymentType.Gift) {
        if (!this.giftView) return false;
        return this.giftView.ValidateGift(amountPaid, sender, callBack, args);
      }
      return true;
    },

    SavePayment: function() {
      //var _amountPaid = $("#amountPaid").val();
      var _amountPaid;
      var _payment;
      if (Global.PaymentType == Enum.PaymentType.Loyalty) {
        _amountPaid = this.loyaltyView.monetaryPoints;
        _payment = this.loyaltyView.monetaryPoints;
        console.log("Amount Paid : " + _amountPaid);
      } else {
        _amountPaid = this.keypadView.GetAmount();
        _payment = this.keypadView.GetAmount()
      }

      var _email = $("#ccEmail").val();

      if (!this.ValidateGift(_amountPaid, this, 'SavePayment', arguments)) return;
      if (this.IsGiftAlreadyExist()) return;

      if (this.IsNumeric(_amountPaid)) {
        _amountPaid = this.GetTransactionPayment();
        if (this.ValidatePayment(Global.PaymentType, _amountPaid, _payment)) {
          if (this.ValidateSignature(Global.PaymentType)) {
            if (this.ValidateEmail(Global.PaymentType, _email)) {
              this.AddPayment(Global.PaymentType, _amountPaid);
            }
          }
        }
      }
    },

    ValidateEmail: function(paymentType, email) {
         if (Global.OfflineCharge) {
           return true;
         }
        else {
                   if (paymentType === Enum.PaymentType.CreditCard && email != "") {
                if (Shared.ValidateEmailFormat(email)) {
                  navigator.notification.alert("Email format is invalid.", null, "Invalid Email", "OK");
                  return false;
                } else {
                  return true;
                }
              } else return true;

        } 
     
    },

    ValidatePayment: function(paymentType, amount, payment) {
      if (!amount || amount === 0) {
        console.log("Please specify an amount.");
        navigator.notification.alert("Please specify an amount.", null, "Amount is Required", "OK");
        return false;
      }

      switch (paymentType) {
        case Enum.PaymentType.Check:
          var _checkNumber = $("#checkNumber").val();;
          if (_checkNumber.trim() === "") {
            console.log("Please enter the Check Number.");
            navigator.notification.alert("Please enter the Check Number.", null, "Check Number is Required", "OK");
            return false;
          }
          if (isNaN(_checkNumber)) {
            console.log("Please enter a valid Check Number");
            navigator.notification.alert("Please enter valid Check Number", null, "Check Number invalid", "OK");
            return false;
          }

          if (payment > amount) {
            console.log("Non-cash over payment is not allowed.");
            navigator.notification.alert("Non-cash over payment is not allowed.", null, "Invalid Payment", "OK");
            this.keypadView.SetAmount(this.transactionBalance.toFixed(2));
            return false;
          }

          break;
        case Enum.PaymentType.CreditCard:
          var _cardNumber = $("#cardNumber").val(),
            _expDate = $("#expDate").val(),
            _cardName = $("#cardName").val(),
            t1 = $("#track1").text(),
            t2 = $("#track2").text(),
            ksn = $("#ksn").text(),
            magnePrint = $("#magnePrint").text(),
            magnePrintStatus = $("#magnePrintStatus").text(),
            _isSwiped = $("#isSwiped").html(),
            authNumber = $("#authorizationNumber").val()
          _cv = $("#cvNumber").val();
          // card number must validate with or withouth auth number
          //if(authNumber.length == 0) {

            if (Global.OfflineCharge) {
                  if (payment > amount) {
                      console.log("Non-cash over payment is not allowed.");
                      navigator.notification.alert("Non-cash over payment is not allowed.", null, "Invalid Payment", "OK");
                      this.keypadView.SetAmount(this.transactionBalance.toFixed(2));
                      return false;
                    }
                    else return true;
            }

          else {

                if (authNumber.length > 0)  {
                    if (payment > amount) {
                      console.log("Non-cash over payment is not allowed.");
                      navigator.notification.alert("Non-cash over payment is not allowed.", null, "Invalid Payment", "OK");
                      this.keypadView.SetAmount(this.transactionBalance.toFixed(2));
                      return false;
                    }
                    else return true;
                }

                else {

                   if (_cardNumber.trim() === "") {
                    console.log("Please enter the Card Number.");
                    navigator.notification.alert("Please enter the Card Number.", null, "Card Number is Required", "OK");
                    return false;
                  } else if (_expDate.trim() === "") {
                    console.log("Please enter the Expiration Date.");
                    navigator.notification.alert("Please enter the Expiration Date.", null, "Expiration Date is Required", "OK");
                    return false;
                  } else if (_cardName.trim() === "") {
                    console.log("Please enter the Name on Card.");
                    navigator.notification.alert("Please enter the Name on Card.", null, "Name on Card is Required", "OK");
                    return false;
                  }

                  var _dateError = this.GetDateError(_expDate);
                  if (_dateError) {
                    console.log(_dateError);
                    navigator.notification.alert(_dateError, null, "Invalid Date", "OK");
                    return false;
                  }
                  //}


                  if (payment > amount) {
                    console.log("Non-cash over payment is not allowed.");
                    navigator.notification.alert("Non-cash over payment is not allowed.", null, "Invalid Payment", "OK");
                    this.keypadView.SetAmount(this.transactionBalance.toFixed(2));
                    return false;
                  }

                  if (authNumber.length == 0) {
                    if (_isSwiped == 'false' && _cardNumber.match(/^\d+$/) == null) {
                      navigator.notification.alert("Card Number is not valid.", null, "Invalid Payment", "OK");
                      return false;
                    }
                  }

                  if (isNaN(_cardNumber)) {
                    navigator.notification.alert("Please enter valid Card Number", null, "Card Number Invalid", "OK");
                    return false;

                  }
                  if (isNaN(_cv)) {
                    console.log("Invalid CV Number");
                    navigator.notification.alert("Please enter valid CV Number", null, "CV Number Invalid", "OK");
                    return false;
                  }

                }

           

          }

         
          break;
        case Enum.PaymentType.Gift:
          if (payment > amount) {
            console.log("Non-cash over payment is not allowed.");
            navigator.notification.alert("Non-cash over payment is not allowed.", null, "Invalid Payment", "OK");
            this.keypadView.SetAmount(this.transactionBalance.toFixed(2));
            return false;
          }
          break;

      }

      return true;
    },

    GetDateError: function(_expDate) {
      var _expDateYear = 0;
      var _expDateMonth = 0;
      var _today = new Date();
      var _mm = _today.getMonth() + 1; //January is 0!
      var _yyyy = _today.getFullYear();
      var _invalidFormat = false;
      var _expired = false;

      _expDate = _expDate.split("-");
      if (_expDate.length === 2) {
        _expDateYear = _expDate[0];
        _expDateMonth = _expDate[1];
        if (isNaN(_expDateMonth) || isNaN(_expDateYear)) {
          _invalidFormat = true;
        } else {
          _expDateYear = parseFloat(_expDateYear);
          _expDateMonth = parseFloat(_expDateMonth);
          if (_expDateMonth > 12 || _expDateMonth == 0) _invalidFormat = true;
          else {
            if (_expDateYear < _yyyy) _expired = true;
            else {
              if (_expDateYear == _yyyy && _expDateMonth < _mm) _expired = true;
            }
          }
        }
      } else {
        _invalidFormat = true;
      }

      if (_invalidFormat) return "Invalid Expiration Date format. Use YYYY-MM.";
      if (_expired) return "Card is already expired."
      return null;
    },

    ValidateSignature: function(paymentType) {
      switch (paymentType) {
        case Enum.PaymentType.Check:
          if (Global.Preference.RequireSignatureOnCheck && signatureHasChanges === false) {
            console.log("A signature from the customer is required.");
            navigator.notification.alert("A signature from the customer is required.", null, "Signature is Required", "OK");
            return false;
          }
          break;
        case Enum.PaymentType.CreditCard:
          if (!Global.OfflineCharge && Global.Preference.RequireSignatureOnCreditCard && signatureHasChanges === false) {
            console.log("A signature from the customer is required.");
            navigator.notification.alert("A signature from the customer is required.", null, "Signature is Required", "OK");
            return false;
          }
          break;
      }
      return true;
    },

    AddPayment: function(paymentType, amount) {
      if (amount === 0) {
        console.log("Please enter the Amount Paid.");
        navigator.notification.alert("Please enter the Amount Paid.", null, "Amount is Required", "OK");
        return false;
      } else {
        payment = this.CreatePayment(paymentType, amount);
        if (paymentType != Enum.PaymentType.Cash) {
          this.Close();
        }
      }
    },

    CreatePayment: function(paymentType, amount) {
      debugger;
      
      switch (paymentType) {
        case Enum.PaymentType.Cash:
          _amountPaid = amount;
          this.CheckCashPaymentChangeDue();
          break;
        case Enum.PaymentType.Check:
          this.AddCheckPayment(amount);
          break;
        case Enum.PaymentType.CreditCard:
          this.AddCreditCardPayment(amount);
          break;
        case Enum.PaymentType.Gift:
          this.AddGiftPayment(amount);
          break;
        case Enum.PaymentType.Loyalty:
          var toBeRemoved = this.collection.find(function(model) {
            return model.get("PaymentType") == Enum.PaymentType.Loyalty && model.get("IsNew") == true
          });
          var self = this;
          if (toBeRemoved) {
            navigator.notification.confirm("There's an existing Loyalty Payment in this transaction.\nWould you like to use this new amount instead?",
              function(button) {
                if (button == 1) self.DoAddLoyaltyPayment(toBeRemoved, amount);
                else {
                  self.isFullPayment = false;
                  self.Close();
                }
              },
              "Loyalty Payment Exists", ['Yes', 'No']);
            return;
          }
          this.AddLoyaltyPayment(amount);
          break;
      }
    },

    DoAddLoyaltyPayment: function(toBeRemoved, amount) {
      if (toBeRemoved) {
        this.transactionBalance = parseFloat(parseFloat((this.transactionBalance || 0) + parseFloat(toBeRemoved.get("AmountPaid") || 0)).toFixed(2));
        this.isFullPayment = (parseFloat(amount) >= this.transactionBalance);
        this.collection.remove(toBeRemoved)
      }
      this.AddLoyaltyPayment(amount);
    },

    AddLoyaltyPayment: function(amount) {
      this.collection.add({
        AmountPaid: amount,
        PaymentType: Enum.PaymentType.Loyalty,
        Account: this.GetPaymentAccountInfo(),
        IsNew: true,
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username
      });
      this.Close();
    },

    formatAmount: function(num) {
      var i = num.replace(",", "");
      var display = i.replace(",", "");
      var val = format("#,##0.00", display.replace(",", ""));
      return val;
    },

    AddCashPayment: function() {
      var self = this;
      this.collection.add({
        AmountPaid: _amountPaid,
        PaymentType: Enum.PaymentType.Cash,
        Account: this.GetPaymentAccountInfo(),
        IsNew: true,
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username,
        ChangeAmount: isNaN(self.lastChangeAmount) ? 0 : self.lastChangeAmount
      });
      this.Close();
    },

    AddCheckPayment: function(amount) {
      var _checkNumber = $("#checkNumber").val();
      var _signature = "";
      var _signatureContent = "";

      if (signatureHasChanges) {
        _signature = this.GetSignature();
        if (_signature.indexOf("[SVGID]:") !== -1) _signatureContent = Global.SignatureContent;
      }

      Global.Signature = null;

      this.collection.add({
        CheckNumber: _checkNumber,
        PaymentType: Enum.PaymentType.Check,
        AmountPaid: amount,
        Account: this.GetPaymentAccountInfo(),
        IsNew: true,
        SignatureSVG: _signature,
        SignatureSVGContent: _signatureContent,
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username
      });
    },

    AddGiftPayment: function(amount) {
      var giftType = "Gift Certificate";
      if (this.giftView.IsCard) giftType = "Gift Card";

      this.collection.add({
        AmountPaid: amount,
        PaymentType: Enum.PaymentType.Gift,
        Account: this.GetPaymentAccountInfo(),
        IsNew: true,
        CreditCode: this.giftView.gift.get("CreditCode"),
        SerialLotNumber: this.giftView.gift.get("SerialLotNumber"),
        GiftType: giftType,
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username
      });

      this.Close();
    },

    AddCreditCardPayment: function(amount) {
      var self = this;

      debugger;
      
      if (Global.DejavooEnabled) {
        self.trigger("showDejavooProgress", true);
        var request = Global.Preference.DejavooConnectionProtocol + "://";
        request += Global.Preference.DejavooConnectionTerminal + ":";
        request += Global.Preference.DejavooConnectionCGIPort + "/cgi.html?TerminalTransaction=";
        request += "<request>";
        request += "<PaymentType>Credit</PaymentType>";
        request += "<TransType>Sale</TransType>";
        request += "<Amount>" + parseFloat(amount).toFixed(2) + "</Amount>";
        request += "<Tip>0</Tip>";
        request += "<Frequency>" + Global.Preference.DejavooTransactionFrequency + "</Frequency>";
        request += "<InvNum></InvNum>";
        request += "<RefId>" + this.GenerateForceAuthorizationCode() + "</RefId>";
        request += "<RegisterId>" + Global.Preference.DejavooTransactionRegisterID + "</RegisterId>";
        request += "<AuthKey>" + Global.Preference.DejavooConnectionAuthKey + "</AuthKey>";
        request += "<PrintReceipt>" + (Global.Preference.DejavooTransactionPrintReceipt == 0 ? "No" : "Both") + "</PrintReceipt>";
        request += "<SigCapture>" + (Global.Preference.DejavooTransactionSignature == 0 ? "No" : "Yes") + "</SigCapture>";
        request += "</request>";
  
        var dejavooCollection = new BaseCollection();
        dejavooCollection.url = request;
        dejavooCollection.fetch({
          error: function(collection, error, response) {
            // var xmlDoc = $.parseXML(error.responseText);
            var xmlDoc = $.parseXML(error.responseText.replace(/[\n\r�]/g, ''));
            var response = $(xmlDoc);

            if (response.find("ResultCode").text()=="0") { 
              //Success
              var cardName, cardNumber, asterisk="*";
              var extData = response.find("ExtData").text().split(',');
              extData.forEach(function(data) {
                //Name on card
                if (data.includes("Name=")) {
                  cardName = data.replace(/%20/g, " ");
                  cardName = cardName.replace("Name=", "");
                  cardName = cardName.trim();
                }
                //Last 4 digit card number
                // if (data.includes("AcntLast4=")) {
                //   cardNumber = asterisk.repeat(12) + data.replace("AcntLast4=", "");
                // }
              });

              var authCode = response.find("AuthCode").text().trim();
              self.SaveCreditCardPayment(amount, authCode, cardName);
              self.trigger("showDejavooProgress", false);
             // self.trigger("clearTransaction", self);
            } else {
              //Failed
              $("#main-transaction-blockoverlay").hide();
              self.trigger("showDejavooProgress", false);
              navigator.notification.alert(response.find("Message").text(), null, 'Error', 'OK');
            }
          }
        });
      } else {
        self.SaveCreditCardPayment(amount, null);
      }
    },

    SaveCreditCardPayment: function(amount, dejavooAuthCode, dejavooCardName) {
      var monthArray = ["January", "February", "March", "April", "May",
        "June", "July", "August", "September", "October", "November", "December"
      ];

      var _cardNumber = $("#cardNumber").val();
      var  _expDate = $("#expDate").val();
      var _track1 = $("#track1").text();
      var _track2 = $("#track2").text();
      var _ksn = $("#ksn").text();
      var _magnePrint = $("#magnePrint").text();
      var  _magnePrintStatus = $("#magnePrintStatus").text();
      var _cv = $("#cvNumber").val();
      var  _country = $("#ccCountry option:selected").val();
      var  _postal = $("#ccPostal").val();
      var  _cardName = $.trim($("#cardName").val()) || Global.CurrentCustomer.CustomerName;
      var  _address = $("#ccAddress").val();
      var  _city = $("#ccCity option:selected").val();
      var _state = $("#ccState").val();
      var _phone = $("#ccPhone").val();
      var  _phoneExt = $("#ccPhoneExt").val();
      var  _email = $("#ccEmail").val(); 
      var _isSwiped = $("#isSwiped").html();
      var  _expDateYear = "";
      var _expDateMonth = "";
      var  _cardTransactionType = "";
      var  _signature = "";
      var _signatureContent = "";
      var _isCreditCardIsAuthorizedVerbally = false;
      var _isEncrypted = (_ksn != '' && _ksn != null);

      var _authorizationCode = "";

      if (Global.OfflineCharge) {
          _authorizationCode = this.GenerateForceAuthorizationCode();
      }
      else {
          _authorizationCode = $("#authorizationNumber").val();
      }

      if (_cardNumber==null) _cardNumber = "";
      if (_expDate==null) _expDate = "";
      if (_track1==null) _track1 = "";
      if (_track2==null) _track2 = "";
      if (_ksn==null) _ksn = "";
      if (_magnePrint==null) _magnePrint = "";
      if (_magnePrintStatus==null) _magnePrintStatus = "";
      if (_cv==null) _cv = "";
      if (_country==null) _country = "";
      if (_postal==null) _postal = "";
      if (_cardName==null) _cardName = "";
      if (_address==null) _address = "";
      if (_city==null) _city = "";
      if (_state==null) _state = "";
      if (_phone==null) _phone = "";
      if (_phoneExt==null) _phoneExt = "";
      if (_email==null) _email = "";
      if (_isSwiped==null) _isSwiped = false;

      _expDate = _expDate.split("-");
      if (_expDate.length === 2) {
        _expDateYear = _expDate[0];
        _expDateMonth = monthArray[parseInt(_expDate[1]) - 1];
      }
     
      if (_isSwiped === "false") _isSwiped = false;
      else _isSwiped = true;

      _cardTransactionType = "Authorize";

      if (_authorizationCode != "") _isCreditCardIsAuthorizedVerbally = true;

      if (!Global.OfflineCharge) {
          if (signatureHasChanges) {
              _signature = this.GetSignature();
              if (_signature.indexOf("[SVGID]:") !== -1) _signatureContent = Global.SignatureContent;
          }
      }

      this.sketchView = false;
      Global.Signature = null;

      var _encCardNumber = this.EncryptCardNumber(_cardNumber);
      _cardTransactionType = this.GetCreditCardTransactionType(_cardTransactionType, _isCreditCardIsAuthorizedVerbally, Enum.PaymentType.CreditCard, _cardNumber);

      //Dejavoo overrides
      if (Global.DejavooEnabled) {
        _authorizationCode = dejavooAuthCode;
        _cardName = dejavooCardName;
      }

      this.collection.add({
        AmountPaid: amount,
        PaymentType: Enum.PaymentType.CreditCard,
        CreditCardNumber: _cardNumber,
        ExpDateYear: _expDateYear,
        ExpDateMonth: _expDateMonth,
        NameOnCard: _cardName,
        CardTransactionType: _cardTransactionType,
        IsNew: true,
        SignatureSVG: _signature,
        SignatureSVGContent: _signatureContent,
        Track1: _track1,
        Track2: _track2,
        Ksn: _ksn,
        MagnePrint: _magnePrint,
        MagnePrintStatus: _magnePrintStatus,
        IsCreditCardEncrypted: _isEncrypted, // _isSwiped,
        //IsCardNumberEncrypted : true,
        IsUnimag: this.isUnimag,
        EncryptedCreditCardNumber: _encCardNumber,
        CreditCardIsAuthorizedVerbally: _isCreditCardIsAuthorizedVerbally,
        CreditCardAuthorizationCode: _authorizationCode,
        Email: _email,
        Address: _address,
        Country: _country,
        PostalCode: _postal,
        City: _city,
        State: _state,
        Telephone: _phone,
        TelephoneExtension: _phoneExt,
        CardVerification: _cv,
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username
      });
      //console.log("THIS WAS SENT: " + JSON.stringify(this.collection));
      this.isUnimag = false;
    },
     
    GenerateForceAuthorizationCode: function() {
                var force = (Global.DejavooEnabled ? "DJV" : "FP");
                var todayDate = new Date();
                var yr = todayDate.getFullYear().toString();
                var month = ("0" + (todayDate.getMonth()  + 1)).slice(-2);
                var day = ("0" + todayDate.getDate()).slice(-2); //todayDate.getDate().toString();
                var hr =("0" + todayDate.getHours()).slice(-2); // todayDate.getHours().toString();
                var min = ("0" + todayDate.getMinutes()).slice(-2); //todayDate.getMinutes().toString();
                var sec = ("0" + todayDate.getSeconds()).slice(-2) //todayDate.getSeconds().toString();
              //  var ms = todayDate.getMilliseconds().toString();
                var value = force.concat(yr,month.toString(),day.toString(),hr.toString(),min.toString(),sec.toString());
                return value;
     },

    GetCreditCardTransactionType: function(CardTransactionType, CreditCardIsAuthorizedVerbally, PaymentType, CreditCardNumber) {
      if (PaymentType == "Credit Card") {
        switch (Global.TransactionType) {
          case "Convert Quote":
          case "Order":
          case "Update Order":
            return "Authorize";
            break;
          case "Convert Order":
            if (CreditCardIsAuthorizedVerbally == true && (CardTransactionType == "Auth" || CardTransactionType == "Authorize")) return "Force";
            //return "Auth/Capture";
            if (Global.AllowSaleCreditPreference == true) return "Sale";
            else return "Auth/Capture";
            break;
          case "Suspended":
          case "Resume Sale":
            if (CreditCardIsAuthorizedVerbally && Global.IsPosted && (CardTransactionType == "Auth" || CardTransactionType == "Authorize")) {
              return "Force";
            } else if (Global.IsPosted && !CreditCardIsAuthorizedVerbally) { /*return "Sale"; */
              if (Global.AllowSaleCreditPreference == true) return "Sale";
              else return "Auth/Capture";
            }
            return "Authorize";
          default:
            if (!Global.IsPosted)
              return "Authorize";
            else if (CreditCardIsAuthorizedVerbally && Global.IsPosted)
              return "Force";
            else {
              if (Global.AllowSaleCreditPreference == true) return "Sale";
              else return "Auth/Capture";
            }
        }
      }
      return null;
    },

    EncryptCardNumber: function(cardNumber) {
      var length = cardNumber.length;

      var visibleNum = cardNumber.substr(length - 4, 4);
      var charLeft = length - 4;

      var hiddenNum = ''
      for (var i = 0; i < charLeft; i++) {
        hiddenNum += "X"
      }

      return hiddenNum + visibleNum;
    },

    CheckCashPaymentChangeDue: function() {
      var _balance = this.transactionBalance;
      _balance = parseFloat(_balance.toFixed(2));
      var _payment;
      if (Global.PaymentType == Enum.PaymentType.Loyalty) {
        this.loyaltyView.monetaryPoints;
      } else {
        _payment = this.keypadView.GetAmount()
      }
      var _change;

      if (_payment > _balance) {
        _change = _payment - _balance;
        _change = _change.toFixed(2);
        this.lastChangeAmount = isNaN(_change) ? 0 : _change;
        this.Hide();
        console.log("Your change is " + Global.CurrencySymbol + " " + this.formatAmount(_change) + ".");
        navigator.notification.confirm("Your change is " + Global.CurrencySymbol + " " + this.formatAmount(_change) + ".", _showChangeDue, "Change Due", ['Yes', 'No']);
      } else {
        this.lastChangeAmount = 0;
        this.AddCashPayment();
      }
    },

    GetTransactionPayment: function() {
      var _amountPaid;
      if (Global.PaymentType == Enum.PaymentType.Loyalty) {
        _amountPaid = this.loyaltyView.monetaryPoints;
        console.log("Amount Paid : " + _amountPaid);
      } else {
        _amountPaid = this.keypadView.GetAmount();
      }

      //var _amountPaid = this.keypadView.GetAmount();

      if (_amountPaid >= this.transactionBalance) {
        this.isFullPayment = true;
        return this.transactionBalance;
      } else {
        this.isFullPayment = false;
        return _amountPaid;
      }
    },

    GetPaymentAccountInfo: function() {
      if (Global.Preference.IsDepositPayment) {
        return "Deposit"
      }
      return "Undeposited";
    },

    IsNumeric: function(value) {
      if (isNaN(value)) {
        console.log("The value you entered is not valid.");
        navigator.notification.alert("The value you entered is not valid.", null, "Invalid Format", "OK");
        return false;
      }
      return true;
    },

    SetFocusedField: function() {
      switch (Global.PaymentType) {
        case Enum.PaymentType.Cash:
          $("#amountPaid:visible").focus();
          //this.SelectText();
          break;
        case Enum.PaymentType.Check:
          $("#checkNumber:visible").focus();
          break;
        case Enum.PaymentType.CreditCard:
          //$("#cardNumber:visible").focus();
          break;
      }
    },

    RequestSwipe: function(msg) {
      $("#cardNumber").val("");

      Shared.SetDefaultToday("#expDate", "YYYY-MM");
      $("#expDate").removeAttr("readonly");

      $("#cardName").val("");

      $("#track1").text("");

      $("#track2").text("");

      $("#ksn").text("");

      $("#magnePrint").text("");

      $("#magnePrintStatus").text("");

      //if (!Global.isBrowserMode) window.plugins.cbUnimag.RequestSwipe();

      if (!Global.isBrowserMode) Shared.NMIPaymentGateway.RequestSwipe();

      $("#cc-msg").text(msg);
    },

    GetCardNumber: function(data) {
      return data.substring(1, 17);
    },

    UpdateChangeDue: function(amountPaid) {
      var _changeDue = 0.00;
      if (amountPaid > this.transactionBalance) {
        _changeDue = amountPaid - this.transactionBalance;
      }
      this.$("#changeDue").html(_changeDue.toFixed(2) + "&nbsp;&nbsp;");
    },

    ToggleFields: function() {
      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesRefund:
          $("#amountPaid").attr("readonly", "readonly");
          $("#label-balance").html("Paid");
          $("#label-amountPaid").html("Refund");
          $("#cardRefNumber").show();
          break;
        default:
          $("#amountPaid").removeAttr("readonly");
          $("#label-balance").html("Balance"),
            $("#label-amountPaid").html("Amount");
          $("#cardRefNumber").hide();
          break;
      }
    },

    GetSignature: function() {
      if (this.sketchView) return Global.Signature;
      var datapair = this.$(".signature").jSignature("getData", "svgbase64");
      if (datapair) {
        return datapair[1];
      }
      return null;
    },

    InitializeKeypadView: function() {
      if (this.keypadView) {
        this.keypadView.remove();
      }
      var self = this;
      this.keypadView = new KeypadView({
        el: $(".keypad")
      });
      this.keypadView.on('enterTriggered', function() {
        if (Shared.IsNullOrWhiteSpace(self.disableEnter)) {
          $('#keypad-done-btn').tap();
        }
      }, this)
      this.keypadView.Show();
      //this.keypadView.SetAmount(format("#,##0.00", this.transactionBalance));
      this.keypadView.SetAmount(this.transactionBalance.toFixed(2));
    },

    closePluginDevice: function() {
      window.plugins.cbCCSwipe.CloseDevice("close");
    },

    ShowSpinner: function() {
      var target = document.getElementById('lblCard');
      this.ShowActivityIndicator(target);
    },

    ShowActivityIndicator: function(target) {
      if (!target) {
        target = document.getElementById('lblCard');
      }
      $("<div id='lblSpinner'></div>").appendTo(target);
      var _target = document.getElementById('lblSpinner');
      _spinner = Spinner;
      _spinner.opts.color = '#000'; //The color of the spinner
      _spinner.opts.lines = 11; // The number of lines to draw
      _spinner.opts.length = 4; // The length of each line
      _spinner.opts.width = 2; // The line thickness
      _spinner.opts.radius = 5; // The radius of the inner circle
      _spinner.opts.top = -21; // Top position relative to parent in px
      _spinner.opts.left = 139;
      _spinner.spin(_target);
    },

    HideActivityIndicator: function() {
      _spinner = Spinner;
      _spinner.stop();
      $("#lblSpinner").remove();
    },

    ResetField: function() {
      $("#track1").text("");
      $("#track2").text("");
      $("#ksn").text("");
      $("#magnePrint").text("");
      $("#magnePrintStatus").text("");
    },

    AdjustPaymentBodyHeight: function(isLoyalty) {
      this.$("input#checkNumber").attr('style', 'width: 71% !important;')
      if (!Global.TermDiscount > 0) return;
      if (!isLoyalty) {
        if (Global.PaymentType == Enum.PaymentType.Check && $('#paymentBody').hasClass("checkPayment")) {
          this.$("#paymentBody").css('height', '459px');
        } else {
          this.$("#paymentBody").css('height', '400px');
        }
      } else {
        if (Global.TermDiscount > 0) this.$("#paymentBody").css('height', '335px');
        else this.$("#paymentBody").css('height', '276px');
        this.$(".term-discount").css('margin-top', '20px');
      }
      //this.$(".checkPaymentWithSignature").css("height" : _checkHeight + 17'px';)
    }

  });

  var _showActivityIndicator = function() {
    var target = document.getElementById('btn-stop-asking');

    _spinner = Spinner;
    _spinner.opts.left = 10; // Left position relative to parent in px
    _spinner.opts.radius = 3;
    _spinner.opts.lines = 9;
    _spinner.opts.length = 4; // The length of each line
    _spinner.opts.width = 3; // The line thickness

    _spinner.opts.color = '#000';

    _spinner.spin(target, "Cancel");
    $("#btn-stop-asking .ui-btn-text").text("Cancel");
    $(".btn-ask-to-sign").css("text-align", "center");
    $("#signature").addClass("ui-disabled");
  }

  var _hideActivityIndicator = function() {
    _spinner = Spinner;
    _spinner.stop();
  }

  var _revertTextBack = function() {
    this.$('.btn-ask-to-sign').attr('id', 'btn-ask-to-sign');
    $(".btn-ask-to-sign .ui-btn-text").text("Allow User To Sign");
    $(".btn-ask-to-sign").css("text-align", "center");
    _hideActivityIndicator();
    $("#signature").removeClass("ui-disabled");
  }

  var _showChangeDue = function(button) {
    if (button === 1) {
      _paymentForm.AddCashPayment();
    } else {
      _paymentForm.RemoveScreenOverLay();
      return;
    }
  }

  var _changeGiftAmount = function(button) {
    if (button === 1) {
      _paymentForm.ChangeGiftAmountToUse();
    }
  }

  var signatureHasChanges = false;

  var _testFunction = function(data) {
    console.log("DATA RETURNED: " + data);
  }
  return PaymentView;
});
