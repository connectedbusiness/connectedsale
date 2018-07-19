/**
 * @author Connected Business
 */
define([
	'collection/base'
], function(BaseCollection){
	var SalesRepGroupCollection = BaseCollection.extend({
		parse : function(response){
			return response.SalesRepGroup;
		}
	});
	return SalesRepGroupCollection;
});