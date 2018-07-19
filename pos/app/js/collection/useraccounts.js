/**
 * Connected Business | 07-09-2012
 */
define([
	'collection/base',
	'model/useraccount'
],function(BaseCollection, UserAccountModel){
	var UserAccountCollection = BaseCollection.extend({
		model : UserAccountModel,
	
	});
	return UserAccountCollection;
});
