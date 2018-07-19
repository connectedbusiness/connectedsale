/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/paymenttype'
], function(BaseCollection, PaymentTypeModel){
	var PaymentTypeCollection = BaseCollection.extend({
		model : PaymentTypeModel
	});
	return PaymentTypeCollection;
});
