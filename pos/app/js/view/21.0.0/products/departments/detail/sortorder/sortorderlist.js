
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'text!template/21.0.0/products/departments/detail/sortorder/sortorderlist.tpl.html',
], function($, $$, _, Backbone, template){
	
	var DepartmentSortOrderListView = Backbone.View.extend({
		_template : _.template( template ),

		initialize : function(){
			this.render()
		},
		
		render : function() {
			this.$el.append( this._template(this.model.toJSON()));
		},
		
	});
	return DepartmentSortOrderListView;
})
