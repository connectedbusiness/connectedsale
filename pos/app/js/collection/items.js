/**
 * Connected Business | 05-2-2012
 */
define([
	'collection/base',
	'model/item'
],function(BaseCollection, ItemModel){
	var ItemCollection = BaseCollection.extend({
		model : ItemModel,
		
		parse : function( response ){
			return response.Items
		}
	});
	return ItemCollection;
});
