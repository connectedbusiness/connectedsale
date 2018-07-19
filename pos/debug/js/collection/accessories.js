/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/accessory'
],function(BaseCollection, AccessoryModel){
	var AccessoryCollection = BaseCollection.extend({
		model: AccessoryModel,
		parse: function(response){
			return response.Items;
		}
	});
	return AccessoryCollection;
});
