
define([
	'jquery',
	'mobile',
	'underscore',	
	'backbone',	
	'text!template/26.0.0/products/lookup/lookup.tpl.html'
], function($, $$, _, Backbone, template){
	
	var _proceed = false,_categoryForm;

	var ProductsLookupModeView = Backbone.View.extend({
		_template : _.template( template ),
	
		initialize : function(){
			this.render();
		},
		
		render : function() {
			this.$el.html(this._template());
		},
		
		InitializeChildViews  : function(){
			
		},
	});
	return ProductsLookupModeView;
})
