/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/shipto'
], function(BaseCollection, ShipToModel){
	var ShipToCollection = BaseCollection.extend({
		model: ShipToModel,
		
		comparator: function(model){
			return model.get('ShipToName');
		}
	});
	return ShipToCollection;
});
