/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/salesrep'
], function(BaseCollection, SalesRepModel){
	var SalesRepCollection = BaseCollection.extend({
		model : SalesRepModel,
		parse : function(response){
			return response.SalesReps;
		}
	});
	return SalesRepCollection;
});
