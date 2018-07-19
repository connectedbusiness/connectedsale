define([
	'collection/base',
	'model/department'
],function(BaseCollection, DepartmentModel){
	var DepartmentCollection = BaseCollection.extend({
		model : DepartmentModel,
	
	});
	return DepartmentCollection;
});
