/**
 * @author
 */
define([
	'collection/base',
	'model/reportsetting'
],function(BaseCollection, ReportSettingModel){
	var ReportSettingCollection = BaseCollection.extend({
		model : ReportSettingModel,
	
	});
	return ReportSettingCollection;
});
