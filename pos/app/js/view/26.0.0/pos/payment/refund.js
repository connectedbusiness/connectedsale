/**
 * Connected Business | 07-17-2012
 * Required: el, collection
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/enum',
  'shared/global',
  'shared/method',
  'shared/service',
  'shared/shared',
  'model/postal',
  'model/country',
  'collection/base',
  'collection/postal',
  'collection/countries',
  'view/26.0.0/pos/postal/addpostal',
  'text!template/26.0.0/pos/payment/refund.tpl.html',
  'text!template/26.0.0/pos/payment/check.tpl.html',
  'text!template/26.0.0/pos/payment/creditcard.tpl.html',
  'view/spinner',
  'js/libs/jSignature.min.js',
], function($, $$, _, Backbone, Enum, Global, Method, Service, Shared, PostalModel, CountryModel, PostalCollection, CountryCollection, BaseCollection,
  AddPostalView, template, CheckTemplate, CreditCardTemplate, Spinner) {
  var _timeOut, _timeOut1, _track1, _ksn, _magnePrint, _magnePrintStatus;

  var _view;
  var confirmAddPostal = function(button) {
    if (button == 1) {
      _view.AddNewPostal();
    } else {
      _view.ClearPostalDetails();
    }
  }
  var RefundView = Backbone.View.extend({
    _template: _.template(template),
    _checkTemplate: _.template(CheckTemplate),
    _creditCardTemplate: _.template(CreditCardTemplate),

    events: {
      "tap #btn-savePayment": 'btnSave_tap',
      "tap #btn-cancelPayment": 'btnClose_tap',
      "tap .btn-clear-signature": 'btnClearSignature_tap',
      //"keyup #checkNumber"       : 'checkNumber_keyup',
      "keypress #checkNumber": 'checkNumber_keypress',
      "change #cc-msg": 'processMsg',
      "tap #cc-swipe": "btnSwipe_tap",
      "change #isUnimag": "checkUnimag",
      "tap #btn-more": "btnLoadMoreInfo_tap",

      "change #ccCountry": "CountryChanged",
      "change #ccCity": "CityChanged",
      "keyup #ccPostal": "keyupPostal",
      "blur  #ccPostal": "blurPostal",
      "blur #ccEmail": "blurEmail",
      "keyup #cardNumber": "cardNumber_keyup",
      //events below are added for CSL - 8822
      //"focus #cardNumber"		   : "AssignNumericValidation",
      "focus #cvNumber": "AssignNumericValidation",
      "focus #ccPhoneExt": "AssignNumericValidation",
      "focus #ccPhone": "AssignNumericValidation",

      "tap #btn-ask-to-sign": "btn_AskToSign",
      "tap #btn-stop-asking": "btnCancel_Retrieval",


    },

    btn_AskToSign: function(e) {
      e.preventDefault();
      console.log('btn_AskToSign');
      this.$('.btn-ask-to-sign').attr('id', 'btn-stop-asking');
      //'.btn-ask-to-sign'
      //'btn-ask-to-sign'
      _showActivityIndicator();
      this.trigger("allowUserToAttachSign", "Refund", this);
    },

    btnCancel_Retrieval: function(e) {
      e.preventDefault();
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

    ShowSignatureDisplay: function() {
      if (this.sketchView) {
        this.$(".signature").jSignature("reset");
        this.$(".signature").hide();
        this.$(".signatureDisplay").show();
      }
    },

    LoadSignature: function(signatureSVG) {
      if (signatureSVG != null) {
        var i = new Image();
        i.src = "data:image/svg+xml;base64," + signatureSVG
        this.$(".signatureDisplay").html($(i));
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
      Shared.Input.NonNegativeInteger('#' + e.target.id);
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
      if (unimag === "true") $("#cc-msg").text("Establishing connection...");
    },

    btnSwipe_tap: function(e) {
      e.preventDefault();
      if (Global.isBrowserMode) {
        $("#cardNumber").focus();
        this.RequestSwipe("Please swipe card.");
        Shared.CreditCard.ClearCreditCardInfo();
        $('#expDate').removeClass("ui-disabled");
      } else {
        this.RequestSwipe("Please swipe card.");
        $("#expDate").removeAttr('readonly');
      }
    },


    btnSave_tap: function(e) {
      e.preventDefault();
      this.SavePayment();
    },

    btnClose_tap: function(e) {
      e.preventDefault();
      if (this.IsWaiting()) {
        navigator.notification.alert("Waiting the for customer's signature.", null, "Invalid Action", "OK");
        return;
      }
      this.sketchView = false;
      this.Close(true);
    },

    IsWaiting: function() {
      return this.$('#signature').hasClass('ui-disabled');
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
        if (_svg.indexOf("[SVGID]:") !== -1) this.trigger("deleteSavedSignature", Global.Signature, this);
        else Global.Signature = null;
      } else {
        this.$(".signature").jSignature("reset");
      }
      this.sketchView = false;
      signatureHasChanges = false;
    },



    btnLoadMoreInfo_tap: function(e) {
      e.preventDefault();

      switch (e.currentTarget.innerHTML) {
        case "More":
          $("#paymentAdditionalFields").show();
          $("#paymentPrimaryFields").hide();
          $(".signature-container").css("visibility", "hidden");
          $(".refundDetails").css("height", "320px");
          $("#cc-msgContainer").css("visibility", "hidden");
          $("#btn-more").text("Back");

          this.InitializePostal();
          this.InitializeCountry();

          break;
        case "Back":
          $("#paymentAdditionalFields").hide();
          $("#paymentPrimaryFields").show();
          $(".signature-container").css("visibility", "visible");
          $(".refundDetails").css("height", "");
          $("#cc-msgContainer").css("visibility", "visible");
          $("#btn-more").text("More");
          break;
      }

    },

    processMsg: function(e) {
      e.preventDefault();
      //this.HideActivityIndicator();

      var msg = $("#cc-msg").text();

      var t1 = $("#track1").text();

      var t2 = $("#track2").text();

      var ksn = $("#ksn").text();

      console.log("Refund: " + msg);
      if (msg === "Card unreadable. Try again.") {
        this.RequestSwipe("Please swipe card again.");
      } else if (msg === "Successfully retrieved credit card information.") {
        if (t1 === "" && t2 === "" && ksn === "") {
          $("#cardNumber").val("");

          $("#expDate").val("");

          $("#cardName").val("");

          $("#track1").text("");

          $("#track2").text("");

          $("#ksn").text("");
          console.log("Unable to read card information.");
          if (!Global.isBrowserMode) navigator.notification.alert("Unable to get credit card information. Please swipe again.", null, "Unable to Proceed", "OK");
        }
      }
    },

    //checkNumber_keyup : function(e) {
    checkNumber_keypress: function(e) {
      var _amountPaid = $("#amountPaid").val();
      if (e.keyCode === 13) {
        this.$("#checkNumber").blur();
        this.SavePayment();
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
      this.payment = this.options.payment;
      _view = this;
    },

    render: function() {
      this.$el.html(this._template({
        PaymentType: Global.PaymentType
      }));
      this.InitializePaymentDetail();
      this.countrySelected = null;
      if (!Global.isBrowserMode) this.ActivateUnimagPlugin();
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
        case Enum.PaymentType.Check:
          this.InitializeCheckPayment();
          break;
        case Enum.PaymentType.CreditCard:
          this.InitializeCreditCardPayment();
          break;
      }
      this.$(".refundDetails").trigger("create");

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
      this.countrySelected = response.CountryCode;
      this.SetSelectedCountry(this.countrySelected);
      $("#ccPostal").val(response.PostalCode);
      $("#ccCity").val(response.StateCode);
      this.postal = response.PostalCode;
      this.city = response.City;
      //this.postal = $("#ccPostal").val();
      this.LoadPostal(this.postal, this.city);
    },
    ClearPostalDetails: function() {
      $("#ccPostal").val("");
      this.postal = "";
      this.ClearCity();
    },
    DisplayResultOnPostal: function(postal) {
      this.newCollection = new PostalCollection();
      this.postalCollection.each(this.RemoveInvalidPostals, this);
      this.postalCollection = this.newCollection;
      if (this.postalCollection.length === 0) {
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

    SetSelectedCountry: function(country) {
      $("#ccCountry > option[value='" + country + "']").attr("selected", "selected");
      $("#ccCountry").selectmenu('refresh', true);
    },

    ReloadCountry: function(collection) {
      $('#ccCountry > option[val !=""]').remove();
      this.LoadRetrievedCountry(collection);

      if (this.countrySelected === null || this.countrySelected === undefined) {
        this.countrySelected = (Global.CurrentCustomer.Country) ? Global.CurrentCustomer.Country : Global.ShipTo.Country;
      }

      this.SetSelectedCountry(this.countrySelected);
    },

    InitializeCheckPayment: function() {
      $(".refundDetails").html(this._checkTemplate({
        Balance: this.transactionBalance
      }));
    },

    InitializeCreditCardPayment: function() {
      $(".refundDetails").html(this._creditCardTemplate({
        NameOnCard: Global.CurrentCustomer.CustomerName,
        Balance: this.transactionBalance
      }));
      Shared.BrowserModeDatePicker("#expDate", "datepicker", "yy-mm");
      if (Global.isBrowserMode) {
        $("#cardNumber").focus();
        $("#cc-msg").text("Enter Credit card details.");
      }
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

    Close: function(fromCloseButton) {
      Global.Signature = null;
      this.DestroyCountryAndPostal();
      this.Hide(fromCloseButton);
    },

    Show: function(balance) {
      this.sketchView = false;
      this.transactionBalance = balance;
      this.render();
      this.$el.show();
      $("#creditCardAutorizaiton").hide();
      this.InitializeSignature();
      //this.SetFocusedField();
    },

    Hide: function(fromCloseButton) {
      if (!Global.isBrowserMode) this.DeactiveUnimag();
      this.$el.html("");
      this.$el.hide();
      if (fromCloseButton) this.RemoveScreenOverLay();
    },

    ActivateUnimagPlugin: function() {
      if (window.plugins != undefined) {
        if (Global.PaymentType === "Credit Card") {
          // window.plugins.cbUnimag = cordova.require(Global.Plugins.Unimag);
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

    RequestSwipe: function(msg) {
      $("#cardNumber").val("");

      Shared.SetDefaultToday("#expDate", "YYYY-MM");

      $("#cardName").val("");

      $("#track1").text("");

      $("#track2").text("");

      $("#ksn").text("");

      //if(!Global.isBrowserMode) window.plugins.cbUnimag.RequestSwipe();

      if (!Global.isBrowserMode) Shared.NMIPaymentGateway.RequestSwipe();

      $("#cc-msg").text(msg);
    },

    RemoveScreenOverLay: function() {
      $("#main-transaction-blockoverlay").hide();
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
      this.$(".signatureDisplay").hide();
      this.$(".signature-container").show();
      this.$(".signature").jSignature({
        height: "100px"
      });
      $("#paymentContainer").addClass("paymentFormLarge");

      if (_showSignature) {
        this.$(".signature").bind("change", this.SignatureChanged);
      } else {
        this.$(".signature-container").css('overflow', 'hidden');
        this.$(".signature-container").css('height', '0px');
        this.$(".signature-container").css('visibility', 'hidden');
      }
    },

    SignatureChanged: function(e) {
      signatureHasChanges = true;
    },

    SavePayment: function() {
      if (this.IsWaiting()) {
        navigator.notification.alert("Waiting the for customer's signature.", null, "Invalid Action", "OK");
        return;
      }
      var _amountPaid = this.transactionBalance;
      var _email = $("#ccEmail").val();
      var cardRef = $("#cardReferenceNumber").val();
      if (this.ValidatePayment(Global.PaymentType, _amountPaid)) {
        if (this.ValidateSignature(Global.PaymentType)) {
          if (this.ValidateEmail(Global.PaymentType, _email)) {
            if (this.ValidateCardReference(Global.PaymentType, cardRef)) {
              this.AddPayment(Global.PaymentType, _amountPaid);
            }
          }
        }
      }
    },

    ValidateEmail: function(paymentType, email) {
      if (paymentType === Enum.PaymentType.CreditCard && email != "") {
        if (Shared.ValidateEmailFormat(email)) {
          navigator.notification.alert("Email format is invalid.", null, "Invalid Email", "OK");
          return false;
        } else {
          return true;
        }
      } else return true;

    },

    ValidateCardReference: function(paymentType, cardRef) {
      if (paymentType === Enum.PaymentType.CreditCard) {
        if (cardRef === "") {
          navigator.notification.alert("Reference number is required. Reference number is found on the receipt.", null, "Card reference required", "OK");
          return false;
        }

        return this.CheckCardReference(cardRef);
      } else {
        return true;
      }
    },

    ValidatePayment: function(paymentType, amount) {
      if (!amount || amount === 0) {
        console.log("Please specify an amount.");
        navigator.notification.alert("Please specify an amount.", null, "Amount is Required", "OK");
        return false;
      }

      switch (paymentType) {
        case Enum.PaymentType.Check:
          var _checkNumber = $("#checkNumber").val();
          if (_checkNumber.trim() === "") {
            console.log("Please enter the Check Number.");
            navigator.notification.alert("Please enter the Check Number.", null, "Check Number is Required", "OK");
            return false;
          }
          break;
        case Enum.PaymentType.CreditCard:
          var _cardNumber = $("#cardNumber").val();
          var _expDate = $("#expDate").val();
          var _cardName = $("#cardName").val();

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
          if (Global.Preference.RequireSignatureOnCreditCard && signatureHasChanges === false) {
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
        this.Close();
      }
    },

    CreatePayment: function(paymentType, amount) {
      switch (paymentType) {
        case Enum.PaymentType.Cash:
          this.AddCashPayment(amount);
          break;
        case Enum.PaymentType.Check:
          this.AddCheckPayment(amount);
          break;
        case Enum.PaymentType.CreditCard:
          this.AddCreditCardPayment(amount);
          break;
      }
    },

    AddCashPayment: function(amount) {
      this.collection.add({
        AmountPaid: amount,
        PaymentType: Enum.PaymentType.Cash,
        Account: this.GetPaymentAccountInfo(),
        IsNew: true,
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username
      });
    },

    AddCheckPayment: function(amount) {
      var _checkNumber = $("#checkNumber").val();
      var _signature = "";
      if (signatureHasChanges) {
        _signature = this.GetSignature();
      }
      this.collection.add({
        CheckNumber: _checkNumber,
        PaymentType: Enum.PaymentType.Check,
        AmountPaid: amount,
        Account: this.GetPaymentAccountInfo(),
        IsNew: true,
        SignatureSVG: _signature,
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username
      });
    },

    AddCreditCardPayment: function(amount) {
      var monthArray = ["January", "February", "March", "April", "May",
        "June", "July", "August", "September", "October", "November", "December"
      ];

      var _cardNumber = $("#cardNumber").val();
      var _expDate = $("#expDate").val();
      var _cardName = $("#cardName").val();
      var _track1 = $("#track1").text();
      var _track2 = $("#track2").text();
      var _ksn = $("#ksn").text();
      var _cv = $("#cvNumber").val();
      var _country = $("#ccCountry option:selected").val();
      var _postal = $("#ccPostal").val();
      var _address = $("#ccAddress").val();
      var _city = $("#ccCity option:selected").val();
      var _state = $("#ccState").val();
      var _phone = $("#ccPhone").val();
      var _phoneExt = $("#ccPhoneExt").val();
      var _email = $("#ccEmail").val();
      var _cardReference = $("#cardReferenceNumber").val();
      var _authorizationCode = $("#authorizationNumber").val();
      var _isSwiped = $("#isSwiped").html();

      var _expDateYear = "";
      var _expDateMonth = "";
      var _cardTransactionType = "";
      var _signature = "";
      var _isCreditCardIsAuthorizedVerbally = false;
      var _isEncrypted = (_ksn != '' && _ksn != null);


      console.log("TRACK1 " + _track1 + "TRACK2 " + _track2 + "KSN " + _ksn);

      _expDate = _expDate.split("-");
      if (_expDate.length === 2) {
        _expDateYear = _expDate[0];
        _expDateMonth = monthArray[parseInt(_expDate[1]) - 1];
      }

      if (Global.TransactionType === Enum.TransactionType.Order ||
        Global.TransactionType === Enum.TransactionType.UpdateOrder ||
        Global.TransactionType === Enum.TransactionType.ConvertQuote) {
        _cardTransactionType = "Authorize";
        if (_authorizationCode != "") _isCreditCardIsAuthorizedVerbally = true;
      } else {
        _cardTransactionType = "Auth/Capture";
        if (_authorizationCode != "") _isCreditCardIsAuthorizedVerbally = true;
      }

      if (signatureHasChanges) {
        _signature = this.GetSignature();
      }

      _cardTransactionType = this.GetCreditCardTransactionType(_cardTransactionType, _isCreditCardIsAuthorizedVerbally, Enum.PaymentType.CreditCard, _cardNumber);

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
        Track1: _track1,
        Track2: _track2,
        Ksn: _ksn,
        MagnePrint: _magnePrint,
        MagnePrintStatus: _magnePrintStatus,
        IsCreditCardEncrypted: _isEncrypted, //_isSwiped,
        //IsCardNumberEncrypted : true,
        CreditCardIsAuthorizedVerbally: _isCreditCardIsAuthorizedVerbally,
        CreditCardAuthorizationCode: _authorizationCode,
        AuthorizationCode: _authorizationCode,
        IsUnimag: true,
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

      console.log("This was sent: " + JSON.stringify(this.collection));
      this.isUnimag = false;

      //this.ResetField();
    },
    GetCreditCardTransactionType: function(CardTransactionType, CreditCardIsAuthorizedVerbally, PaymentType, CreditCardNumber) {
      if (PaymentType == "Credit Card") {
        switch (Global.TransactionType) {
          case "Convert Quote":
            //case "Order":
            //case "Update Order":
            return "Authorize";
            // case "Convert Order":
            //   if (CreditCardIsAuthorizedVerbally == true && (CardTransactionType == "Auth" || CardTransactionType == "Authorize")) return "Force";
            // return "Auth/Capture";
          case "Suspended":
          case "Resume Sale":
            if (CreditCardIsAuthorizedVerbally && Global.IsPosted && (CardTransactionType == "Auth" || CardTransactionType == "Authorize")) return "Force";
            else if (Global.IsPosted && !CreditCardIsAuthorizedVerbally) return "Auth/Capture";
            return "Authorize";
          default:
            if (!Global.IsPosted)
              return "Authorize";
            else if (CreditCardIsAuthorizedVerbally && Global.IsPosted && !CreditCardNumber == "")
              return "Force";
            else
              return "Auth/Capture";
        }
      }
      return null;
    },

    CheckCardReference: function(dataCardRef) {
      var cardRef = this.payment.pluck("CreditCardReference");

      console.log(cardRef);

      for (i in cardRef) {
        if (dataCardRef == cardRef[i]) {

          return true;
        }
      }
      navigator.notification.alert("Please enter the correct Reference number found in the receipt.", null, "Incorrect Input", "OK");
      return false;
    },

    GetPaymentAccountInfo: function() {
      if (Global.Preference.IsDepositPayment) {
        return "Deposit"
      }
      return "Undeposited";
    },

    SetFocusedField: function() {
      switch (Global.PaymentType) {
        case Enum.PaymentType.Check:
          this.$("#checkNumber").focus();
          break;
        case Enum.PaymentType.CreditCard:
          this.$("#cardNumber").focus();
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

    HideActivityIndicator: function() {
      _spinner = Spinner;
      _spinner.stop();
      $("#lblSpinner").remove();
    },

    ResetField: function() {
      $("#track1").val("");
      $("#track2").val("");
      $("#ksn").val("");
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

  var signatureHasChanges = false;
  return RefundView;
});
