/**
 * @author Connected Business
 */
define([
	'model/base'
],function(BaseModel){
	var StockModel = BaseModel.extend({
		search : function(){
			this.trigger('searchItem',this);
		}
	});
	return StockModel;
});
