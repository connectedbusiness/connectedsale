/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/receipt'
], function(BaseCollection, ReceiptModel){
	var ReceiptCollection = BaseCollection.extend({
		model : ReceiptModel,
		parse : function(response){
			return response.ReportViews;
		},
		/*
		comparator : function(model){
			return model.get('ReportName');
		},
		*/
	});
	return ReceiptCollection;
});
