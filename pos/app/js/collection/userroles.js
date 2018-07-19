/**
 * Connected Business | 07-09-2012
 */
define([
	'collection/base',
	'model/userrole'
],function(BaseCollection, UserRoleModel){
	var UserRoleCollection = BaseCollection.extend({
		model : UserRoleModel,
	
	});
	return UserRoleCollection;
});
