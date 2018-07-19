/**
 * @author alexis.banaag
 */
define([
	'collection/base',
	'model/serialnumber'
], function(BaseCollection, SerialNumberModel){
	var SerialNumberCollection = BaseCollection.extend({
		model : SerialNumberModel
	});
	return SerialNumberCollection;
});
