/**
 * @author alexis.banaag
 */
define([
	'model/base'
], function(BaseModel){
	var LotNumberModel = BaseModel.extend({
		removeItem : function(){
			this.trigger('removeLot', this);
		}
	});
	return LotNumberModel;
});
