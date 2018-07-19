/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/customer'
], function(BaseCollection, CustomerModel){
	var CustomerCollection = BaseCollection.extend({
		model : CustomerModel,
		parse : function(response){
			return response.Customers;
		},
		comparator : function(model){
			return model.get('CustomerName').toLowerCase();
		}
	});
	return CustomerCollection;
});
