/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/substitute'
], function(BaseCollection, SubstituteModel){
	var SubstituteCollection = BaseCollection.extend({
		model : SubstituteModel,
		parse : function(response){
			return response.Items;
		}
	});
	return SubstituteCollection;
});
