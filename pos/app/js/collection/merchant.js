/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/merchant'
], function(BaseCollection, MerchantModel){
	var MerchantCollection = BaseCollection.extend({
		model : MerchantModel
	});
	return MerchantCollection;
});
