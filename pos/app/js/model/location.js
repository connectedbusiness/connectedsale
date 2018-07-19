/**
 * @author Connected Business
 */
define([
	'model/base'
], function(BaseModel){
	var LocationModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		}
	});
	return LocationModel;
});
