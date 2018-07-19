/**
 * Connected Business | 05-2-2012
 * Required: el, collection
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'bigdecimal',
  'backbone',
  'shared/global',
  'text!template/16.0.0/pos/cart/total.tpl.html',
  'js/libs/format.min.js'
], function($, $$, _, BigDecimal, Backbone, Global, template) {
  var CartView = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      this.type = this.options.type;
      this.collection.on("change", this.UpdateTotal, this);
      this.collection.on("add", this.UpdateTotal, this);
      this.collection.on("remove", this.UpdateTotal, this);
      this.model.on("add", this.UpdateTotal, this);
      this.model.on("change", this.UpdateTotal, this);
      this.model.on("remove", this.UpdateTotal, this);
      this.render();
    },

    UpdateTotal: function() {
      this.render();
    },

    render: function() {
      var _totalTax = format("0.0000", this.collection.totalTax());
      var _total = format("0.0000", this.collection.total());

      _totalTax = this.RoundNumber(_totalTax, 4);

      total = parseFloat(_total) + parseFloat(_totalTax);

      this.$el.html(this._template({
        CurrencySymbol: Global.CurrencySymbol,
        Total: format("#,##0.00", total)
      }));
    },

    /**
		 Round off numbers

		 @method RoundNumber
		 **/
    RoundNumber: function(value, dec) {
      var bigDecimal = new BigDecimal.BigDecimal(value);
      return bigDecimal.setScale(dec, BigDecimal.MathContext.ROUND_HALF_UP);
    },

  });
  return CartView;
});
