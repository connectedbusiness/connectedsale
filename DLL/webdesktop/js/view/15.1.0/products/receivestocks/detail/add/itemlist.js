define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/15.1.0/products/receivestocks/detail/add/item","text!template/15.1.0/products/receivestocks/detail/add/itemlist.tpl.html","text!template/15.1.0/products/receivestocks/detail/add/searchitem.tpl.html","js/libs/iscroll.js"],function(e,t,o,n,i,r,l,s,a){var c="#inventoryItemsContentBody",h=n.View.extend({_template:o.template(s),_searchTemplate:o.template(a),events:{},initialize:function(){this.collection.on("add",this.AddNewItem,this),this.render(),console.log(this.collection)},render:function(){this.$el.html(this._template)},AddNewItem:function(t){e("#searchNewItemName").remove(),e(".newContent").remove();var o=new l({el:e(c),model:t});o.on("refreshTable",this.RefreshItemsTable,this),o.on("HideInputDisplay",this.HideOtherInput,this),o.on("searchItem",this.SearchItem,this),o.on("RemoveItem",this.DeleteItemOnCollection,this),this.RefreshItemsTable(),console.log(this.collection)},SearchItem:function(e){this.trigger("searchItem",e)},DeleteItemOnCollection:function(e){this.collection.each(function(t){e.get("ModelID")==t.get("ModelID")&&t.destroy()}),this.trigger("RemoveItem",e),this.LoadSearchContainer()},HideOtherInput:function(){e("#changeQuantity").hide(),e("#quantityDetail").show(),e("#costDetail").show(),e("#changeCost-div").hide()},InitializeChildViews:function(){this.InitilizeInventoryItems()},InitilizeInventoryItems:function(){this.isCleared=!1,this.LoadSearchContainer()},LoadScroll:function(){r.IsNullOrWhiteSpace(this.myScroll)?this.myScroll=new iScroll("inventoryItemsTableContent",{vScrollbar:!0,vScroll:!0,snap:!1,momentum:!0,onBeforeScrollStart:function(e){for(var t=e.target;1!=t.nodeType;)t=t.parentNode;"SELECT"!=t.tagName&&"INPUT"!=t.tagName&&"TEXTAREA"!=t.tagName&&e.preventDefault()}}):this.myScroll.refresh();setTimeout(function(){this.myScroll=new iScroll("inventoryItemsTableContent",{vScrollbar:!0,vScroll:!0,snap:!1,momentum:!0,onBeforeScrollStart:function(e){for(var t=e.target;1!=t.nodeType;)t=t.parentNode;"SELECT"!=t.tagName&&"INPUT"!=t.tagName&&"TEXTAREA"!=t.tagName&&e.preventDefault()}})},1e3)},LoadSearchContainer:function(){0==this.collection.length&&(e("#searchNewItemName").remove(),e(c).append(this._searchTemplate()))},RefreshItemsTable:function(){this.trigger("refresh"),i.isBrowserMode?(r.UseBrowserScroll("#inventoryItemsTableContent"),e("#inventoryItemsTableContent").css("margin-bottom","0")):this.LoadScroll()}});return h});