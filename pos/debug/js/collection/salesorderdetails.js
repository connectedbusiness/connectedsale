/**
 * Connected Business | 05-17-2012
 */
define([
	'collection/base',
	'model/salesorderdetail'
],function(BaseCollection, SalesOrderDetailModel){
	var SalesOrderDetailCollection = BaseCollection.extend({
		model : SalesOrderDetailModel,
	  initialize: function(){
    }
	});
	return SalesOrderDetailCollection;
});
