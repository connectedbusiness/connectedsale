define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/base","collection/stocks","collection/products","view/19.0.0/products/receivestocks/lookup/products","view/19.0.0/products/receivestocks/detail/add/itemlist","text!template/19.0.0/products/receivestocks/detail/addreceivestock.tpl.html","text!template/19.0.0/products/receivestocks/lookup/lookup.tpl.html","js/libs/moment.min.js","js/libs/ui.checkswitch.min.js","js/libs/format.min.js"],function(t,e,o,i,n,s,a,l,r,c,u,d,h,m,p){var v,k="ItemName",C={In:"In",Out:"Out"},y=i.View.extend({_template:o.template(m),_lookupTemplate:o.template(p),events:{"tap .saveBtn ":"saveBtn_Tap","tap .cancelBtn ":"cancelBtn_Tap","tap #lookup-product":"sortProductLookUp","tap #lookup-category":"sortCategoryLookUp","tap #done-lookup":"lookupDone_tap","tap #inventoryItems-footer":"addNewItem_tap","keypress #products-lookup-search":"inputLookUpSearch_KeyPress","tap #adjustmentIn":"adjustmentIn_tap","tap #adjustmentOut":"adjustmentOut_tap","tap #searchNewItemName":"addNewItem_tap"},addNewItem_tap:function(t){t.preventDefault(),l.Products.Overlay.Show(),this.ShowProductLookup()},adjustmentIn_tap:function(t){t.preventDefault(),this.adjustmentType=C.In,this.ToggleCheckBox(),this.RecalculateAdjustment()},adjustmentOut_tap:function(t){t.preventDefault(),this.adjustmentType=C.Out,this.ToggleCheckBox(),this.RecalculateAdjustment()},RecalculateAdjustment:function(){var t=this;this.stockCollection.length>0&&this.stockCollection.each(function(e){t.RecomputeQtyAfter(e)})},RecomputeQtyAfter:function(e){var o=0,i=e.get("Quantity"),n=e.get("OriginalQuantity");l.IsNullOrWhiteSpace(n)&&(n=0),console.log("qty : "+i+", org :"+n);var s=this;(l.IsNullOrWhiteSpace(i)||i>0)&&(o=this.adjustmentType===C.In?n+i:n-i,e.set({QuantityAfter:o,Quantity:i,AdjustmentType:s.adjustmentType})),console.log("QuantityAfter : "+e.get("QuantityAfter")),t("#"+e.get("ModelID")+" > .inventoryItem-quantityAfter").text(o),this.RefreshTable()},cancelBtn_Tap:function(t){t.preventDefault(),navigator.notification.confirm("Do you want to cancel this transaction?",I,"Confirmation",["Yes","No"])},inputLookUpSearch_KeyPress:function(t){13===t.keyCode&&this.FindLookupItem()},lookupDone_tap:function(t){t.preventDefault(),this.CloseLookup()},saveBtn_Tap:function(t){t.preventDefault(),this.ValidateFields()},sortProductLookUp:function(e){e.preventDefault(),t("#spin").remove(),k="ItemName",t("#lookup").replaceWith(this._lookupTemplate()),this.HideOtherButtons(),t("#lookup-category").removeClass("lookup-selected"),t("#lookup-product").addClass("lookup-selected"),this.ShowProductLookup()},sortCategoryLookUp:function(e){e.preventDefault(),t("#spin").remove(),k="CategoryCode",t("#lookup").replaceWith(this._lookupTemplate()),this.HideOtherButtons(),t("#lookup-product").removeClass("lookup-selected"),t("#lookup-category").addClass("lookup-selected"),this.ShowProductLookup()},initialize:function(){v=this,this.stocksAdjustmentType=this.options.type,this.render()},render:function(){this.$el.html(this._template),this.adjustmentType=C.In},AddNewItemToList:function(t){this.stockCollection||this.InitializeStockCollection();var e=this.stockCollection.find(function(e){return e.get("ItemCode")==t.get("ItemCode")});if(e)l.Products.ShowNotification("Item already exist on the list!",!0);else{var o=new r,i=function(){return t.get("IsReset")===!0?this.lineCtr:0};o.set({AdjustmentType:this.adjustmentType,ItemNameDisplay:t.get("ItemNameDisplay"),ItemName:t.get("ItemName"),ItemCode:t.get("ItemCode"),Quantity:t.get("Quantity"),UnitMeasureCode:t.get("UnitMeasureCode"),WarehouseCode:t.get("WarehouseCode"),UnitMeasureQuantity:t.get("UnitMeasureQuantity"),OriginalQuantity:t.get("OriginalQuantity"),QuantityAfter:t.get("QuantityAfter"),LineCtr:i(),Cost:0}),t.get("IsReset")===!0&&(this.lineCtr+=1);try{if(l.IsNullOrWhiteSpace(this.updateContent))this.stockCollection.add(o),console.log("Add Item!CollectionCount :"+this.stockCollection.length);else{var n=this;o.set({ModelID:n.itemContentView.model.get("ModelID")}),this.stockCollection.each(function(t){t.get("ModelID")==n.itemContentView.model.get("ModelID")&&t.set(o.attributes)}),this.itemContentView.model.set({ItemCode:t.get("ItemCode")}),this.itemContentView.ReinitializeContent(),this.updateContent=!1,console.log("Change Item!CollectionCount :"+this.stockCollection.length)}}catch(s){navigator.notification.alert("Error "+s,"","Error Adding item","OK")}}this.CloseLookup()},CheckAdjustmentType:function(){switch(this.ToggleCheckBox(),this.stocksAdjustmentType===C.Out&&t("#transactionType-div").show(),this.stocksAdjustmentType){case C.In:t("#addReceiveStock-title > h1").text("New Receive Stocks");break;case C.Out:t("#addReceiveStock-title > h1").text("New Stock Adjustment")}},Close:function(){this.adjustmentType=C.In,this.unbind()},CloseLookup:function(){try{t("#txt-search").removeAttr("disabled","disabled"),t("#transactionDate").removeAttr("disabled","disabled"),t("#products-lookup-search").blur(),t("#lookup").remove(),l.Products.Overlay.Hide()}catch(e){console.log("Error "+e)}},DeleteItem:function(t){this.stockCollection.each(function(e){t.get("ModelID")==e.get("ModelID")&&e.destroy()}),console.log("Deleted!CollectionCount :"+this.stockCollection.length),0==this.stockCollection.length&&(this.itemlistView.LoadSearchContainer(),this.itemlistView.isCleared=!1)},DoCancelNew:function(){n.FormHasChanges=!1,this.options.view.LoadItems(),this.Close()},FindLookupItem:function(){var e=t("#products-lookup-search").val();this.GetLookupItems(100,e)},GetLookupItems:function(t,e){var o=this,i=new r;this.productCollection=new u,this.productCollection.sortVar=k,this.productCollection.on("addItem",this.AddNewItemToList,this),i.set({Criteria:e,ItemTypes:"'Stock', 'Matrix Item', 'Assembly'"}),i.url=n.ServiceUrl+s.PRODUCT+a.GETITEMLISTBYITEMTYPE,i.save(null,{success:function(t,e,i){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),o.productCollection.reset(e.Items),o.ShowLookupCompleted()},error:function(t,e,o){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.RequestError(e,"Error")}})},HideOtherButtons:function(){t("#back-products").hide(),t("#add-lookup").hide(),t("#back-details").hide()},InitializeChildViews:function(){this.InitializeStockCollection(),this.InitializeItemList(),this.lineCtr=0,this.CheckAdjustmentType()},ChangeItem:function(t){this.updateContent=!0,this.itemContentView=t,l.Products.Overlay.Show(),this.ShowProductLookup()},InitializeItemList:function(){if(l.IsNullOrWhiteSpace(this.itemlistView)||this.itemlistView.unbind(),this.itemlistView=new h({el:t("#inventoryItems-area"),collection:this.stockCollection}),this.itemlistView.on("refresh",this.RefreshTable,this),this.itemlistView.on("searchItem",this.ChangeItem,this),this.itemlistView.on("RemoveItem",this.DeleteItem,this),this.itemlistView.InitializeChildViews(),n.isBrowserMode){var e=new Date;this.$("#transactionDate").val(this.JSONtoDate(e)),l.BrowserModeDatePicker("#transactionDate","datepicker","yy-mm-dd")}else l.BrowserModeDatePicker("#transactionDate","datepicker")},InitializeProductLookup:function(){this.productsView=new d({el:t("#lookup-content"),collection:this.productCollection}),this.productsView.render()},InitializeStockCollection:function(){this.stockCollection?this.stockCollection.reset():(this.stockCollection=new c,this.stockCollection.on("change",this.UpdateItem,this))},JsonToAspDate:function(t){var e=Date.parse(t),o=new Date(e),i=o.getMonth(),n=o.getDate(),s=o.getFullYear();return o=Date.UTC(s,i,n),o="/Date("+o+")/"},JSONtoDate:function(t){var e="YYYY-MM-DD",o=moment(t).format(e);return o},RefreshTable:function(){var t=this;this.ReloadTable(),setTimeout(function(){t.ReloadTable()},1e3)},ReloadTable:function(){t("#inventoryItemsTableHeader .inventoryItem-itemName").width(t("#inventoryItemsTableContent .inventoryItem-itemName").width()),t("#inventoryItemsTableHeader .inventoryItem-warehouseCode").width(t("#inventoryItemsTableContent  .inventoryItem-warehouseCode").width()),t("#inventoryItemsTableHeader .inventoryItem-unitMeasureCode").width(t("#inventoryItemsTableContent  .inventoryItem-unitMeasureCode").width()),t("#inventoryItemsTableHeader .inventoryItem-unitMeasureQuantity").width(t("#inventoryItemsTableContent  .inventoryItem-unitMeasureQuantity").width()),t("#inventoryItemsTableHeader .inventoryItem-originalQuantity").width(t("#inventoryItemsTableContent  .inventoryItem-originalQuantity").width()),t("#inventoryItemsTableHeader .inventoryItem-quantity").width(t("#inventoryItemsTableContent  .inventoryItem-quantity").width()),t("#inventoryItemsTableHeader .inventoryItem-quantityAfter").width(t("#inventoryItemsTableContent  .inventoryItem-quantityAfter").width()),t("#inventoryItemsTableHeader .inventoryItem-cost").width(t("#inventoryItemsTableContent  .inventoryItem-cost").width()),t("#inventoryItemsTableHeader .inventoryItem-remove").width(t("#inventoryItemsTableContent  .inventoryItem-remove").width()),console.log("Refresh Table")},SaveAdjustment:function(t){l.Products.Overlay.Show(),this.stockModel=new r,this.SetStockModel(),this.stockModel.url=n.ServiceUrl+s.PRODUCT+a.INVENTORYADJUSTMENT;var e=this;this.stockModel.save(null,{success:function(o,i){e.SaveCompleted(i,t)},error:function(t,e,o){l.Products.Overlay.Hide()}})},SaveCompleted:function(t,e){if(t.ErrorMessage){var o=t.ErrorMessage;if((o||"").toString().trim().toUpperCase()==="There is no enough stock available.".toLocaleUpperCase()){if(o="There is no enough stock available on some item(s)",this.stockCollection){var i=this.stockCollection.filter(function(t){return(t.get("OriginalQuantity")||0)-(t.get("Quantity")||0)>=0}).length||0;i>0&&(o+=" or has been already allocated")}o+="."}l.Products.ShowNotification(o,!0),l.Products.Overlay.Hide()}else{this.stockCollection.reset(),l.Products.ShowNotification("Stock Adjustment successfully saved!"),l.Products.Overlay.Hide();var n=new r;n.set({AdjustmentCode:t.TransactionCodes[0],TransactionDate:e}),this.options.view.LoadItems("",n),this.Close()}},SetStockModel:function(){var t=this;this.adjustmentCollection=new c;var e=this.$("#transactionDate").val(),o=this.JsonToAspDate(e);this.adjustmentCollection.add({TransactionDate:o,AdjustmentType:this.adjustmentType,AdjustmentCode:"",ReasonCode:"",ReferenceCode:"",TransactionType:"Adjustment",IsPosted:!0}),this.stockModel.set({Adjustments:t.adjustmentCollection.toJSON(),Items:t.stockCollection.toJSON()})},ShowLookupCompleted:function(){this.ShowLookup(),this.InitializeProductLookup()},ShowLookup:function(){t("#lookup").remove(),this.$el.append(this._lookupTemplate()),this.HideOtherButtons(),t("#lookup").show(),t("#txt-search").attr("disabled","disabled"),t("#transactionDate").attr("disabled","disabled"),t("#products-lookup-search").focus()},ShowLookupView:function(){this.lookupview=new LookupView({el:t("#lookup")}),t(".ui-icon-arrow-r").hide()},ShowProductLookup:function(){this.GetLookupItems(100,"")},ToggleCheckBox:function(){t("#adjustmentIn").removeClass("customCheckSwitch-selected"),t("#adjustmentOut").removeClass("customCheckSwitch-selected"),this.adjustmentType==C.In?(t("#adjustmentIn").addClass("customCheckSwitch-selected"),t(".inventoryItem-cost").show()):(t("#adjustmentOut").addClass("customCheckSwitch-selected"),t(".inventoryItem-cost").hide())},UpdateItem:function(t){console.log(this.stockCollection.length)},ValidateFields:function(){var t=this.$("#transactionDate").val();return l.IsNullOrWhiteSpace(t)?void l.Products.ShowNotification("Please Input Transaction Date.",!0):0==this.stockCollection.length?void l.Products.ShowNotification("Please add atleast one item on the list.",!0):this.ValidateQtyField()===!0?void l.Products.ShowNotification("The items in the detail table should have a value greater than 0 in the quantity",!0):void(this.ValidateNegativeQuantity()&&this.SaveAdjustment(t))},ValidateWarehouseStatus:function(){this.stockCollection.each(function(t){})},ValidateNegativeQuantity:function(t){if(n.CustomerPreference&&!n.CustomerPreference.IsIgnoreStockLevels){if(t)return!(parseFloat(t.get("QuantityAfter"))<0)||(l.Products.ShowNotification("There is no enough stock available for item '"+t.get("ItemName")+"'.",!0),!1);var e=!1;if(this.stockCollection.each(function(t){e||t.get("AdjustmentType")===C.Out&&parseFloat(t.get("QuantityAfter"))<0&&(e=!0)}),e)return l.Products.ShowNotification("There is no enough stock available on some item(s).",!0),!1}return!0},ValidateQtyField:function(){var t=!1;return this.stockCollection.each(function(e){e.get("Quantity")<=0&&(t=!0)}),t}}),I=function(t){1==t&&v.DoCancelNew()};return y});