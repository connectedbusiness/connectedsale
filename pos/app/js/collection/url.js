/**
 * @author Connected Business
 */
define([
	'collection/base',
	'localstorage',
	'model/url'
], function(BaseCollection, Store, UrlModel){
	var UrlCollection = BaseCollection.extend({
		model : UrlModel,
		localStorage : new Store('Url')
	});
	return UrlCollection;
});
