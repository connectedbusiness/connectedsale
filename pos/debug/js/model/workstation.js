/**
 * @author Connected Business
 */
define([
	'model/base'
], function(BaseModel){
	var WorkstationModel = BaseModel.extend({
		select : function() {
			this.trigger("selected", this);
		}
	});
	return WorkstationModel;
});
