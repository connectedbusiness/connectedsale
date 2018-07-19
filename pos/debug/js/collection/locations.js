/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/location'
], function(BaseCollection, LocationModel){
	var LocationCollection = BaseCollection.extend({
		model : LocationModel
	});
	return LocationCollection;
});
