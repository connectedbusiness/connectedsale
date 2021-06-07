/**
 * @author Connected Business
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/shared',
	'text!template/20.0.0/products/openingbalance/lookup/product/product.tpl.html',
], function($, $$, _, Backbone, Global, Shared, template){
	var ProductView = Backbone.View.extend({
		_template: _.template(template),
		tagName : 'li',
		events : {
			"tap" : "Add",
			"tap #add-lookup" : "Selected"
		},

		render : function(){
			this.CheckDefaultPrice(this.model);
			this.SetDescription(this.model);
			this.model.set({ CurrencySymbol : Global.CurrencySymbol, })
			this.$el.html(this._template(this.model.toJSON()));			
			return this;
		},
		
		SetDescription : function(model)
		{
			//var limit = 38;
			var limit = 50;

		   	var _itemName = Shared.Escapedhtml(model.get("ItemName"));
		   	var _itemDescription = Shared.Escapedhtml( model.get("ItemDescription") );
    		var _itemDescriptionlineBreak = "<br>";
    		
    		if (_itemDescription.length > limit) {
    			var _itemDescription1 = _itemDescription.substr(0,(limit-1));
    			var _itemDescription2 = _itemDescription.substr((limit-1),_itemDescription.length-1);
    			if (_itemDescription2.length > limit) {
    				_itemDescription2 = _itemDescription.substr((limit-1), (limit-1)) + "...";
    			}
    			_itemDescription = _itemDescription1 + _itemDescriptionlineBreak + _itemDescription2;
    			_itemDescriptionlineBreak = "";    			
    		}
    		//model.set({ItemDescription:_itemDescription},{silent:true});
    		this.model.set({ ItemDescription:_itemDescription, 
    						 ItemName : _itemName }, {silent:true} );
		},
		
		
		
		CheckDefaultPrice : function(model){			
			var _retailPrice = model.get("RetailPrice");
			model.set({ Price : _retailPrice.toFixed(2)}, {silent:true});			
		},
		
		Selected : function(e){
			e.stopPropagation();
			this.model.select();
		},
		
		Add : function(e){
			e.preventDefault();
			this.model.select();
		}
	});
	return ProductView;
});
