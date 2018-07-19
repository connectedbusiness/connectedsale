/**
 * @author Connected Business
 */
define([
	'model/base'
], function(BaseModel){
	var ShippingMethodModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		}
	});
	return ShippingMethodModel;
});
