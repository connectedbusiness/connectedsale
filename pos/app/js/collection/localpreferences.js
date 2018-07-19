/**
 * @author Connected Business
 */
define([
	'collection/base',
	'localstorage',
	'model/localpreference'
], function(BaseCollection, Store, LocalPreferenceModel){
	var LocalPreferenceCollection = BaseCollection.extend({
		model : LocalPreferenceModel,
		localStorage : new Store('Preference')
	});
	return LocalPreferenceCollection;
});
