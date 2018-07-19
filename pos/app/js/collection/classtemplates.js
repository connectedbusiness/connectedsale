/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/lookupcriteria'
],function(BaseCollection, LookupCriteriaModel){
	var ClassTemplates = BaseCollection.extend({
		model : LookupCriteriaModel,
		parse : function( response ){
			return response.ClassTemplates;
		},
	});	
	
	return ClassTemplates;
});
