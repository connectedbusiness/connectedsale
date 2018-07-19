/**
 * @author Connected Business
 */
define([
	'collection/base',
	'model/workstation'
], function(BaseCollection, WorkstationModel){
	var WorkstationCollection = BaseCollection.extend({
		model: WorkstationModel,
		parse : function(response) {
			return response.Preferences;
		},
		
		comparator : function(model){
			return model.get('WorkstationID').toLowerCase();
		}
	});
	return WorkstationCollection;
});
