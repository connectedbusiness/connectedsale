/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/itemprice'
],function(BaseCollection, ItemPriceModel){
	var ItemPriceCollection = BaseCollection.extend({
		model : ItemPriceModel
	});
	return ItemPriceCollection;
});
