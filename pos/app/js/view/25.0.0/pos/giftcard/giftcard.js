/**
 * @author PR.Ebron
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/enum',
  'shared/shared',
  'model/base',
  'collection/base',
  'text!template/25.0.0/pos/giftcard/recharge.tpl.html',
  'text!template/25.0.0/pos/giftcard/activate.tpl.html',
  'view/spinner',
], function($, $$, _, Backbone, Global, Service, Method, Enum, Shared, BaseModel, BaseCollection, RechargeTemplate, ActivateTemplate, Spinner) {

  var FormType = {
    Recharge: "RechargeGCard",
    Activate: "ActivateGCard",
  };

  var ActivateFormType = {
    PIN: "PIN",
    NewPIN: "New PIN",
    Activate: "Activate",
  };

  var ViewType = {
    POS: "POS",
    SecondaryDisplay: "SecondaryDisplay",
  };

  var currentView = null;

  var GiftCardView = Backbone.View.extend({
    _RechargeTemplate: _.template(RechargeTemplate),
    _ActivateTemplate: _.template(ActivateTemplate),

    render: function(formTemplate) {
      this.$el.html('');
      this.$el.html(formTemplate);
      return this;
    },

    events: {
      //for GC RECHARGE events
      "tap #recharge-btn": "Recharge_tapped",
      "tap #btn-cancel": "Cancel_tapped",
      //"keyup #gift-card-input" 	: "GiftCard_keyup",
      "keypress #gift-card-input": "GiftCard_keypress",
      "change #gift-card-input": "GiftCard_change",
      "focus #amount-input": "Amount_focused",
      "blur #amount-input": "Amount_blur",

      //for GC ACTIVATION events
      // "keyup #pin-input"		 	: "Pin_keyup",
      // "keyup #confirm-pin-input"	: "Pin_keyup",
      "keypress #pin-input": "Pin_keypress",
      "keypress #confirm-pin-input": "Pin_keypress",
      "tap #activate-btn": "Activate_tapped",
      "tap #btn-back": "Back_tapped",

      //for GC PIN events
      "tap #btn-done": "Done_tapped",


      "tap #ask-pin-btn": "AskPIN_tapped",
      "tap #stop-asking-btn": "StopAsking_tapped",

    },

    initialize: function() {
      this.InitializeGiftCardModel();
      currentView = this;
      //this.on("processPINCaptured", this.PopulateTextFields);
    },

    PopulatePINFields: function(pin) {
      if (!pin) pin = Global.PIN;
      console.log('processPINCaptured');
      $("#confirm-pin-input").val(pin);
      $("#pin-input").val(pin);
      this.GetFieldValues();
      _revertTextBack();
      if (this.activateFormType == ActivateFormType.PIN) {
        if (this.ValidData()) this.ValidatePIN();
      }

    },

    ShowGCardRechargeForm: function() {
      Global.ViewRecipient = "Recharge";
      this.formType = FormType.Recharge;
      this.$el.html('');
      if (!this.IsActivated)
        if (this.gcModel.get('SerialLotNumber')) this.gcModel.set({
          CreditAvailableRate: 0,
        })
      this.render(this._RechargeTemplate(this.gcModel.toJSON()));
      if (this.IsActivated) this.ShowHiddenFields();
      else Shared.Focus("#gift-card-input");

      $("#rechargeGCardForm").trigger('create');
      this.$el.show();
    },

    ShowGCardActivationForm: function(type) {
      this.formType = FormType.Activate;
      if (!type) type = ActivateFormType.Activate;
      this.render(this._ActivateTemplate);

      Shared.Focus("#pin-input");

      if (this.IsSecondaryView()) {
        $(".popover-left").hide(); //back/cancel
        $("#activate-btn").text("Submit");
        $("#ask-pin-btn").hide();
      } else {
        $("#activate-btn").addClass('left-btn');
        $("#ask-pin-btn").addClass('right-btn');
      }

      switch (type) {
        case ActivateFormType.PIN:
          this.ShowPinOnly();
          break;
        case ActivateFormType.NewPIN:
          this.ShowNewPIN();
          break;
        default:
          this.activateFormType = ActivateFormType.Activate;
          break;
      }

      $("#activateGCardForm").trigger('create');
      this.$el.show();
    },

    ShowHiddenFields: function() {
      $('#balance-container').show();
      if (this.hasItemOnCart) {
        $('#gc-button-container').hide();
        return;
      }
      $('#recharge-btn').text("Recharge");
      $('#amount-container').show();
      $('#gc-button-container').show();
      Shared.Input.NonNegative('#amount-input');
      Shared.Focus("#amount-input");
    },

    ShowPinOnly: function() {
      this.activateFormType = ActivateFormType.PIN;
      if (this.IsSecondaryView()) {
        $(".popover-left").hide(); //back/cancel
        $("#gc-button-container").hide();
        $("#btn-done").text("Submit");
      } else {
        $("#activate-btn").hide();
        $(".ask-pin-btn").show();
        $("#activate-btn").removeClass('left-btn');
        $("#ask-pin-btn").removeClass('right-btn');
      }

      $("#activate-title").hide();
      $("#pin-title").show();
      $("#confirm-pin-container").hide();
      $(".popover-right").show(); //done-btn
    },

    ShowNewPIN: function() {
      this.activateFormType = ActivateFormType.NewPIN;
      $("#activate-title").hide();
      $("#new-pin-title").show();

      if (this.IsSecondaryView()) {
        $(".popover-left").hide(); //back/cancel
        $("#gc-button-container").hide();
        $("#btn-activate").text('Submit');
      } else {
        //$("#activate-btn").hide();
        $(".ask-pin-btn").show();
        $("#btn-activate").text('Submit');
      }


    },

    Cancel_tapped: function(e) {
      e.preventDefault();
      Shared.ShowHideBlockOverlay();
      this.$el.hide();
      Shared.FocusToItemScan();
    },

    Recharge_tapped: function(e) {
      e.preventDefault();
      if (this.validateLocationBankAccount)
        if (!this.validateLocationBankAccount()) return;

      var _val = $('#gift-card-input').val();
      if (Shared.IsNullOrWhiteSpace(_val)) return;
      if (!this.IsActivated) this.SearchGCard();
      else this.RechargeGiftCard();
    },

    Activate_tapped: function(e) {
      e.preventDefault();
      if (this.IsWaiting()) {
        navigator.notification.alert("Waiting for the customer to enter pin.", null, "Invalid Action", "OK");
        return;
      }
      if (!this.ValidData()) return;
      if (this.IsSecondaryView()) {
        this.TriggerPINCaptured();
        return;
      }
      if (this.IsActivated) this.ActivateGiftCard();
      else {
        currentView = this;
        var msg = "This gift card will be permanently associated to the current customer. Do you still want to proceed to activation?";
        navigator.notification.confirm(msg, this.ProceedToActivation, 'Activate Gift Card');
      }
    },

    TriggerPINCaptured: function() {
      this.Hide();
      this.trigger('pinCaptured', this.pin);
    },

    ProceedToActivation: function(button) {
      if (button == 1) currentView.ActivateGiftCard();
      else return;
    },

    Back_tapped: function(e) {
      e.preventDefault();
      if (this.IsWaiting()) {
        navigator.notification.alert("Waiting for the customer to enter pin.", null, "Invalid Action", "OK");
        return;
      }
      this.ShowGCardRechargeForm();
    },

    //GiftCard_keyup : function (e) {
    GiftCard_keypress: function(e) {
      if (e.keyCode == 13) {
        var val = $('#' + e.target.id).val();
        if (Shared.IsNullOrWhiteSpace(val)) return;
        this.SearchGCard();
      }
    },

    Amount_focused: function(e) {
      e.stopPropagation();
      var _val = $('#' + e.target.id).val();
      if (!_val) return;
      _val = parseFloat(_val);
      if (_val == 0) $('#' + e.target.id).val('');
    },

    Amount_blur: function(e) {
      e.stopImmediatePropagation();
      var _val = $('#' + e.target.id).val();
      if (!_val) $('#' + e.target.id).val('0.00');
    },

    GiftCard_change: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (this.IsActivated) this.SearchGCard();
    },

    //Pin_keyup : function(e) {
    Pin_keypress: function(e) {
      if (e.keyCode == 13) {
        if (this.activateFormType == ActivateFormType.PIN)
          if (e.target.id == 'pin-input')
            if (this.ValidData()) this.ValidatePIN();
            else {
              if (this.ValidData()) console.log('valid');
            }
      }
    },

    Done_tapped: function(e) {
      e.preventDefault();
      if (this.IsWaiting()) {
        navigator.notification.alert("Waiting for the customer to enter pin.", null, "Invalid Action", "OK");
        return;
      }
      if (this.ValidData()) {
        if (this.IsSecondaryView()) this.TriggerPINCaptured();
        else this.ValidatePIN();
      }
    },

    AskPIN_tapped: function(e) {
      e.preventDefault();
      $('.ask-pin-btn').attr('id', 'stop-asking-btn');
      _showActivityIndicator();
      this.trigger("askToEnterPIN", this.activateFormType, this);
    },

    StopAsking_tapped: function(e) {
      e.preventDefault();
      console.log('btnCancel_Retrieval');
      this.$('.ask-pin-btn').attr('id', 'ask-pin-btn');
      _revertTextBack();
      this.trigger("stopAskingPIN", "Recharge", this);
    },

    RechargeGiftCard: function() {
      if (!this.ValidData()) return;
      var _amt = $("#amount-input").val();
      _amt = parseFloat(_amt);
      this.gcModel.set({
        SalesPriceRate: _amt
      })
      this.trigger('proceedToRecharge', this.gcModel);
    },

    SearchGCard: function(serialNumber) {
      if (!this.ValidData()) return;
      this.IsActivated = false;
      if (!serialNumber) serialNumber = this.serialNumber;
      //Shared.LockTransactionScreen(true, 'Loading...')
      var mdl = new BaseModel();
      mdl.on('sync', this.SearchGCardSuccess, this);
      mdl.on('error', this.SearchGCardFailed, this);

      mdl.url = Global.ServiceUrl + Service.SOP + Method.GETGIFTDETAILBYSERIAL;
      mdl.set({
        SerialLotNumber: serialNumber
      });
      mdl.save();
    },

    ValidatePIN: function() {
      if (this.IsSecondaryView()) {
        this.TriggerPINCaptured();
        return;
      }
      //Shared.LockTransactionScreen(true, 'Loading...');
      var mdl = new BaseModel();
      var gcJSON = this.GetCurrentModelAtt();

      mdl.on('sync', this.ValidatePINSuccess, this);
      mdl.on('error', this.ValidatePINFailed, this);

      mdl.url = Global.ServiceUrl + Service.SOP + Method.VALIDATEGIFTPIN;
      mdl.set(gcJSON);
      mdl.set({
        PIN: this.encryptedPIN
      });
      mdl.save();
    },

    FetchGCardDetails: function(serialNumber) {
      if (!serialNumber) serialNumber = this.serialNumber;
      //Shared.LockTransactionScreen(true, 'Loading...')
      var mdl = new BaseModel();
      mdl.on('sync', this.FetchGCardDetailsSuccess, this);
      mdl.on('error', this.FetchGCardDetailsFailed, this);

      mdl.url = Global.ServiceUrl + Service.SOP + Method.GETGIFTCREDITS;
      mdl.set({
        SerialLotNumber: serialNumber,
        ItemType: Enum.ItemType.GiftCard
      });
      mdl.save();
    },

    ActivateGiftCard: function(serialNumber) {
      if (!serialNumber) serialNumber = this.serialNumber;
      var mdl = new BaseModel();
      mdl.set(this.GetCurrentModelAtt());

      mdl.on('sync', this.ActivateGCardSuccess, this);
      mdl.on('error', this.ActivateGCardFailed, this);

      var _creditCode = this.creditCode;

      var _custCode = Global.CustomerCode;
      if (this.activateFormType == ActivateFormType.NewPIN) _custCode = mdl.get('CustomerCode');
      else this.gcModel.set({
        CustomerCode: _custCode
      })

      mdl.url = Global.ServiceUrl + Service.SOP + 'activategift/';
      mdl.set({
        SetPIN: true,
        CustomerCode: _custCode,
        CreditCode: _creditCode,
        PIN: this.encryptedPIN
      });
      mdl.save();
    },

    /*activate.set( SetPIN: setPIN, CustomerCode: Global.CustomerCode, CreditCode: creditCode  });

              activate.url = Global.ServiceUrl + Service.SOP + 'activategift/';*/

    /* Callbacks */
    /*Success Callbacks*/
    SearchGCardSuccess: function(model, response) {
      //Shared.LockTransactionScreen();
      this.ResponseMsg();
      if (!response) this.ReinitializeRechargeForm();
      else if (response.ErrorMessage) this.AlertMsg(response.ErrorMessage);
      else if (response.ItemType == Enum.ItemType.GiftCertificate) this.ReinitializeRechargeForm();
      else this.ProcessGCard(response);
    },

    ValidatePINSuccess: function(model, response) {
      //Shared.LockTransactionScreen();
      this.ResponseMsg();
      if (!response.Value) {
        this.AddMsg('Invalid PIN Please try Again...');
        _revertTextBack();
      } else {
        this.IsActivated = true;
        this.ShowGCardRechargeForm();
      }
    },

    FetchGCardDetailsSuccess: function(model, response) {
      //Shared.LockTransactionScreen();
      this.ResponseMsg();
      if (!response) return;
      if (response.ErrorMessage) {
        this.AlertMsg(response.ErrorMessage);
        return;
      }
      this.gcModel.set(response);
      if (this.gcModel.get("IsActivated") && !this.gcModel.get("PIN")) this.ProceedToNewPin(); // if activated but no PIN assigned yet.
      else if (this.gcModel.get("IsActivated")) this.ShowGCardActivationForm(ActivateFormType.PIN); // if activated.
      else if (this.gcModel.get("IsReturned")) this.AddMsg("Gift card already been returned."); // if gcard is already returned
      else { // if not activated yet.
        if (Global.ApplicationType == "Kiosk" && Global.Kiosk.Customer == null) this.AlertMsg("This card is not yet activated. Please enter customer code to process activation.", null, "Invalid Action")
        else {
          if (this.hasItemOnCart) navigator.notification.alert('This card is not yet activated.', null, 'Inactivate Gift Card');
          else navigator.notification.confirm('This card is not yet activated. Do you want to activate this card?', this.ProceedToActivationForm, 'Activate Gift Card');
        }
      }
    },

    ActivateGCardSuccess: function(model, response) {
      this.ResponseMsg();
      if (!response) return;
      if (response.ErrorMessage) this.AlertMsg(response.ErrorMessage);
      else {
        this.IsActivated = true;
        this.ShowGCardRechargeForm();
      }
      //this.FetchGCardDetails();
    },

    /* Failed Callbacks */
    ActivateGCardFailed: function(model, xhr, options) {
      this.ResponseMsg(true, "Error activation of gift card", "Request Timeout");
    },

    FetchGCardDetailsFailed: function(model, xhr, options) {
      this.ResponseMsg(true, "Error Retrieving Gift Card Details", "Request Timeout");
    },

    ValidatePINFailed: function(model, xhr, options) {
      this.ResponseMsg(true, "Error Validating PIN", "Request Timeout");
    },

    SearchGCardFailed: function(model, xhr, options) {
      this.ResponseMsg(true, "Error Retrieving Gift Card", "Request Timeout");
    },

    /* End Callbacks */

    ProcessGCard: function(response) {

      if (!this.gcModel) this.InitializeGiftCardModel();
      this.creditCode = response.CreditCode;
      this.gcModel.set(response);
      this.FetchGCardDetails();
    },

    ReinitializeRechargeForm: function() {
      //this.AlertMsg('Gift card does not exist.',null, 'No Record');
      this.IsActivated = false;
      this.InitializeGiftCardModel();
      this.ShowGCardRechargeForm();
      Shared.Focus("#gift-card-input");
      this.AddMsg('Gift card does not exist.');
    },

    ProceedToNewPin: function() {
      this.IsActivated = true;
      this.AlertMsg("This card is activated but doesn't have PIN yet.", null, 'Set New PIN');
      this.ShowGCardActivationForm(ActivateFormType.NewPIN);
    },

    ProceedToActivationForm: function(button) {
      if (button == 1) currentView.ShowGCardActivationForm();
      else currentView.ShowGCardRechargeForm();
    },

    InitializeGiftCardModel: function() {
      this.gcModel = new BaseModel();
      this.gcModel.set({
        SerialLotNumber: '',
        CreditAvailableRate: 0,
      });
    },

    ValidData: function() {
      this.GetFieldValues();
      if (this.IsSecondaryView()) {
        return this.ValidActivationFields();
      }

      if (!this.IsValid(this.serialNumber)) {
        this.AlertMsg('Please Enter Gift Card', null, 'Invalid gift card');
      } else if (this.IsRechargeForm()) {
        if (!this.IsActivated || this.hasItemOnCart) return true;
        if (this.newGCardSearch) return true;
        if (this.IsValid(this.amount) && this.amount > 0) return true;
        this.AlertMsg('Please Enter valid Amount', null, 'Invalid amount');
      } else {
        if (this.activateFormType == ActivateFormType.PIN) {
          if (this.IsValid(this.pin)) return true;
        } else if (this.IsValid(this.pin) && this.IsValid(this.confirmPIN)) {
          if (this.pin === this.confirmPIN) {
            if (this.pin.length > 3) return true;
            this.AddMsg('PIN is too short.', true);
          } else {
            this.AddMsg('PINs does not match.', true);
          }
        } else {
          this.AddMsg('Please fill all fields given.', true);
        }
      }
      return false;
    },

    ValidActivationFields: function() {
      if (this.activateFormType == ActivateFormType.PIN) {
        if (this.IsValid(this.pin)) return true;
      } else if (this.IsValid(this.pin) && this.IsValid(this.confirmPIN)) {
        if (this.pin === this.confirmPIN) {
          if (this.pin.length > 3) return true;
          this.AddMsg('PIN is too short.', true);
        } else {
          this.AddMsg('PINs does not match.', true);
        }
      } else {
        this.AddMsg('Please fill all fields given.', true);
      }
      return false;
    },

    GetCurrentModelAtt: function() {
      return this.gcModel.attributes;
    },

    GetFieldValues: function() {
      if (this.IsRechargeForm()) {
        if (this.serialNumber) {
          if (this.serialNumber != $('#gift-card-input').val()) this.newGCardSearch = true;
          else this.newGCardSearch = false;
        }
        this.serialNumber = $('#gift-card-input').val();
        this.amount = $('#amount-input').val();
      } else {
        this.pin = $('#pin-input').val();
        this.confirmPIN = $('#confirm-pin-input').val();
        this.encryptedPIN = this.EncryptPIN(this.pin);
      }
    },

    IsRechargeForm: function() {
      switch (this.formType) {
        case FormType.Recharge:
          return true;
          break;
        case FormType.Activate:
          return false;
          break;
        default:
          console.log('no form found!');
      }
    },

    EncryptPIN: function(str) {
      if (!str) str = this.pin;
      return Base64.encode(str);
    },

    ResponseMsg: function(showMsg, msg, title) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (showMsg) this.AlertMsg(msg, null, title);
    },

    AlertMsg: function(msg, action, title) {
      if (!title) title = 'Error'
      navigator.notification.alert(msg, action, title)
    },

    AddMsg: function(msg, isAbove) {
      $("#activate-giftcard-body p").remove();
      $("#recharge-giftcard-body p").remove();

      if (!isAbove) {
        $("#recharge-giftcard-body").append('<p style="font-color: red; font-align: left;"><i>*' + msg + '</i></p>');
        $("#activate-giftcard-body").append('<p style="font-color: red; font-align: left;"><i>*' + msg + '</i></p>');
      } else {
        $("#activate-giftcard-body").prepend('<p style="font-color: red; font-align: left;"><i>*' + msg + '</i></p>');
        $("#recharge-giftcard-body").prepend('<p style="font-color: red; font-align: left;"><i>*' + msg + '</i></p>');
      }
    },

    IsWaiting: function() {
      return $('#pin-input').hasClass('ui-disabled');
    },
    IsSecondaryView: function() {
      return (this.viewType == ViewType.SecondaryDisplay)
    },
    Hide: function() {
      $('input').blur();
      this.$el.hide();
    },
    IsValid: function(value) {
      return !(Shared.IsNullOrWhiteSpace(value));
    },
    ShowOverlay: function() { /*Shared.ShowHideBlockOverlay(true);*/ },
  });

  var _showActivityIndicator = function() {
    var target = document.getElementById('stop-asking-btn');

    _spinner = Spinner;
    _spinner.opts.left = 10; // Left position relative to parent in px
    _spinner.opts.radius = 3;
    _spinner.opts.lines = 9;
    _spinner.opts.length = 4; // The length of each line
    _spinner.opts.width = 3; // The line thickness

    _spinner.opts.color = '#000';

    _spinner.spin(target, "Cancel");
    $("#stop-asking-btn .ui-btn-text").text("Cancel");
    $(".ask-pin-btn").css("text-align", "center");
    $("#confirm-pin-input").addClass("ui-disabled");
    $("#pin-input").addClass("ui-disabled");
  }

  var _hideActivityIndicator = function() {
    _spinner = Spinner;
    _spinner.stop();
  }

  var _revertTextBack = function() {
    $('.ask-pin-btn').attr('id', 'ask-pin-btn');
    $(".ask-pin-btn .ui-btn-text").text("Allow User To Enter Pin");
    $(".ask-pin-btn").css("text-align", "center");
    _hideActivityIndicator();
    $("#confirm-pin-input").removeClass("ui-disabled");
    $("#pin-input").removeClass("ui-disabled");

  }

  return GiftCardView;
});
