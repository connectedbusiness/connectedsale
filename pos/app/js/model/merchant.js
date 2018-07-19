/**
 * @author Connected Business
 */
define([
	'model/base'
], function(BaseModel){
	var MerchantModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		}
	});
	return MerchantModel;
});
