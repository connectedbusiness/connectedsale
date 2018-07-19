/**
 * @author Connected Business
 */
define([
	'model/base'
],function(BaseModel){
	var ContactModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		},
		
		add : function(){
			this.trigger('addItem', this);
		}
	});
	return ContactModel;
});
