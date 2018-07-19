/**
 * @author Connected Business
 */
define([
	'model/base'
], function(BaseModel){
	var SalesRepModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		},
		viewDetail : function(){
			this.trigger('viewDetail',this);
		}
	});
	return SalesRepModel;
});
