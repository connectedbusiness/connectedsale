/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/stock'
], function(BaseCollection,StockModel){
	var StockCollection = BaseCollection.extend({
		model : StockModel,
		parse : function(response){
			return response.StockTotalDetails;
		},
	});
	return StockCollection;
});
