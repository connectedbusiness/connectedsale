/**
 * @author Connected Business
 */
define([
	'collection/base',	
	'model/invoicedetail'
],function(BaseCollection, InvoiceDetailModel){
	var InvoiceDetailCollection = BaseCollection.extend({
		model : InvoiceDetailModel,
	    initialize: function(){
			
      	}
	});
	return InvoiceDetailCollection;
});