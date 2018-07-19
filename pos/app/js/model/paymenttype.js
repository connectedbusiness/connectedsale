/**
 * @author Connected Business
 */
define([
	'model/base'
], function(BaseModel){
	var PaymentTypeModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		}
	});
	return PaymentTypeModel;
});
