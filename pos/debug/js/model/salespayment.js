/**
 * @author Connected Business
 */
define([
  'model/base'
], function(BaseModel) {
  var SalesPaymentModel = BaseModel.extend({  	
  	
  	model: function(model) {
  		this.model = model;
  	},
  	
  	toJSON: function() {
    	return this.model.toJSON(); // where model is the collection of payments
 	}
  
  });
  return SalesPaymentModel;
});