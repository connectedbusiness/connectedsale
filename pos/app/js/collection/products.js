/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/product'
], function(BaseCollection, ProductModel){
	var ProductCollection = BaseCollection.extend({
		initialize : function(){
			this.sortVar = ''
		},
		model : ProductModel,
		parse : function(response){
			return response.Items;
		},
		comparator : function(model){
			return (model.get(this.sortVar)) ;
		}
	});
	return ProductCollection;
});
