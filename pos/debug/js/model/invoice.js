/**
 * @author Connected Business
 */
define([
	'shared/shared',
  	'model/base'  
], function(Shared, BaseModel) {
  var InvoiceModel = BaseModel.extend({
  	initialize: function(){
  		this.set({
  			DateModified: Shared.GetJsonUTCDate(),
  			LastRetrievalDate: Shared.GetJsonUTCDate()
  		});
    }
  });
  return InvoiceModel;
});