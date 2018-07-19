/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/country'
],function(BaseCollection, CountryModel){
	var CountryCollection = BaseCollection.extend({
		model : CountryModel,
		parse : function( response ){
			return response.Countries;
		},
	});	
	
	return CountryCollection;
});
