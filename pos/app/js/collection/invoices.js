/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/invoice'
],function(BaseCollection, InvoiceModel){
	var InvoiceCollection = BaseCollection.extend({
		model : InvoiceModel,
	  initialize: function(){
    }
	});
	return InvoiceCollection;
});
