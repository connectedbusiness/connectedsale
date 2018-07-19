/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/website'
], function(BaseCollection, WebsiteModel){
	var WebsiteCollection = BaseCollection.extend({
		model : WebsiteModel,
		parse : function(response){
			return response.EcommerceSites;
		},
		/*
		comparator : function(model){
			return model.get('ReportName');
		},
		*/
	});
	return WebsiteCollection;
});
