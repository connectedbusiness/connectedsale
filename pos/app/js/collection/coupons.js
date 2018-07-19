/**
 * Connected Business | 06-20-2012
 */
define([
	'collection/base',
	'model/coupon'
],function(BaseCollection, CouponModel){
	var CouponCollection = BaseCollection.extend({
		model : CouponModel,
		
	});
	return CouponCollection;
});
