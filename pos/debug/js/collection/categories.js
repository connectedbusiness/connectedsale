/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/category'
],function( BaseCollection, CategoryModel){
	var CategoryCollection = BaseCollection.extend({
		model : CategoryModel,
		parse : function( response ){
			return response.Categories;
		},
		comparator: function(model){
			return -model.get('IsDefault');
		}
		
	});
	return CategoryCollection;
});
