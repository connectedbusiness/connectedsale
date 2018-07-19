/**
 * Connected Business | 05-17-2012
 */
define([
	'collection/base',
	'model/salesorder'
],function(BaseCollection, SalesOrderModel){
	var SalesOrderCollection = BaseCollection.extend({
		model : SalesOrderModel,
	  initialize: function(){
    }
	});
	return SalesOrderCollection;
});
