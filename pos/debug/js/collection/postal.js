/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/postal'
],function(BaseCollection, PostalModel){
	var PostalCollection = BaseCollection.extend({
		model : PostalModel,
		parse : function( response ){
			return response.Postals;
		},
	});
	return PostalCollection;
});
