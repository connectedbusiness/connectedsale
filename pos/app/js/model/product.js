/**
 * @author Connected Business
 */
define([
	'model/base'
],function(BaseModel){
	var ProductModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		},
		add : function(){
			this.trigger('addItem', this);
		},
		remove : function(){
			this.trigger('removeItem',this);
		}
	});
	return ProductModel;
});
