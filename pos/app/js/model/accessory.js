/**
 * @author Connected Business
 */
define([
	'model/base'
],function(BaseModel){
	var AccessoryModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		},
		
		onHand : function(){
			this.trigger('showOnHand', this);
		},
		
		itemAdd : function(){
			this.trigger('itemAdded', this);
		}
	});
	return AccessoryModel;
});
