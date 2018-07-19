/**
 * @author Connected Business
 */
define([
	'model/base'
], function(BaseModel){
	var PrinterModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		},
	});
	return PrinterModel;
});
