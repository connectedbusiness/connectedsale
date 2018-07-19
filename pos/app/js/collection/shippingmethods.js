/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/shippingmethod'
], function(BaseCollection, ShippingMethodModel){
	var ShippingMethodCollection = BaseCollection.extend({
		model : ShippingMethodModel
	});
	return ShippingMethodCollection;
});
