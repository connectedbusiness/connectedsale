/**
 * Connected Business | 08-6-2012 
 */
define([
	'collection/base',
	'localstorage',
	'model/drawerbalance'
], function(BaseCollection, Store, DrawerBalanceModel){
	var DrawerBalanceCollection = BaseCollection.extend({
		model : DrawerBalanceModel,
		localStorage : new Store('DrawerBalance')
	});
	return DrawerBalanceCollection;
});
