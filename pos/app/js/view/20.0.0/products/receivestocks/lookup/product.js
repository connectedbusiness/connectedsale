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
	'text!template/20.0.0/products/receivestocks/lookup/product.tpl.html',
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
			this.RoundOffUnitsInStock(this.model);
			this.SetDescription(this.model);
			this.model.set({ CurrencySymbol : Global.CurrencySymbol, })
			this.$el.html(this._template(this.model.toJSON()));
			
			return this;
		},
		
		SetDescription : function(model)
		{
			var limit = 38;

		   	var _itemDescription = model.get("ItemDescription");
		   	var _itemName = model.get("ItemName");
    		var _itemDescriptionlineBreak = "<br>";
    		
    		if (_itemDescription.length > limit) {
    			var _itemDescription1 = _itemDescription.substr(0,(limit-1));
    			var _itemDescription2 = _itemDescription.substr((limit-1),_itemDescription.length-1);
    			if (_itemDescription2.length > limit) {
    				_itemDescription2 = _itemDescription.substr((limit-1), (limit-1)) + "...";
    			}
    			_itemDescription = Shared.Escapedhtml(_itemDescription1) + _itemDescriptionlineBreak + Shared.Escapedhtml(_itemDescription2);
    			_itemDescriptionlineBreak = "";    			
    		}
    		else {
    			_itemDescription = Shared.Escapedhtml(_itemDescription);
    		}
    		
    		//var ItemNameDisplay
    		_itemName = Shared.Escapedhtml(_itemName);
    		
    		model.set({
    				ItemDescriptionDisplay:_itemDescription,
    				ItemNameDisplay: _itemName
    			},{silent:true});
		},
		
		RoundOffUnitsInStock : function(model){//jj
			var _unitsInStock = model.get("UnitsInStock");
			//_unitsInStock = Math.round(_unitsInStock);
			var splitVal  = _unitsInStock.toString().split(".");
			if(splitVal[1] > 0){
				_unitsInStock = _unitsInStock.toFixed(2);
			}else{
				_unitsInStock = parseFloat(_unitsInStock);
			}
			model.set({UnitsInStock : _unitsInStock},{silent:true});
		},
		
		CheckDefaultPrice : function(model){
			var _retailPrice = model.get("RetailPrice");
			var _wholePrice = model.get("WholesalePrice");
			switch(Global.DefaultPrice){
				case "Retail" :
					model.set({Price : _retailPrice.toFixed(2)}, {silent:true});
					break;
				case "Wholesale" :
					model.set({Price : _wholePrice.toFixed(2)}, {silent:true});
					break;
			}
			if(!Global.DefaultPrice){
				model.set({Price : _retailPrice.toFixed(2)}, {silent:true});
			}
		},
		
		Selected : function(e){
			e.stopPropagation();
			this.model.select();
		},
		
		Add : function(e){
			e.preventDefault();
			this.model.add();
		}
	});
	return ProductView;
});
