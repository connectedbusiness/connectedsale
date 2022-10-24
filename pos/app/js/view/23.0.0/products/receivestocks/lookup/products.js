/**
 * @author Connected Business
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'view/23.0.0/products/receivestocks/lookup/product',
	'text!template/23.0.0/products/receivestocks/lookup/products.tpl.html',
	'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, ProductView, template){
	var ProductsView = Backbone.View.extend({
		
		initialize : function(){ 			
			//this.collection.bind('reset', this.render, this);
			this.$el.html( _.template( template ) );				
		},

		render : function(){
			$("#lookup-content").trigger("create");	
			var _sort = this.collection.sortVar;
			this.GroupCollection(_sort);
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
			switch (sortVar){
				case "ItemName":
					this.GroupByItemName();
					break;
				case "CategoryCode":
					this.GroupByCategoryCode();
					break;
			}
		},
		
		GroupByItemName : function(){
			var collection = this.collection;
	
			collection.each(function(model){
				
				if(model.get("ItemType") === "Service" || model.get("ItemType") === "Non-Stock"){
					model.destroy();
				}
				
			});
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
				})
			}
			
		},
		
		GroupByCategoryCode : function(){
			var collection = this.collection;
			
			var _collection = collection.pluck('CategoryCode');
			
			var _result = _.groupBy(_collection, function(category){
					if(category === null){
						
						return category = "No Category";
						
					}else{
						
						return category;
						
					}
			});
			for(var category in _result){
				
				$("#productListContainer").append("<li data-role='list-divider'>"+category+"</li>");
				
				collection.each(function(model){
					
					var _category = model.get("CategoryCode");
					
					if(_category === category){
						
						this.productView = new ProductView({model: model});
						$("#productListContainer").append(this.productView.render().el);
						
					}else if(category === "No Category" && _category === null){
						
						this.productView = new ProductView({model: model});
						$("#productListContainer").append(this.productView.render().el);
						
					}
				})
			}
		},

	});
	return ProductsView; 
})
