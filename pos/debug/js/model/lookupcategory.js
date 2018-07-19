/**
 * @author Connected Business
 */
define([
	'model/base'
], function(BaseModel){
	var LookupCategoryModel = BaseModel.extend({
		select: function() {
			this.trigger("selected", this);      		
		},	 
	});
	return LookupCategoryModel;
});
