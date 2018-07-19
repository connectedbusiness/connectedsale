/**
 * Connected Business | 07-09-2012
 */
define([
	'model/base'
], function(BaseModel){
	var UserAccountModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		},
		add : function(){
			this.trigger('addItem', this);
		}
	});
	return UserAccountModel;
});