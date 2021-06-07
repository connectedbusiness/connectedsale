
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/shared',
	'view/20.1.0/products/receivestocks/detail/add/item',
	'text!template/20.1.0/products/receivestocks/detail/add/itemlist.tpl.html',
	'text!template/20.1.0/products/receivestocks/detail/add/searchitem.tpl.html',	
	'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Shared, ItemView, template, searchTemplate){
	
	var _proceed = false, _categoryForm, itemContent_el = "#inventoryItemsContentBody";//"#inventoryItemsTableContent";

	var StockItemLisView = Backbone.View.extend({
		_template : _.template( template ),
		_searchTemplate : _.template( searchTemplate),
		events : {

		},
		
		initialize: function () {
		    this.collection.on('add', this.AddNewItem, this);
		    //this.collection.on('remove', this.DeleteItemOnCollection, this);
		    //this.collection.on('change', this.UpdateItemCollection, this);
		    this.render()
		    console.log(this.collection);
		},

		render : function() {
			this.$el.html( this._template);
		},

		AddNewItem: function (model) {
		    $("#searchNewItemName").remove();
		    $(".newContent").remove();
		    var itemView = new ItemView({
		        el: $(itemContent_el),
		        model: model
		    });

		    itemView.on("refreshTable", this.RefreshItemsTable, this);
		    itemView.on("HideInputDisplay", this.HideOtherInput, this);
		    itemView.on('searchItem', this.SearchItem, this);
		    itemView.on('RemoveItem', this.DeleteItemOnCollection, this);

		    this.RefreshItemsTable();
		    console.log(this.collection);
		},
		SearchItem: function (mview) {
		    this.trigger('searchItem', mview);
		},
		DeleteItemOnCollection: function (model) {
		    this.collection.each(function (stock) {
		        if (model.get("ModelID") == stock.get("ModelID")) {
		            stock.destroy();
		        }
		    });
		    this.trigger('RemoveItem', model);
		    this.LoadSearchContainer();
		},

		HideOtherInput: function () {
		    $("#changeQuantity").hide();
		    $("#quantityDetail").show();
		    $("#costDetail").show();
		    $("#changeCost-div").hide();
		},

		InitializeChildViews  : function(){
			this.InitilizeInventoryItems();
		},

		InitilizeInventoryItems : function(){
			this.isCleared = false;
			this.LoadSearchContainer();
		},

		LoadScroll : function(){
		    if(Shared.IsNullOrWhiteSpace(this.myScroll)){
		        this.myScroll = new iScroll('inventoryItemsTableContent', {
		            vScrollbar:true, vScroll:true, snap:false, momentum:true,
		            onBeforeScrollStart: function (e) {
		                var target = e.target;
		                while (target.nodeType != 1) target = target.parentNode;
					
		                if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
		                    e.preventDefault();
		            }
		        });
		    }else{
		        this.myScroll.refresh();
		    }
		    var self = this;
		    setTimeout(function () {

		        this.myScroll = new iScroll('inventoryItemsTableContent', {
		            vScrollbar:true, vScroll:true, snap:false, momentum:true,
		            onBeforeScrollStart: function (e) {
		                var target = e.target;
		                while (target.nodeType != 1) target = target.parentNode;
					
		                if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
		                    e.preventDefault();
		            }
		        });
		    }, 1000);
			
		},

		LoadSearchContainer: function () {
		    if (this.collection.length == 0) {
		        $("#searchNewItemName").remove();
		        $(itemContent_el).append(this._searchTemplate());
		    }
		},

		RefreshItemsTable: function () {
		    this.trigger('refresh'); //this.mainView.RefreshTable();
		    if (Global.isBrowserMode) {
		        Shared.UseBrowserScroll('#inventoryItemsTableContent');
		        $('#inventoryItemsTableContent').css('margin-bottom', '0');
		    } else { this.LoadScroll(); }
		}
	});
	return StockItemLisView;
})
