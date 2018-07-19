/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/reason'
], function(BaseCollection, ReasonModel){
	var ReasonCollection = BaseCollection.extend({
		model : ReasonModel,
		parse : function(response){
			return response.Reasons;
		}
	});
	return ReasonCollection;
})
