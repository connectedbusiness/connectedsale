/**
 * Connected Business | 05-21-2012
 */
define([
	'collection/base',
	'model/transaction'
],function(BaseCollection, TransactionModel){
	var TransactionCollection = BaseCollection.extend({
		model : TransactionModel,
	
	});
	return TransactionCollection;
});
