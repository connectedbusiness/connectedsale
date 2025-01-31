
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'text!template/19.1.0/products/departments/detail/sortorder/sortorderlist.tpl.html',
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
