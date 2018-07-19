/**
 * Connected Business | 05-21-2012
 */
define([
	'model/base'
], function(BaseModel){
	var PreferenceModel = BaseModel.extend({
		select : function(){
			this.trigger('selected', this);
		},
	});
	return PreferenceModel;
});