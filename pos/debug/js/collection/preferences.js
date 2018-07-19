/**
 * Connected Business | 05-21-2012
 */
define([
	'collection/base',
	'model/preference'
],function(BaseCollection, PreferenceModel){
	var PreferenceCollection = BaseCollection.extend({
		model : PreferenceModel,
	
	});
	return PreferenceCollection;
});
