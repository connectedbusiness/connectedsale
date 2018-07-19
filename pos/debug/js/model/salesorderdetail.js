/**
 * Connected Business | 05-17-2012
 */
define([
  'model/base'
], function(BaseModel) {
  var SalesOrderDetailModel = BaseModel.extend({
  	initialize: function(){
  		
    },
    recalculate : function() {
    	this.trigger("recalculated", this);
    }
  });
  return SalesOrderDetailModel;
});