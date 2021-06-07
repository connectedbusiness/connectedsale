/**
 * @author mark.figueroa
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
  'text!template/20.1.0/pos/payment/gift.tpl.html',
  'view/spinner',
], function($, $$, _, Backbone, Global, Service, Method, Enum, Shared, BaseModel, template, Spinner) {

  var ClassID = {
    PinHeader: ".container-headerPIN ",
    PinBody: ".giftPINDetails ",
    PinEntry: ".container-giftEPIN ",
    PinConfirm: ".container-giftCPIN ",
    InputPINE: "#giftEPIN ",
    InputPINC: "#giftCPIN ",
    InputTotal: "#giftTotal ",
    InputAvailable: "#giftAvailable ",
    InputSerial: "#giftSerial ",
    InputApply: "#giftApply ",
    Message: ".giftMessage i ",
    PINDetails: ".giftPINDetails ",
    Verify: "#btnVerify  "
  }

  var GiftView = Backbone.View.extend({

    _template: _.template(template),

    events: {
      "change #giftSerial": "txtSerial_change",
      "change #giftEPIN": "txtEPIN_change",
      // "keyup #giftEPIN"       : "txtEPIN_keyup",_showActivityIndicator
      "keypress #giftEPIN": "txtEPIN_keypress",
      "change #giftCPIN": "txtCPIN_change",
      "tap #btnVerify": "btnVerify_tap",
      "change #giftApply": "txtApply_change",

      "tap #ask-pin-btn": "AskPIN_tapped",
      "tap #stop-asking-btn": "StopAsking_tapped",
    },

    initialize: function() {
      this.ResetAll();
      this.render();
      Shared.Focus(ClassID.InputSerial);
    },

    render: function() {
      Global.ViewRecipient = "Payment";
      this.$el.html(this._template);
      this.$el.css('width', '385px');
      this.$el.find("input").css('float', 'right');
      this.$el.find("input").css('margin-bottom', '5px');
      this.$el.find("label").css('float', 'left');
      this.ToggleDetails();
      this.DisplayCredit(true);
      return this.$el;
    },

    AskPIN_tapped: function(e) {
      e.preventDefault();

      $('.ask-pin-btn').attr('id', 'stop-asking-btn');
      $("#giftEPIN").trigger('focusout');
      $("#giftCPIN").trigger('focusout');
      $("#giftEPIN").trigger('blur');
      $("#giftCPIN").trigger('blur');

      $("#giftEPIN").attr("readonly", "readonly");
      $("#giftEPIN").addClass("ui-disabled");
      $("#giftCPIN").attr("readonly", "readonly");
      $("#giftCPIN").addClass("ui-disabled");

      _showActivityIndicator();
      var _formType = this.GetFormType();
      this.trigger("askToEnterPIN", _formType, this);
    },

    StopAsking_tapped: function(e) {
      e.preventDefault();
      this.$('.ask-pin-btn').attr('id', 'ask-pin-btn');
      _revertTextBack();
      this.trigger("stopAskingPIN", "Recharge", this);
    },

    GetFormType: function() {
      if (this.IsActivated && this.HasPin) return "PIN";
      else if (this.IsActivated && !this.HasPin) return "New PIN";
      return "Activate"
    },

    PopulatePINFields: function(pin) {
      if (!pin) pin = Global.PIN;
      $(ClassID.InputPINE).val(pin).change();
      $(ClassID.InputPINC).val(pin).change();
      _revertTextBack();
      if (this.HasPin && this.IsActivated) {
        if (this.$el.find(ClassID.InputPINE).val() == '') return;
        this.txtEPIN_change();
        this.VerifyPIN();
      }
    },

    txtSerial_change: function(e) {
      e.preventDefault();
      this.ValidateSerial();
    },

    txtEPIN_change: function(e) {
      if (this.gift) {
        if (this.$el.find(ClassID.InputPINE) != "") {
          if (!this.IsActivated) this.Message('Please Re-Enter PIN to Confirm.');
          else {
            if (this.HasPin) this.Message('Press OK to verify PIN.');
            else this.Message('Please Enter PIN.');
          }
          this.$el.find(ClassID.InputPINC).val('');
          this.gift.set({
            PIN: Base64.encode(this.$el.find(ClassID.InputPINE).val())
          });
          this.EnableKeypadDone(false);
        }
      }
    },

    // txtEPIN_keyup: function (e) {
    txtEPIN_keypress: function(e) {
      if (e.keyCode === 13 && this.IsCard && this.IsActivated && this.HasPin) {
        if (this.$el.find(ClassID.InputPINE).val() == '') return;
        this.txtEPIN_change();
        this.VerifyPIN();
      }
    },

    txtCPIN_change: function(e) {
      this.CheckPIN();
      this.EnableKeypadDone(false);
    },

    btnVerify_tap: function(e) {
      e.preventDefault();
      if (this.IsWaiting()) return;
      if (this.IsActivated && this.HasPin) {
        this.VerifyPIN();
      } else {
        this.ActivateGift();
      }
    },

    txtApply_change: function(e) {
      if (this.$el.find(ClassID.InputApply).val() == '') return;
      if (this.$el.find(ClassID.InputApply).val() > this.credit.get("CreditAvailableRate")) {
        this.Message("Maximum amount allowed is " + Global.CurrencySymbol + " " + this.credit.get("CreditAvailableRate").toFixed(2) + ".", 'red');
        this.$el.find(ClassID.InputApply).val("");
        this.$el.find(ClassID.Message).fadeOut();
        return;
      }

      this.credit.set({
        AmountToUse: this.$el.find(ClassID.InputApply).val()
      });
    },

    ResetAll: function(notSerial) {
      this.IsCard = false;
      this.HasPin = false;
      this.IsActivated = false;
      this.IsPinOK = false;
      this.Verified = false;

      this.AvailableCredit = 0;
      this.gift = new BaseModel();
      this.credit = new BaseModel();

      this.$el.find(ClassID.InputPINE).val('');
      this.$el.find(ClassID.InputPINC).val('');

      this.DisplayCredit(true);
      this.ToggleDetails();
    },

    CheckPIN: function() {
      if (this.gift) {
        if (!this.HasPin && this.$el.find(ClassID.InputPINE) != "" && this.$el.find(ClassID.InputPINE).val() != this.$el.find(ClassID.InputPINC).val()) {
          this.Message('Activation PIN does not match.', 'red');
          return false;
        } else {
          this.Message('Press OK to Activate Card.');
          return true;
        }
      }
      return false;
    },

    Show: function() {
      this.$el.show();
      this.render();
      Shared.Focus(ClassID.InputSerial);
      gift - card - input
    },

    Close: function() {},

    ToggleDetails: function() {
      if (this.IsCard) {
        this.EnableKeypadDone(this.Verified);
        this.$el.find(ClassID.PinBody).show();
        if (!this.IsActivated || !this.HasPin) {
          this.$(ClassID.PinHeader).show();
          this.$(ClassID.PinEntry).show();
          this.$(ClassID.PinConfirm).show();
          this.$(ClassID.PINDetails).addClass('giftPINDetails-activate');
        } else {
          this.$(ClassID.PinHeader).hide();
          this.$(ClassID.PinEntry).show();
          this.$(ClassID.PinConfirm).hide();
          this.$(ClassID.PINDetails).removeClass('giftPINDetails-activate');
        }
        Shared.Focus(ClassID.InputPINE);
      } else {
        this.$(ClassID.PinHeader).hide();
        this.$(ClassID.PinBody).hide();
        this.EnableKeypadDone((this.gift && this.gift.get('SerialLotNumber')));
      }

    },

    EnableKeypadDone: function(val) {
      if (val) {
        this.$('#keypad-done-btn').removeClass('ui-disabled');
        this.$(ClassID.InputPINE).addClass('ui-disabled');
        this.$(ClassID.InputPINE).attr("readonly", "readonly");
        this.$(ClassID.Verify).addClass('ui-disabled');
        this.$('#ask-pin-btn').addClass('ui-disabled');
      } else {
        this.$('#keypad-done-btn').addClass('ui-disabled');
        this.$(ClassID.InputPINE).removeClass('ui-disabled');
        this.$(ClassID.InputPINE).removeAttr("readonly");
        this.$(ClassID.Verify).removeClass('ui-disabled');
        this.$('#ask-pin-btn').removeClass('ui-disabled');
        this.Verified = false;
      }
    },

    Hide: function() {
      $("#main-transaction-blockoverlay").hide();
      this.$el.html("");
      this.$el.hide();
    },

    Message: function(msg, color, quick) {
      if (!msg) msg = '';
      if (!color) color = 'black';
      this.$el.find(ClassID.Message).hide();
      this.$el.find(ClassID.Message).html(msg);
      this.$el.find(ClassID.Message).css('color', color);
      if (!quick) this.$el.find(ClassID.Message).fadeIn();
      else this.$el.find(ClassID.Message).show();
    },

    ValidateSerial: function() {
      this.ResetAll();
      var serial = this.$el.find(ClassID.InputSerial).val();
      if (!serial || serial == "") return;
      this.Message('Validating Serial Number...', null, true);

      var self = this;
      this.gift = new BaseModel();
      this.gift.set({
        SerialLotNumber: serial
      });
      this.gift.url = Global.ServiceUrl + Service.SOP + Method.GETGIFTDETAILBYSERIAL;
      this.gift.save(this.gift, {
        success: function(model, response) {
          self.ValidateSerialSuccess(response);
        },
        error: function(model, error, response) {
          self.ValidateSerialError(error, response);
        }
      });
    },

    ValidateSerialSuccess: function(response) {
      this.$el.find(ClassID.InputPINE).val('');
      this.$el.find(ClassID.InputPINC).val('');
      this.DisplayCredit(true);

      if (!response) {
        this.ResetAll();
        this.Message('Serial Number does not exist.', 'red');
      } else if (response.IsReturned) {
        this.ResetAll();
        this.Message(response.ItemType + ' already been returned.', 'red');
      } else {
        this.IsActivated = response.IsActivated || false;
        if (!response.PIN || response.PIN == "") this.HasPin = false;
        else this.HasPin = true;

        if (response.ItemType == "Gift Card") {
          this.IsCard = true;
          this.LoadGiftDetails();
          this.Message('Please Enter the PIN.');
        } else {
          this.IsCard = false;
          this.LoadGiftDetails();
          this.Message('Enter Amount to Use.');
        }
        this.ToggleDetails();
      }
    },

    ValidateSerialError: function(error, response) {
      this.Message('Unable to validate serial number.', 'red');
      this.ResetAll();
    },

    LoadGiftDetails: function() {
      var self = this;
      this.credit = new BaseModel();
      this.credit.set(self.gift.attributes);
      this.credit.url = Global.ServiceUrl + Service.SOP + Method.GETGIFTCREDITS;
      this.credit.save(this.credit, {
        success: function(model, response) {
          self.LoadGiftDetailsSuccess(response);
        },
        error: function(model, error, response) {
          self.LoadGiftDetailsError(error, response);
        }
      });
    },

    LoadGiftDetailsSuccess: function(response) {
      if (!response) {
        this.ResetAll();
        this.Message('Unable to load credits.', 'red');
        return;
      }

      if (this.IsActivated && response.CustomerCode != Global.CustomerCode) {
        this.Message('Gift Certificate/Card does not belong to current customer.', 'red');
        this.ResetAll();
        return;
      }

      this.credit = new BaseModel();
      this.credit.set(response);
      if (!this.IsCard) this.DisplayCredit();
    },

    LoadGiftDetailsError: function(error, response) {
      this.ResetAll();
      this.Message('Unable to load credits.', 'red');
    },

    SetCreditsAvailable: function(available, total) {
      this.$el.find(ClassID.InputAvailable).val(Global.CurrencySymbol + ' ' + available.toFixed(2));
      this.$el.find(ClassID.InputTotal).val(Global.CurrencySymbol + ' ' + total.toFixed(2));
      this.trigger('changeKeypadAmount', available);
    },
    formatAmount: function(nStr) /*jj*/ {
      var i = nStr.replace(",", "");
      var display = i.replace(",", "");
      var val = format("#,##0.00", display.replace(",", ""));
      return val;
    },
    DisplayCredit: function(isReset) {
      if (isReset) {
        this.SetCreditsAvailable(0, 0);
        return;
      }
      var available = this.credit.get("CreditAvailableRate") || 0;
      var total = this.credit.get("TotalRate") || 0;
      this.SetCreditsAvailable(available, total);
      this.TriggerEvents("GiftVerified", this.credit);

    },

    ActivateGift: function(sender, callBack, args) {
      if (!this.CheckPIN() && this.IsCard) return;
      var self = this;

      var activate = new BaseModel();
      activate.set(this.gift.attributes);

      var setPIN = false;
      if (this.IsCard && !this.HasPin) setPIN = true;

      var creditCode = this.gift.get('CreditCode');

      activate.set({
        SetPIN: setPIN,
        CustomerCode: Global.CustomerCode,
        CreditCode: creditCode
      });

      activate.url = Global.ServiceUrl + Service.SOP + 'activategift/';
      activate.save(activate, {
        success: function(model, response) {
          if (response && response.ErrorMessage && response.ErrorMessage != "") {
            navigator.notification.alert(response.ErrorMessage, null, "Activation Error", "OK");
            self.DisplayCredit(true);
            return;
          }
          self.$('input').blur();
          self.IsActivated = true;
          self.IsPinOK = true;
          self.HasPin = true;
          self.Verified = true;
          self.EnableKeypadDone(true);
          self.ToggleDetails();
          //self.DisplayCredit();
          self.Message('Gift Card/Certificate Activated!');
          if (sender && callBack) sender[callBack].apply(sender, args);
          else self.DisplayCredit();
        },
        error: function(model, error, response) {
          navigator.notification.alert("An error was encountered when trying to Activate Gift Card/Certificate.", null, "Activation Error", "OK");
          self.Message('Gift Card/Certificate Activation Error!', 'red');
          self.DisplayCredit(true);
        }
      });
    },

    VerifyPIN: function() {
      this.$('input').blur();
      var self = this;
      var pin = new BaseModel();
      pin.set(this.gift.attributes);
      pin.url = Global.ServiceUrl + Service.SOP + 'validategiftpin/';
      pin.save(pin, {
        success: function(model, response) {
          if (response && response.ErrorMessage && response.ErrorMessage != "") {
            navigator.notification.alert(response.ErrorMessage, null, "PIN Error", "OK");
            self.DisplayCredit(true);
            return;
          }
          self.IsPinOK = response.Value || false;
          if (self.IsPinOK) {
            self.Verified = true;
            self.Message('Gift Card Verified!');
            self.EnableKeypadDone(true);
            self.DisplayCredit();
          } else {
            self.Message('Invalid PIN. Please try again.', 'red');
            self.DisplayCredit(true);
          }
        },
        error: function(model, error, response) {
          navigator.notification.alert("An error was encountered when trying to verify PIN.", null, "PIN Error", "OK");
          self.Message('Gift Card PIN Verification Error!', 'red');
          self.DisplayCredit(true);
        }
      });
    },

    ValidateGift: function(enteredAmount, sender, callBack, args) {
      if (!this.gift || !this.credit) return false;

      if (this.IsCard && !this.Verified) {
        navigator.notification.alert("Gift Card is not yet Verified.", null, "Gift Card", "OK");
        return false;
      }

      var available = this.credit.get("CreditAvailableRate") || 0;
      if (available <= 0) {
        navigator.notification.alert("Gift Card/Certificate Does not have credit available.", null, "Credit Check", "OK");
        return false;
      }

      if (available < enteredAmount) {
        navigator.notification.alert("Maximum amount allowed is " + Global.CurrencySymbol + " " + available.toFixed(2) + ".", null, "Credit Check", "OK");
        return false;
      }

      var self = this;
      if (!this.IsActivated && !this.IsCard) {
        this.ActivateGift(sender, callBack, args);
        return false;
      }
      return true;
    },

    TriggerEvents: function(eventName, value) {
      this.trigger(eventName, value);
    },

    IsWaiting: function() {
      var _wait = $(ClassID.InputSerial).hasClass('ui-disabled');
      if (_wait) navigator.notification.alert("Waiting for the customer to enter pin.", null, "Invalid Action", "OK");
      return _wait;
    }

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
    $("#giftSerial").addClass("ui-disabled");
    $("#giftSerial").attr("readonly", "readonly");
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
    $("#giftEPIN").removeClass("ui-disabled");
    $("#giftCPIN").removeClass("ui-disabled");
    $("#giftSerial").removeClass("ui-disabled");
    $("#giftSerial").removeAttr("readonly", "readonly");
    $("#giftEPIN").removeAttr("readonly", "readonly");
    $("#giftCPIN").removeAttr("readonly", "readonly");
  }



  return GiftView;
})
