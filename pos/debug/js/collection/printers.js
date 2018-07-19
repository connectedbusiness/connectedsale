/**
 * @author Connected Business
 */
define([
	'collection/base',
	'localstorage',
	'model/printer'
], function(BaseCollection, Store, PrinterModel){
	var PrinterCollection = BaseCollection.extend({
		model : PrinterModel,
		localStorage : new Store('Printer')
	});
	return PrinterCollection;
});
