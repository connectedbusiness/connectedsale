/**
 * @author Connected Business
 */
define([
	'model/base'
], function(BaseModel){
	var UrlModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		},
		removeUrl : function(){
			this.trigger('removeUrl', this);
		},
		editUrl : function(){
			this.trigger('editUrl', this);
		}
	});
	return UrlModel;
})
