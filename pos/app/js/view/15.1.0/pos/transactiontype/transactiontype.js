/**
 * Connected Business | 05-17-2012
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/enum',
  'text!template/15.1.0/pos/transactiontype/transactiontype.tpl.html',
], function($, $$, _, Backbone, Global, Enum, template) {

  var TransactionTypeView = Backbone.View.extend({
    _template: _.template(template),
    className: "popover",
    id: "transaction-popover",
    attributes: {
      style: "display: none;"
    },

    events: {
      "tap li": "SelectTransactionType",
    },

    render: function(type) {
      this.$el.html(this._template());
      return this;
    },

    SelectTransactionType: function(e) {
      e.preventDefault();
      var button = e.target.id;
      var transactionType;
      switch (button) {
        case "transType-Sale":
          transactionType = Enum.TransactionType.Sale;
          //Global.TransactionType = "CreateInvoice";
          Global.Preference.DefaultPOSTransaction = 0;
          break;
        case "transType-Order":
          transactionType = Enum.TransactionType.Order;
          //Global.TransactionType = "CreateOrder";
          Global.Preference.DefaultPOSTransaction = 1;
          break;
        case "transType-Quote":
          if (this.HasPayment) {
            var _errorMessage = "Current transaction already has payment. Change to 'Quote' is not allowed.";
            console.log(_errorMessage);
            navigator.notification.alert(_errorMessage, null, "Action Not Allowed", "OK");
            return;
          }

          transactionType = Enum.TransactionType.Quote;
          //Global.TransactionType = "CreateQuote";
          Global.Preference.DefaultPOSTransaction = 2;
          break;
        case "transType-Return":
          transactionType = Enum.TransactionType.Return;
          //Global.TransactionType = "CreateRefund";
          Global.Preference.DefaultPOSTransaction = 3;
          break;
      }

      this.trigger("transactionTypeChanged", transactionType);
      this.Close();
    },

    Close: function() {
      this.Hide();
    },

    ApplyStyle: function(element, checkElement, selected) {
      if (selected) {
        element.css({
          'color': '#324f85'
        });
        checkElement.css({
          'visibility': 'visible'
        })
      } else {
        element.css({
          'color': '#333333'
        });
        checkElement.css({
          'visibility': 'hidden'
        })
      }
    },

    ApplySelectedTransactionStyle: function(type) {
      this.ApplyStyle(this.$("#transType-Sale"), this.$("#transType-Sale .icon-ok"), false);
      this.ApplyStyle(this.$("#transType-Order"), this.$("#transType-Order .icon-ok"), false);
      this.ApplyStyle(this.$("#transType-Quote"), this.$("#transType-Quote .icon-ok"), false);
      this.ApplyStyle(this.$("#transType-Return"), this.$("#transType-Return .icon-ok"), false);

      switch (type) {
        case Enum.TransactionType.Sale:
          this.ApplyStyle(this.$("#transType-Sale"), this.$("#transType-Sale .icon-ok"), true);
          break;
        case Enum.TransactionType.Order:
          this.ApplyStyle(this.$("#transType-Order"), this.$("#transType-Order .icon-ok"), true);
          break;
        case Enum.TransactionType.Quote:
          this.ApplyStyle(this.$("#transType-Quote"), this.$("#transType-Quote .icon-ok"), true);
          break;
        case Enum.TransactionType.Return:
          this.ApplyStyle(this.$("#transType-Return"), this.$("#transType-Return .icon-ok"), true);
          break;
      }
    },

    Enabled: function() {
      if (Global.Preference.AllowSales === false) {
        this.$("#transType-Sale").hide();
      }

      if (Global.Preference.AllowOrders === false) {
        this.$("#transType-Order").hide();
      }

      if (Global.Preference.AllowQuotes === false) {
        this.$("#transType-Quote").hide();
      }

      if (Global.Preference.AllowReturns === false) {
        this.$("#transType-Return").hide();
      }
    },

    Show: function(type, haspayment) {
      this.Enabled();
      this.HasPayment = haspayment;
      this.ApplySelectedTransactionStyle(type);
      this.$el.show();
    },

    Hide: function() {
      this.$el.hide();
    },

  });
  return TransactionTypeView;
});
