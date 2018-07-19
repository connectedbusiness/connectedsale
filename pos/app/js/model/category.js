/**
 * @author Connected Business
 */
define([
	'model/base'
],function(BaseModel){
	var CategoryModel = BaseModel.extend({
		
		select: function() {
			this.trigger("selected", this);      		
		},	 
		setDefault : function(){
			this.trigger("setDefault", this);
		},
		removeItem : function(){
			this.trigger("categoryRemoved", this);
		}
	});
	return CategoryModel;
});
