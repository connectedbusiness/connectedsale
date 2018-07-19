/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/lookupcategory'
], function(BaseCollection, LookupCategoryModel){
	var LookupCategoryCollection = BaseCollection.extend({
		model : LookupCategoryModel,
		parse : function(response){
			return response.SystemCategories;
		},
		comparator: function(model){
			return model.get('CategoryCode');
		}
	});
	return LookupCategoryCollection;
});
