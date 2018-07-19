/**
 * Connected Business | 05-24-2012
 * Required: el, collection
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/enum',
  'view/15.0.1/pos/payment/paymentitem',
  'text!template/15.0.1/pos/payment/payments.tpl.html',
  'text!template/15.0.1/pos/payment/paymentdetailcash.tpl.html',
  'text!template/15.0.1/pos/payment/paymentdetailcheck.tpl.html',
  'text!template/15.0.1/pos/payment/paymentdetailcreditcard.tpl.html',
  'text!template/15.0.1/pos/payment/paymentdetailgift.tpl.html',
  'text!template/15.0.1/pos/payment/paymentdetailloyalty.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Enum,
  PaymentItemView, template,
  CashTemplate, CheckTemplate, CreditCardTemplate, GiftTemplate, LoyaltyTemplate) {

  var PaymentsView = Backbone.View.extend({
    _template: _.template(template),

    _cashTemplate: _.template(CashTemplate),
    _checkTemplate: _.template(CheckTemplate),
    _creditCardTemplate: _.template(CreditCardTemplate),
    _giftTemplate: _.template(GiftTemplate),
    _loyaltyTemplate: _.template(LoyaltyTemplate),
    events: {
      "tap .btn-Done": "btnDone_tap",
      "tap .btn-Remove": "btnRemove_tap",
      "tap .btn-Back": "btnBack_tap"
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      if (this.collection.length === 0) {
        this.Close();
        return;
      }
      this.$el.html(this._template());
      this.InitializePaymentItems();
      $("#main-transaction-blockoverlay").show();
    },

    InitializePaymentItems: function() {
      this.paymentHasSignature = false;
      this.CCPaymentHasSignature = false;

      this.collection.each(this.InitializePaymentItem, this);

      this.$(".btn-Done").show();
      this.$(".btn-Remove").hide();
      this.$(".title").html("Payments");
      this.$(".popover-left").hide();
      this.$(".div-paymentsList").show();
      this.$(".div-paymentDetail").hide();

      this.AdjustFormSize();

      this.$("#paymentsListBody").trigger("create");
      this.myScroll = new iScroll('paymentsListBody');
    },

    InitializePaymentItem: function(item) {
      var _paymentItemView = new PaymentItemView({
        model: item
      });
      this.$(".ul-paymentsList").append(_paymentItemView.render().el);
      _paymentItemView.bind("paymentSelected", this.PaymentSelected, this);

      //check if payment has a signature attached to it
      if (item.get("SignatureSVG") != null && item.get("SignatureSVG") != "") {
        this.paymentHasSignature = true;
        if (item.get("PaymentType") === Enum.PaymentType.CreditCard) {
          this.CCPaymentHasSignature = true;
        }
      }
    },

    AdjustFormSize: function() {
      if (this.CCPaymentHasSignature) {
        $("#paymentsListBody").addClass("paymentsListBodyLarge");
      } else if (this.paymentHasSignature) {
        $("#paymentsListBody").addClass("paymentsListBodyMedium");
      }
    },

    InitializePaymentDetail: function(paymentDetail) { //v14
      this.model = paymentDetail;
      if (paymentDetail) {
        var type = paymentDetail.get("PaymentType");
        var template;
        switch (type) {
          case Enum.PaymentType.Cash:
          case "Term Discount":
            template = this._cashTemplate;
            break;
          case Enum.PaymentType.Check:
            template = this._checkTemplate;
            break;
          case Enum.PaymentType.CreditCard:
            template = this._creditCardTemplate;
            break;
          case Enum.PaymentType.Gift:
            template = this._giftTemplate;
            break;
          case Enum.PaymentType.Loyalty:
            template = this._loyaltyTemplate;
        }

        if (template) {
          this.$(".btn-Done").hide();
          this.$(".btn-Remove").show();
          this.$(".title").html(type);
          this.$(".popover-left").show();
          this.$(".div-paymentsList").hide();
          if (!paymentDetail.get('EncryptedCreditCardNumber')) paymentDetail.set({
            EncryptedCreditCardNumber: ""
          })
          var clonePayment = paymentDetail.clone();

          //Add Mask To Serial Number
          var getMask = function(val, start, length) {
            val = val || '';
            start = start || 0;
            length = length || 0;
            var mask = '';
            for (var x = 0; x < length; x++) {
              mask = mask + 'X';
            }
            return mask + val.substring(length, val.length);
          }
          var gcSerial = clonePayment.get("SerialLotNumber") || '';
          if (gcSerial.length <= 4) gcSerial = getMask(gcSerial, 0, gcSerial.length);
          else gcSerial = getMask(gcSerial, 0, gcSerial.length - 4);
          clonePayment.set({
            SerialLotNumber: gcSerial
          })

          this.$(".div-paymentDetail").html(template(clonePayment.toJSON()));
          this.$(".div-paymentDetail").show();
          this.$("#paymentsListBody").trigger("create");
          this.GetSignature(paymentDetail);
        }
      }
    },

    PaymentSelected: function(model) {
      this.InitializePaymentDetail(model);
    },

    Close: function() {
      this.Hide();
      $("#main-transaction-blockoverlay").hide();
    },

    Show: function() {
      this.render();
      this.$el.show();
      this.myScroll = new iScroll('paymentsListBody');
    },

    Hide: function() {
      this.$el.hide();
    },

    btnDone_tap: function(e) {
      e.preventDefault();
      this.Close();
    },

    btnRemove_tap: function(e) {
      e.preventDefault();
      //Delete the payment from collection if not yet saved in the database.
      if (this.model && this.model.get("IsNew")) {
        this.collection.remove(this.model);
        this.render();
      } else {
        console.log("Only new payments can be removed.");
        navigator.notification.alert("Only new payments can be removed.", null, "Action Not Allowed", "OK");
      }
    },

    btnBack_tap: function(e) {
      e.preventDefault();
      this.render();
    },

    GetSignature: function(paymentDetail) {
      var _signatureSVG = paymentDetail.get("SignatureSVG")
      if (_signatureSVG) {
        if (_signatureSVG.indexOf("[SVGID]:") !== -1) {
          _signatureSVG = paymentDetail.get("SignatureSVGContent");
        }

        var svgbase64 = _signatureSVG;
        var i = new Image();
        i.src = "data:image/svg+xml;base64," + svgbase64
        this.$(".signatureDisplay-container").show();
        this.$(".signatureDisplay").html($(i));
      }
    },

  });
  return PaymentsView;
});
