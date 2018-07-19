/**
 * Connected Business | 05-1-2012
 */
define([
  'collection/base',
  'model/cartItem'
], function(BaseCollection, CartItemModel) {
  var Cart = BaseCollection.extend({
  	model : CartItemModel,
  	initialize: function(){
   	},

	  total: function() {
		  return this.reduce(function (memo, value) { return memo + value.get("ExtPriceRate") }, 0);
	  },
    totalTax: function () {
      return this.reduce(function (memo, value) { return memo + value.get("SalesTaxAmountRate") }, 0);
    },
    totalDiscount: function () {
      return this.reduce(function (memo, value) { return memo + value.get("Discount")}, 0);
    }
  });
  return Cart;
});
