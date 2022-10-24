/**
 * Connected Business | 05-24-2012
 * Required: model
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'text!template/23.0.0/pos/payment/paymentitem.tpl.html',
], function($, $$, _, Backbone, Global, template) {
  var ItemView = Backbone.View.extend({
    _template: _.template(template),
    tagName: "li",

    events: {
      "tap": "PaymentSelected"
    },

    render: function() {
      var _paymentDate = this.model.get("PaymentDate");
      var _paymentType = this.model.get("PaymentType");
      var _paymentMode = this.model.get("Mode");

      if (_paymentMode == "Refund") {
        _paymentType = _paymentMode + " - " + _paymentType;
      }

      if (!_paymentDate) {
        _paymentDate = new Date();
      } else {
        _paymentDate = new Date(parseInt(_paymentDate.substr(6)));
      }

      _paymentDate = this.FormatDate(_paymentDate);

      this.model.set({
        FormattedDate: _paymentDate,
        CurrencySymbol: Global.CurrencySymbol,
        FormattedPaymentType: _paymentType
      })

      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    //format the date for display
    FormatDate: function(date) {
      var month = date.getMonth() + 1
      var day = date.getDate()
      var year = date.getFullYear()
      return month + "/" + day + "/" + year;
    },

    PaymentSelected: function(e) {
      e.preventDefault();
      this.trigger("paymentSelected", this.model);
    },

  });
  return ItemView;
});
