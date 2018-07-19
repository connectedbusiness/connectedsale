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
	'shared/service',
	'shared/method',
	'model/lookupcriteria',
	'model/item',
	'model/lookupcriteria',
	'collection/products',
	'view/15.1.0/products/openingbalance/lookup/product/products',
	'text!template/15.1.0/products/openingbalance/lookup/lookup.tpl.html'
], function($, $$, _, Backbone, Global, Shared, Service, Method, 
	ItemModel, LookupCriteriaModel, LookUpCriteriaModel,
	ProductCollection, LookupListView,
	template){
		 
		
	var LookupView = Backbone.View.extend({
		_template : _.template( template ),
		
		events : {
			"tap #done-lookup" : "LookupDone",
			// "keyup #lookup-search" : "ItemLookup",
			"keypress #products-lookup-search": "ItemLookup",
		},
		
		initialize : function() {		
		},
		
		//txtSearch_Focus: function () { $("#lookup-searchClearBtn").fadeIn(); },
        //txtSearch_Blur: function () { $("#lookup-searchClearBtn").fadeOut(); },
		
		render : function() {		
			this.$el.html(this._template());
			this.$el.show();	
            return this;	
		},
		
		Show : function() {					
			this.render();
        	this.hideOtherButtons();     	    
		},
		
		Close : function() {		
			
		},
		
		ItemLookup : function (e) {
			
			if(e.keyCode === 13){
			    var sample = $("#products-lookup-search").val();
				this.GetLookupItems( sample.trim() );
    		}
		},
		
		RefreshItemList : function () {
			this.GetLookupItems();	 		
		},
		
		GetLookupItems : function(criteria){ 
			Shared.Products.DisplayWait("#lookup-content");
			var _self = this; 
			var _itemLookup = new LookUpCriteriaModel();
	    	_itemLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.GETITEMLISTBYITEMTYPE;
	    	
	    	_itemLookup.on('sync', this.ItemRetrievalSuccess, this);
            _itemLookup.on('error', this.ItemRetrievalFailed, this);
	    	
	    	
	    	var _itemTypes = new ProductCollection();
	    	
	    	
	    	_itemLookup.set({
	    		Criteria  : criteria,	    
				ItemTypes :	"'Stock', 'Matrix Item', 'Assembly'" 
	    	});	    	
	    	
	    	_itemLookup.save();
		},
		
		ItemRetrievalSuccess : function (model, response) {  if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
			if(!tmpCollection) var tmpCollection = new ProductCollection();
			tmpCollection.reset(response.Items); 			
        	this.productCollection.reset(response.Items);	        	
			this.RenderProductsView();  	
		},	
		
		ItemRetrievalFailed : function (model, error, response) { if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();			
            //navigator.notification.alert("An error was encounter when trying to Items!", null, "Fetching Error", "OK");
            Shared.Products.RequestTimeOut();
        },	
		       
        RenderProductsView : function () {   
        	var lookupListView = new LookupListView({
					el:$("#lookup-content"),
					collection: this.productCollection
				});
        	lookupListView.RefreshList(this.productCollection);
        	/*if(!this.lookupListView) {
        		this.lookupListView = new LookupListView({
					el:$("#lookup-content"),
					collection: this.productCollection
				});
	            this.lookupListView.on("selected", this.CheckIfItemCodeExist, this); 
        	} 
    		this.lookupListView.RefreshList(this.productCollection);*/
		},   
		
		LookupDone : function(e){
			e.preventDefault();			
			$("#products-lookup-search").val('');
			$("#products-lookup-search").blur();
			this.trigger('done');
			sortVar = "ItemName";
		},
        
        hideOtherButtons : function(){
			$("#back-products").hide();
			$("#add-lookup").hide();
			$("#back-details").hide();
		},
	    
	});
	return LookupView;
});
