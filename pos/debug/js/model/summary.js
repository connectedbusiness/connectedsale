/**
 * Connected Business | 05-2-2012
 */
define([
  'model/base',
  'bigdecimal',
  'js/libs/format.min.js'
], function(BaseModel, BigDecimal) {
  var SummaryItem = BaseModel.extend({
    defaults: {
      "SubTotal": 0.00,
      "TotalTax": 0.00,
      "Payment": 0.00,
      "Balance": 0.00,
      "Qty": 0,
      "TaxDisplay": 0.00,
      "TermDiscount": 0.00,
      "TotalDiscount": 0.00
    },

    Balance: function() {
      var _tax = format("0.0000", this.get("TotalTax").toFixed(2)),
      _bal = parseFloat(this.get("SubTotal").toFixed(2)) + parseFloat(this.RoundNumber(_tax, 2)) - parseFloat(this.get("Payment").toFixed(2));

      return parseFloat(_bal.toFixed(2));
    },

    DeductPotentialDiscountFromBalance: function() {
      var _tax = format("0.0000", this.get("TotalTax")),
      _subTotal = parseFloat(this.get("SubTotal").toFixed(2)) - parseFloat(this.get("TermDiscount").toFixed(2)),
      _bal = _subTotal + parseFloat(this.RoundNumber(_tax, 2)) - parseFloat(this.get("Payment").toFixed(2));
      return parseFloat(_bal.toFixed(2));
    },

    Subtotal: function() {
      return parseFloat(this.get("SubTotal").toFixed(2));
    },

    RoundNumber: function(value, dec) {
      var bigDecimal = new BigDecimal.BigDecimal(value);
      return bigDecimal.setScale(dec, BigDecimal.MathContext.ROUND_HALF_UP);
    }
  });
  return SummaryItem;
});
