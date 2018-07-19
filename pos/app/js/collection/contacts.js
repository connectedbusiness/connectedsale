/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/contact'
], function(BaseCollection, ContactModel){
	var ContactCollection = BaseCollection.extend({
		initialize : function(){
			this.sortVar = ''
		},
		model : ProductModel,
		parse : function(response){
			return response.Items;
		},
		comparator : function(model){
			return (model.get(this.sortVar)) ;
		}
	});
	return ContactCollection;
});
