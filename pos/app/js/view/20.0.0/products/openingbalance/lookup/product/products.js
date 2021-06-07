/**
 * @author Connected Business
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'view/20.0.0/products/openingbalance/lookup/product/product',
	'text!template/20.0.0/products/openingbalance/lookup/product/products.tpl.html',
	'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, ProductView, template){
	var ProductsView = Backbone.View.extend({
		
		initialize : function(){
			this.$el.html( _.template( template ) );							
		},
		
		RefreshList : function(collection){
			this.collection = collection;
			this.render();
		},
		
		
		render : function(){
			//var _sort = this.collection.sortVar;
			$("#lookup-content").trigger("create");
			$("#productListContainer").html("");					
			this.GroupCollection();						
			$("#productListContainer").listview("refresh");		
			if(Global.isBrowserMode) return;
			if (this.myScroll) {
				this.myScroll.refresh()
			}
			else {
				this.myScroll = new iScroll('lookup-content',{hScroll:false});	
			}		
		},
		
		GroupCollection : function(sortVar){
			this.GroupByItemName();
		},
		
		GroupByItemName : function(){
			var collection = this.collection;
			var _collection = collection.pluck('ItemName');
			var _result = _.groupBy(_collection, function(item){				
				return item.charAt(0).toUpperCase();				
			});
			
			for(var item in _result){
				$("#productListContainer").append("<li data-role='list-divider'>"+item+"</li>");
				
				collection.each(function(model){					
					var _item = model.get("ItemName");
					if(_item.charAt(0).toUpperCase() === item.toUpperCase()){						
						this.productView = new ProductView({model: model});
						$("#productListContainer").append(this.productView.render().el);						
					}
				});
			}
			
		},
		
	});
	return ProductsView; 
})