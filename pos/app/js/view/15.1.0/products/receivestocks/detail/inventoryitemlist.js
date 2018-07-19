
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/service',
	'shared/method',
	'shared/shared',
	'model/base',
	'collection/base',
	'text!template/15.1.0/products/receivestocks/detail/inventoryitemlist.tpl.html',
	'text!template/15.1.0/products/receivestocks/detail/inventoryitem.tpl.html',		
	'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Service, Method,Shared, BaseModel, StockCollection, template, itemTemplate){
	
	var _proceed = false,_categoryForm;

	var StockGeneralView = Backbone.View.extend({
		_template : _.template( template ),
		_itemTemplate : _.template(itemTemplate),

		initialize : function(){
		    this.render();
		    this.InitilizeInventoryItems();
		},
		
		render : function() {
			this.$el.html( this._template());
		},

		DisplayInventoryItems: function (response) {
		    var self = this;
		    if (!this.itemCollection) this.itemCollection = new StockCollection();
		    this.itemCollection.reset(response.InventoryAdjustments);

		    $("#inventoryItemsContent > tbody").html('');

		    if (this.itemCollection.length > 0) {

		        this.itemCollection.each(function (model) {
		            var _itemName = Shared.Escapedhtml(model.get("ItemName"));

		            model.set({ ItemName: _itemName });

		            $("#inventoryItemsContent > tbody").hide();
		            $("#inventoryItemsContent > tbody").append("<tr>" + self._itemTemplate(model.toJSON()) + "</tr>");
		            if (self.adjustmentType == "Out") { $(".inventoryItem-cost").hide(); }

		            $("#inventoryItemsContent > tbody").show();
		        });

		        this.RefreshItemsTable();
		    }
		},

		InitializeChildViews  : function(){
			this.InitilizeInventoryItems();
		},

		InitilizeInventoryItems : function(){
			var stockModel = new BaseModel();
			var self = this;
			var adjustmentCode = this.model.get("AdjustmentCode");
			if(adjustmentCode.indexOf("ADJOUT") == 0){
				this.adjustmentType = "Out";
			}else{
				this.adjustmentType = "In";
			}

			stockModel.url = Global.ServiceUrl + Service.PRODUCT + Method.GETRECEIVESTOCKDETAILS + adjustmentCode;
			stockModel.save(null,{
				success : function(model,response){
					if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
					self.DisplayInventoryItems(response);
				}
			});
			
		},

		LoadScroll: function () {
		    var self = this;

		    if(Shared.IsNullOrWhiteSpace(this.myScroll)){
		        this.myScroll = new iScroll('inventoryItemsTableContent',{vScrollbar:true, vScroll:true, snap:false, momentum:true});
		    }else{
		        this.myScroll.refresh();
		    }
			
		    setTimeout(function () {
		        self.myScroll.refresh();
		    }, 1000);
		},

		RefreshItemsTable : function(){
			$("#inventoryItemsTableHeader .inventoryItem-itemName").width($("#inventoryItemsTableContent .inventoryItem-itemName").width());
            $("#inventoryItemsTableHeader .inventoryItem-warehouseCode").width($("#inventoryItemsTableContent  .inventoryItem-warehouseCode").width());
            $("#inventoryItemsTableHeader .inventoryItem-unitMeasureCode").width($("#inventoryItemsTableContent  .inventoryItem-unitMeasureCode").width());
            $("#inventoryItemsTableHeader .inventoryItem-unitMeasureQuantity").width($("#inventoryItemsTableContent  .inventoryItem-unitMeasureQuantity").width());
            $("#inventoryItemsTableHeader .inventoryItem-originalQuantity").width($("#inventoryItemsTableContent  .inventoryItem-originalQuantity").width());   
            $("#inventoryItemsTableHeader .inventoryItem-quantity").width($("#inventoryItemsTableContent  .inventoryItem-quantity").width());
            $("#inventoryItemsTableHeader .inventoryItem-quantityAfter").width($("#inventoryItemsTableContent  .inventoryItem-quantityAfter").width());
            
            if(this.adjustmentType =="In"){
				 $("#inventoryItemsTableHeader .inventoryItem-cost").width($("#inventoryItemsTableContent  .inventoryItem-cost").width()); 
			}

            if(Global.isBrowserMode) Shared.UseBrowserScroll('#inventoryItemsTableContent')
            else this.LoadScroll();
		}
	});
	return StockGeneralView;
});
