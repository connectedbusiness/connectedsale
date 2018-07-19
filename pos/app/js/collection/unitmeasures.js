/**
 * @author alexis.banaag
 */
define([
	'collection/base',
	'model/unitmeasure'
], function(BaseCollection, UnitMeasureModel){
	var UnitMeasureCollection = BaseCollection.extend({
		model : UnitMeasureModel,
		parse : function(response){
			return response.UnitMeasures;
		}
		});
	return UnitMeasureCollection;
});
