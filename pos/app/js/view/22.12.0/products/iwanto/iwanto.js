
define([
	'jquery',
	'mobile',
	'underscore',	
	'backbone',	
	'text!template/22.12.0/products/iwanto/iwanto.tpl.html',
	'text!template/22.12.0/products/iwanto/iwantolist.tpl.html'
], function($, $$, _, Backbone, template,BtnTemplate){
	
	var IwantoView = Backbone.View.extend({
		_template : _.template( template ),
		_btnTemplate : _.template(BtnTemplate),
		
		initialize : function(){
			this.render()
		
		},
		
		InitializeChildViews : function(){
			this.setIwantoBtn();
		},
		
		render : function() {
			this.$el.html( this._template());
		},
		
		setIwantoBtn : function(){
			$("#iwantoContainer").append(this._btnTemplate());			
		}
		
	});
	return IwantoView;
})
