/**
 * @author alexis.banaag
 */
define([
	'collection/base',
	'model/lotnumber'
], function(BaseCollection, LotNumberModel){
	var LotNumberCollection = BaseCollection.extend({
		model : LotNumberModel
	});
	return LotNumberCollection;
});
