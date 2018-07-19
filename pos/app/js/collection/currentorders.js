
define([
	'collection/base',
	'model/currentorder'
],function(BaseCollection, CurrentOrderModel){
	var CurrentOrderCollection = BaseCollection.extend({
		model : CurrentOrderModel,
	
	});
	return CurrentOrderCollection;
});
