/**
 * Connected Business | 06-20-2012
 */
define([
	'shared/shared',
	'model/base'
], function(Shared, BaseModel){
	var CouponModel = BaseModel.extend({
		initialize : function() {
			this.set({
				ExpirationDate: Shared.GetJsonUTCDate(),
				StartingDate: Shared.GetJsonUTCDate()
			});
		},
		
		select: function() {
			this.trigger("selected", this);      		
		}
	});	

	return CouponModel;
});
