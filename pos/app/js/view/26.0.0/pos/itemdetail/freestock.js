/**
 * Connected Business | 05-15-2012
 * Required: collection 
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'text!template/26.0.0/pos/itemdetail/freestock.tpl.html'
],function($, $$, _, Backbone, template){
			
 	var FreeStockView = Backbone.View.extend({
 		_template : _.template(template),
 		tagName: "ul",
 		className : "freestock-container",
 		attributes : {
 			"data-role": "listview",
 			"data-inset": "true"
 		},
 		
 		render : function(_collection) {
 			var self = this;
 			self.$el.html("");
			_collection.each(function(model){
				if(model.get("IsActive")) {
					var _unitMeasureQty  = model.get("UnitMeasureQty");
					var _freeStock  = model.get("FreeStock");
					_freeStock  = _freeStock / _unitMeasureQty;
					var splitVal  = _freeStock.toString().split(".");
						if(splitVal[1] > 0){
							_freeStock = _freeStock.toFixed(2);
						}else{
							_freeStock = parseFloat(_freeStock);
						}
					
					model.set({
						FreeStock : _freeStock
					})
					self.$el.append(self._template(model.toJSON()));
				}
			});	
			return this;
		},

		UnbindView : function() {
			this.unbind();
		}
		
	});
	return FreeStockView;
});
