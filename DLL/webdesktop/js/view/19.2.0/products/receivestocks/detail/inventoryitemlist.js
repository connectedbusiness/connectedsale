define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/base","collection/base","text!template/19.2.0/products/receivestocks/detail/inventoryitemlist.tpl.html","text!template/19.2.0/products/receivestocks/detail/inventoryitem.tpl.html","js/libs/iscroll.js"],function(e,t,n,i,o,r,s,l,m,a,y,d){var I=i.View.extend({_template:n.template(y),_itemTemplate:n.template(d),initialize:function(){this.render(),this.InitilizeInventoryItems()},render:function(){this.$el.html(this._template())},DisplayInventoryItems:function(t){var n=this;this.itemCollection||(this.itemCollection=new a),this.itemCollection.reset(t.InventoryAdjustments),e("#inventoryItemsContent > tbody").html(""),this.itemCollection.length>0&&(this.itemCollection.each(function(t){var i=l.Escapedhtml(t.get("ItemName"));t.set({ItemName:i}),e("#inventoryItemsContent > tbody").hide(),e("#inventoryItemsContent > tbody").append("<tr>"+n._itemTemplate(t.toJSON())+"</tr>"),"Out"==n.adjustmentType&&e(".inventoryItem-cost").hide(),e("#inventoryItemsContent > tbody").show()}),this.RefreshItemsTable())},InitializeChildViews:function(){this.InitilizeInventoryItems()},InitilizeInventoryItems:function(){var e=new m,t=this,n=this.model.get("AdjustmentCode");0==n.indexOf("ADJOUT")?this.adjustmentType="Out":this.adjustmentType="In",e.url=o.ServiceUrl+r.PRODUCT+s.GETRECEIVESTOCKDETAILS+n,e.save(null,{success:function(e,n){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.DisplayInventoryItems(n)}})},LoadScroll:function(){var e=this;l.IsNullOrWhiteSpace(this.myScroll)?this.myScroll=new iScroll("inventoryItemsTableContent",{vScrollbar:!0,vScroll:!0,snap:!1,momentum:!0}):this.myScroll.refresh(),setTimeout(function(){e.myScroll.refresh()},1e3)},RefreshItemsTable:function(){e("#inventoryItemsTableHeader .inventoryItem-itemName").width(e("#inventoryItemsTableContent .inventoryItem-itemName").width()),e("#inventoryItemsTableHeader .inventoryItem-warehouseCode").width(e("#inventoryItemsTableContent  .inventoryItem-warehouseCode").width()),e("#inventoryItemsTableHeader .inventoryItem-unitMeasureCode").width(e("#inventoryItemsTableContent  .inventoryItem-unitMeasureCode").width()),e("#inventoryItemsTableHeader .inventoryItem-unitMeasureQuantity").width(e("#inventoryItemsTableContent  .inventoryItem-unitMeasureQuantity").width()),e("#inventoryItemsTableHeader .inventoryItem-originalQuantity").width(e("#inventoryItemsTableContent  .inventoryItem-originalQuantity").width()),e("#inventoryItemsTableHeader .inventoryItem-quantity").width(e("#inventoryItemsTableContent  .inventoryItem-quantity").width()),e("#inventoryItemsTableHeader .inventoryItem-quantityAfter").width(e("#inventoryItemsTableContent  .inventoryItem-quantityAfter").width()),"In"==this.adjustmentType&&e("#inventoryItemsTableHeader .inventoryItem-cost").width(e("#inventoryItemsTableContent  .inventoryItem-cost").width()),o.isBrowserMode?l.UseBrowserScroll("#inventoryItemsTableContent"):this.LoadScroll()}});return I});