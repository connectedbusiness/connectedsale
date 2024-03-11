/**
 * @author Connected Business
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'view/24.0.0/pos/item/search/stock/stock'
], function($, $$, _, Backbone, StockItemView){
	var FreeStockView = Backbone.View.extend({
		initialize : function(){
			$("#list-detail-content").empty();
			//this.collection.on('reset', this.render, this);
			this.render();
		},
		
		render : function(){
			console.log(this.collection);
			this.collection.each(function(model){
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
				this.stockitem = new StockItemView({
					model : model
				});
			});

            if (this.myScroll) this.myScroll.refresh();
            else this.myScroll = new iScroll("detail-content", { vScrollbar: true, vScroll: true });  

		}
	});
	return FreeStockView;
});
