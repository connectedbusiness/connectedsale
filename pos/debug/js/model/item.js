/**
 * @author Connected Business
 */
define([
	'model/base'
], function(BaseModel){
	var ItemModel = BaseModel.extend({
		
		select: function() {
			this.trigger("selected", this);      		
		},
	});
	return ItemModel;
});
