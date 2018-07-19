/**
 * @author Connected Business
 */
define([
  'model/base'
], function(BaseModel) {
  var TransactionModel = BaseModel.extend({  	
  	initialize: function(){

    },
    toJSON : function() {
	  return _.clone({input: this.attributes});
	},
	parse: function(response){
		return response;
	}
  });
  return TransactionModel;
});