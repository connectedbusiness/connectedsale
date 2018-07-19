/**
 * @author Connected Business
 */
define([
	'model/base'
], function(BaseModel){
	var ReasonModel = BaseModel.extend({
		select : function(){
			this.trigger("selected", this);
		},
		close : function(){
			this.trigger("closed", this);
		},
		saveTransactionReason : function(){
			this.trigger("savedTransaction", this);
		},
		saveItemReason : function(){
			this.trigger("savedItem", this);
		},
		acceptReason : function() {
			this.trigger("acceptReason", this);
		}
	});
	return ReasonModel;
});
