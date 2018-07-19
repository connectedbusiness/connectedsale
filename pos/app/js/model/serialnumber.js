/**
 * @author alexis.banaag
 */
define([
	'model/base'
], function(BaseModel){
	var SerialNumberModel = BaseModel.extend({
		removeItem : function(){
			this.trigger('removeSerial', this);
		},

		includeItem : function(){
			this.trigger('includeSerial', this);
		}
	});
	return SerialNumberModel;
});
