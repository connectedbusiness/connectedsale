/**
 * @author Connected Business
 */
define([
	'model/base'
],function(BaseModel){
	var SignatureModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		}
	});
return SignatureModel;
});
