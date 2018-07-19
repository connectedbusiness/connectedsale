/**
 * @author alexis.banaag
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/method',
  'shared/service',
  'shared/enum',
  'model/base',
  'text!template/16.0.0/pos/payment/paymenttype.tpl.html'
], function($, $$, _, Backbone, Global, Method, Service, Enum, BaseModel, template) {
  var PaymentTypeView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap #btn-donePayment": "buttonDone_payment",
      "tap #btn-cashPayment": "buttonCash_payment",
      "tap #btn-checkPayment": "buttonCheck_payment",
      "tap #btn-cardPayment": "buttonCard_payment",
      "tap #btn-gift": "buttonApplyGift",
      "tap #btn-loyalty": "buttonApplyLoyalty",
      "tap #btn-suspendPayment": "buttonSuspend_payment",
      "tap #btn-paymentOnAccount": "buttonPaymentOnAccount",
      "tap #btn-returnPayment": "buttonReturn_payment",
      "tap #btn-saveOrder": "buttonSaveOrder"
    },

    buttonDone_payment: function(e) {
      e.preventDefault();
      this.Hide();
    },

    buttonCash_payment: function(e) {
      e.preventDefault();
      this.trigger('cash', this);
      this.Close();
    },

    buttonCheck_payment: function(e) {
      e.preventDefault();
      this.trigger('check', this);
      this.Close();
    },

    buttonCard_payment: function(e) {
      e.preventDefault();
      this.FetchCreditCardAllowSale();
    },

    FetchCreditCardAllowSale: function() {
      Global.AllowSaleCreditPreference = false;
      var self = this;
      var mdl = new BaseModel();
      mdl.url = Global.ServiceUrl + Service.POS + Method.GETCREDITCARDALLOWSALE;
      mdl.fetch({
        success: function(model, response, xhr) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          Global.AllowSaleCreditPreference = response;
          self.ProceedToCardAction();;
          console.log(response);
        },
        error: function(errorResponse) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.ProceedToCardAction();
          console.log(errorResponse);
        }
      });
    },

    ProceedToCardAction: function() {
      this.trigger('card', this);
      this.Close();
    },

    buttonApplyGift: function(e) {
      e.preventDefault();
      this.trigger('gift', this);
      this.Close();
    },

    buttonApplyLoyalty: function(e) {
      e.preventDefault();
      this.trigger('loyalty', this);;
      this.Close();
    },

    buttonSuspend_payment: function(e) {
      e.preventDefault();
      this.trigger('suspend', this);
      this.Close();
    },

    buttonPaymentOnAccount: function(e) {
      e.preventDefault();
      this.trigger('onAccount', this);
      this.Close();
    },

    buttonSaveOrder: function(e) {
      e.preventDefault();
      this.trigger('onAccount', this);
      this.Close();
    },

    buttonReturn_payment: function(e) {
      e.preventDefault();
      this.trigger('onAccount', this);
      this.Close();
    },

    initialize: function() {
      this.isPaid = this.options.isPaid;

      this.render();
    },

    render: function() {
      this.$el.html(this._template);

      switch (Global.TransactionType) {
        case Enum.TransactionType.Sale:
        case Enum.TransactionType.Suspend:
          if (this.isPaid) $("#btn-suspendPayment").hide();
          else $("#btn-suspendPayment").show();

          $("#btn-cashPayment").show();
          $("#btn-checkPayment").show();
          $("#btn-cardPayment").show();
          $("#btn-paymentOnAccount").show();

          $("#btn-gift").show();
          $("#btn-loyalty").show();

          $("#btn-returnPayment").hide();
          $("#btn-saveOrder").hide();
          //this.CheckIfIsTrackLoyalty();
          break;

        case Enum.TransactionType.Order:
          $("#btn-cashPayment").show();
          $("#btn-checkPayment").show();
          $("#btn-cardPayment").show();
          $("#btn-paymentOnAccount").hide();

          $("#btn-gift").show();
          $("#btn-loyalty").show();
          $("#btn-cashPayment").addClass('box2');

          $("#btn-returnPayment").hide();
          $("#btn-saveOrder").show();
          $("#btn-suspendPayment").hide();
          //this.CheckIfIsTrackLoyalty();
          break;
        case Enum.TransactionType.Return:
          $("#btn-cashPayment").hide();
          $("#btn-checkPayment").hide();
          $("#btn-cardPayment").hide();
          $("#btn-returnPayment").show();

          $("#btn-gift").hide();
          $("#btn-loyalty").hide();

          $("#btn-paymentOnAccount").hide();
          $("#btn-saveOrder").hide();
          $("#btn-suspendPayment").hide();
          //this.CheckIfIsTrackLoyalty();
          break;
        case Enum.TransactionType.UpdateInvoice:
        case Enum.TransactionType.Recharge:
          if (this.isPaid) {
            $("#btn-suspendPayment").hide();
          } else {
            $("#btn-suspendPayment").show();
          }
          $("#btn-cashPayment").show();
          $("#btn-checkPayment").show();
          $("#btn-cardPayment").show();
          $("#btn-paymentOnAccount").show();

          $("#btn-gift").show();
          $("#btn-loyalty").show();

          $("#btn-saveOrder").hide();
          $("#btn-returnPayment").hide();
          //this.CheckIfIsTrackLoyalty();
          break;
        case Enum.TransactionType.UpdateOrder:
          $("#btn-cashPayment").show();
          $("#btn-checkPayment").show();
          $("#btn-cardPayment").show();
          $("#btn-saveOrder").show();

          $("#btn-gift").show();
          $("#btn-loyalty").show();
          $("#btn-cashPayment").addClass('box2');

          $("#btn-paymentOnAccount").hide();
          $("#btn-returnPayment").hide();
          $("#btn-suspendPayment").hide();
          //this.CheckIfIsTrackLoyalty();
          break;
        case Enum.TransactionType.ConvertQuote:
        $("#btn-cashPayment").show();
        $("#btn-checkPayment").show();
        $("#btn-cardPayment").show();
        $("#btn-saveOrder").show();

        $("#btn-gift").show();
        $("#btn-loyalty").show();
        $("#btn-cashPayment").addClass('box2');

        $("#btn-paymentOnAccount").hide();
        $("#btn-returnPayment").hide();
        $("#btn-suspendPayment").hide();
          //this.CheckIfIsTrackLoyalty();
          break;
        case Enum.TransactionType.ConvertOrder:
          $("#btn-cashPayment").show();
          $("#btn-checkPayment").show();
          $("#btn-cardPayment").show();
          $("#btn-paymentOnAccount").show();

          $("#btn-gift").show();
          $("#btn-loyalty").show();

          $("#btn-returnPayment").hide();
          $("#btn-saveOrder").hide();
          $("#btn-suspendPayment").hide();
          //this.CheckIfIsTrackLoyalty();
          break;
        case Enum.TransactionType.SalesPayment:
          $("#btn-cashPayment").show();
          $("#btn-checkPayment").show();
          $("#btn-cardPayment").show();
          $("#btn-paymentOnAccount").show();

          $("#btn-gift").show();
          $("#btn-loyalty").show();

          $("#btn-returnPayment").hide();
          $("#btn-saveOrder").hide();
          $("#btn-suspendPayment").hide();
          //this.CheckIfIsTrackLoyalty();
          break;
        case Enum.TransactionType.SalesRefund:
          $("#btn-cashPayment").show();
          $("#btn-checkPayment").show();
          $("#btn-cardPayment").show();
          $("#btn-returnPayment").show();

          $("#btn-gift").hide();
          $("#btn-loyalty").hide();

          $("#btn-paymentOnAccount").hide();
          $("#btn-saveOrder").hide();
          $("#btn-suspendPayment").hide();
          break;
      }

      $("#main-transaction-blockoverlay").show();
      this.$("#paymentTypeBody").trigger('create');
    },

    CheckIfIsTrackLoyalty: function() {
      if (!Global.CustomerHasLoyalty) {
        $("#btn-loyalty").hide();
        if (!$("#btn-paymentOnAccount").is(":visible")) {
          $("#btn-cashPayment").addClass('box3');
        } else {
          $("#btn-cashPayment").addClass('box2');
        }
      } else {
        $("#btn-loyalty").show();
      }
    },

    Show: function(isPaid) {
      this.isPaid = isPaid;
      this.$el.show();
      this.render();
    },

    Close: function() {
      this.$("#paymentType").remove();
    },

    Hide: function() {
      $("#main-transaction-blockoverlay").hide();
      this.$el.html("");
      this.$el.hide();
    }
  });
  return PaymentTypeView;
})
