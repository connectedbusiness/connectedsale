define(["jquery","mobile","underscore","backbone","shared/global","shared/method","shared/service","shared/shared","model/stock","collection/stocks","model/base","collection/base","view/20.0.0/products/receivestocks/detail/locations/locations","text!template/20.0.0/products/receivestocks/detail/add/addeditemcontent.tpl.html"],function(t,e,i,s,o,n,a,h,r,l,u,c,d,C){var I={In:"In",Out:"Out"},f="#WarehouseDivContainer",g=s.View.extend({_template:i.template(C),tagName:"tr",BindEvents:function(){var e=this;t(this.classID.CID+this.classID.Item).on("tap",function(t){t.preventDefault(),e.SetSelected()}),t(this.classID.CID+" #quantityDetail").on("tap",function(t){t.preventDefault(),e.ShowChangeQty()}),t(this.classID.CID+" #changeQty").on("keyup",function(t){t.preventDefault(),e.ComputeQuantityAfter(t)}),t(this.classID.CID+" #costDetail").on("tap",function(t){t.preventDefault(),e.ShowChangeCost()}),t(this.classID.CID+" #changeCost").on("keyup",function(t){t.preventDefault(),e.ChangeCost(t)}),t(this.classID.CID+" #removeContent").on("tap",function(t){t.preventDefault(),e.RemoveItem()}),t(this.classID.CID+" #warehouseCodeDetail").on("tap",function(t){t.preventDefault(),e.ShowChangeWarehouse(t)}),t(this.classID.CID+" #drpUM").on("change",function(t){t.preventDefault(),e.ChangeUM()}),t(this.classID.CID+" #UMDetail").on("tap",function(t){t.preventDefault(),e.ShowChangeUM()}),t(this.classID.CID+" #changeQty").on("blur",function(t){t.preventDefault(),e.QuantityAfterBlur(t)}),t(this.classID.CID+" #changeCost").on("blur",function(t){t.preventDefault(),e.CostAfterBlur(t)}),t(this.classID.CID+" #changeQty").on("focus",function(t){e.saveAndClearValue("Qty",t)}),t(this.classID.CID+" #changeCost").on("focus",function(t){e.saveAndClearValue("Cost",t)})},saveAndClearValue:function(e,i){var s=this.classID.CID+"#"+i.target.id,o=t(s).val();switch(t(s).val(""),e){case"Qty":this.lastQTY=o;break;case"Cost":this.lastCost=o}this.assignNumericValidation(e,i)},assignNumericValidation:function(t,e){console.log(t+" : "+e.target.id);var i=this.classID.CID+"#"+e.target.id;switch(t){case"Qty":h.Input.NonNegativeInteger(i);break;case"Cost":h.Input.NonNegative(i)}},initialize:function(){this.classID={CID:" #"+this.cid+" ",Item:" .itemName ",ID:this.cid},this.render()},render:function(){this.LoadContentDetails()},SetSelected:function(){this.trigger("searchItem",this)},ChangeCost:function(e){13===e.keyCode?this.DisplayCost():"0."!=e.currentTarget.value&&"."!=e.currentTarget.value||(t(e.target).val("0.0"),t(e.target).focus(),t(e.target).val("0."))},ChangeUM:function(){this.model.get("WarehouseCode"),this.$(this.classID.CID+"#drpUM").val();this.ComputeForQtyAfter(),this.ReloadTemplate(),this.InitializeLocations(),this.trigger("refreshTable")},ChangeWarehouse:function(e){t(f).hide();var i=e;this.cost=parseFloat(this.model.get("Cost")),this.RecalculateQuantity(),this.ReinitializeContent(i,this.cost),this.ReloadTemplate(),this.InitializeLocations(),this.trigger("refreshTable")},CheckAdjustmentType:function(){"Out"===this.model.get("AdjustmentType")?t(".inventoryItem-cost").hide():t(".inventoryItem-cost").show()},ComputeQuantityAfter:function(t){13===t.keyCode&&(this.RecalculateQuantity(),this.ReloadTemplate(),this.InitializeLocations(),this.trigger("refreshTable"))},CostAfterBlur:function(t){this.DisplayCost()},DisplayContent:function(t){this.stockItemCollection?this.stockItemCollection.reset():this.stockItemCollection=new l(t.InventoryAdjustments),this.warehouseCode=this.stockItemCollection.at(0).get("WarehouseCode"),this.unitMeasureCode=this.stockItemCollection.at(0).get("UnitMeasureCode"),this.unitMeasureQty=this.stockItemCollection.at(0).get("UnitMeasureQty"),this.originalQuantity=this.stockItemCollection.at(0).get("OriginalQuantity"),this.quantityAfter=this.stockItemCollection.at(0).get("OriginalQuantity"),this.cost=this.stockItemCollection.at(0).get("Cost").toFixed(2),this.model.set({ModelID:this.cid,WarehouseCode:this.warehouseCode,UnitMeasureCode:this.unitMeasureCode,UnitMeasureQuantity:this.unitMeasureQty,OriginalQuantity:this.originalQuantity,Cost:this.cost,QuantityAfter:this.quantityAfter,LocationCode:"Zone1"}),this.RecomputeQtyAfter(this.model.get("Quantity"),this.originalQuantity),this.$el.append('<tr id="'+this.cid+'">'+this._template(this.model.toJSON())+"</tr>"),this.trigger("refreshTable"),this.CheckAdjustmentType(),this.InitializeLocations(),this.BindEvents()},DisplayCost:function(){var e=parseFloat(this.$(this.classID.CID+"#changeCost").val());this.ValidateInputNum(e)===!1&&this.UpdateCost(e),0===e&&this.UpdateCost(e),this.HideOtherInput(),t(this.classID.CID).html(this._template(this.model.toJSON())),this.InitializeLocations(),this.trigger("refreshTable")},InitializeLocations:function(){if(this.locationLookup)this.LoadWareHouse(),this.CheckAdjustmentType();else{this.locationLookup=new r;var t=this;this.locationLookup.url=o.ServiceUrl+a.PRODUCT+n.GETLOCATIONLOOKUP+"100",this.locationLookup.save(null,{success:function(e,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.LoadWareHouse(i)}})}},LoadContentDetails:function(){var t=new r,e=this;t.url=o.ServiceUrl+a.PRODUCT+n.GETRECEIVESTOCKITEMDETAILS+this.model.get("ItemCode");var i=function(i){t.set({StringValue:i}),t.save(null,{success:function(t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.DisplayContent(i)}})};this.ValidateDefaultLocationStatus(i)},ValidateDefaultLocationStatus:function(t){var e=new u;e.url=o.ServiceUrl+a.PRODUCT+"iswarehouseactive/",e.set({StringValue:o.Preference.DefaultLocation}),e.save(e,{success:function(e,i){i.Value?t(o.Preference.DefaultLocation):(h.ShowNotification("Default Location '"+o.Preference.DefaultLocation+"' is inactive.",!0),t())},error:function(e,i,s){t()}})},LoadUm:function(){var t=this.stockItemCollection.at(0).get("WarehouseCode");this.$(this.classID.CID+'#drpUM > option[val !=""]').remove();var e=this;this.stockItemCollection.each(function(i){if(t==i.get("WarehouseCode")){var s=i.get("UnitMeasureCode");e.$(e.classID.CID+"#drpUM").append(new Option(s,s))}})},LoadWareHouse:function(t){var e=this,i="";h.IsNullOrWhiteSpace(t)||(this.locationCollection||(this.locationCollection=new l),this.locationCollection.reset(t.Warehouses)),h.IsNullOrWhiteSpace(this.warehouseCollection)&&(this.warehouseCollection=new c),this.warehouseCollection.reset(),this.locationCollection.each(function(t){t.get("IsActive")&&t.get("WarehouseCode")!=i&&(e.warehouseCollection.add(t),i=t.get("WarehouseCode"))}),this.CheckAdjustmentType(),this.BindEvents()},QuantityAfterBlur:function(t){this.RecalculateQuantity(),this.ReloadTemplate(),this.InitializeLocations(),this.trigger("refreshTable")},RecalculateQuantity:function(){var t=parseInt(this.$(this.classID.CID+"#changeQty").val());this.ValidateInputNum(t)===!1&&this.UpdateQuantity(t),0===t&&this.UpdateQuantity(t)},RecomputeQtyAfter:function(t,e){var i=0,s=parseInt(t);parseInt(e);(h.IsNullOrWhiteSpace(s)||s>0)&&(i=this.model.get("AdjustmentType")===I.In?e+s:e-s,this.model.set({QuantityAfter:i,Quantity:s}))},ReinitializeContent:function(t,e){var i=this,s=new r,l="";h.IsNullOrWhiteSpace(e)||(l=e);var u=function(t){s.set({StringValue:t}),s.url=o.ServiceUrl+a.PRODUCT+n.GETRECEIVESTOCKITEMDETAILS+i.model.get("ItemCode"),s.save(null,{success:function(t,e){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),i.ReintializeContentCompleted(e,l)}})};return h.IsNullOrWhiteSpace(t)?void this.ValidateDefaultLocationStatus(u):void u(t)},ReintializeContentCompleted:function(t,e){this.warehouseCode=t.InventoryAdjustments[0].WarehouseCode,this.unitMeasureCode=t.InventoryAdjustments[0].UnitMeasureCode,this.unitMeasureQty=t.InventoryAdjustments[0].UnitMeasureQty,this.originalQuantity=t.InventoryAdjustments[0].OriginalQuantity,this.quantityAfter=t.InventoryAdjustments[0].OriginalQuantity,h.IsNullOrWhiteSpace(e)?this.cost=t.InventoryAdjustments[0].Cost.toFixed(2):this.cost=parseFloat(e).toFixed(2),this.model.set({ModelID:this.cid,WarehouseCode:this.warehouseCode,UnitMeasureCode:this.unitMeasureCode,UnitMeasureQuantity:this.unitMeasureQty,OriginalQuantity:this.originalQuantity,Cost:this.cost,QuantityAfter:this.quantityAfter,LocationCode:"Zone1"}),this.RecomputeQtyAfter(this.model.get("Quantity"),this.originalQuantity),this.ReloadTemplate(),this.CheckAdjustmentType(),this.InitializeLocations(),this.trigger("refreshTable")},ReloadTemplate:function(){this.$(this.classID.CID).html(this._template(this.model.toJSON())),this.trigger("refreshTable")},RemoveItem:function(){this.$(this.classID.CID).remove(),this.trigger("RemoveItem",this.model),this.trigger("refreshTable")},ShowChangeQty:function(){this.$(this.classID.CID+"#quantityDetail").hide(),this.$(this.classID.CID+"#changeQuantity").show(),this.$(this.classID.CID+"#changeQty").focus();parseFloat(this.$(this.classID.CID+"#changeQty").val());this.trigger("refreshTable")},HideOtherInput:function(){this.trigger("HideOtherInputs")},ShowChangeUM:function(){this.HideOtherInput(),this.$(this.classID.CID+"#UMDetail").hide(),this.$(this.classID.CID+"#changeUm-div").show(),this.$(this.classID.CID+"#drpUM").val(this.model.get("WarehouseCode")),this.trigger("refreshTable")},ShowChangeWarehouse:function(t){this.HideOtherInput(),this.GetCoordinates(t)},GetCoordinates:function(t){if(!this.isStillLoading){var e="warehouseCodeDetail",i=t.offsetX?t.offsetX:t.pageX-document.getElementById(e).offsetLeft,s=t.offsetY?t.offsetY:t.pageY-document.getElementById(e).offsetTop;if(o.isBrowserMode){var h=navigator.userAgent.toLowerCase().indexOf("chrome")>-1;if(h){var l=new Number,u=new Number;l=t.clientX,u=t.clientY,i=l,s=u}}this.isStillLoading=!0;var c=new r,d=this;c.url=o.ServiceUrl+a.PRODUCT+n.GETLOCATIONLOOKUP+"100",c.save(null,{success:function(t,e){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),d.LoadWareHouse(e),d.ShowWarehouseOption(i,s),d.isStillLoading=!1},error:function(){d.ShowWarehouseOption(i,s),d.isStillLoading=!1}})}},ShowWarehouseOption:function(t,e){var i=new d({el:f,collection:this.warehouseCollection,model:this.model});i.on("selected",this.ChangeWarehouse,this),i.InitializeChildviews(),i.Show(t,e),this.WarehouseOnPopUp()},WarehouseOnPopUp:function(){var e=this;t(document).on("tap",function(i){var s=t(i.target);s.hasClass("popupHundler")===!1&&e.WarehouseOutsideMenuHundler()})},WarehouseOutsideMenuHundler:function(){t(f).hide()},ShowChangeCost:function(t){this.HideOtherInput(),this.$(this.classID.CID+"#costDetail").hide(),this.$(this.classID.CID+"#changeCost-div").show(),this.$(this.classID.CID+"#changeCost").focus(),this.trigger("refreshTable")},UpdateCost:function(t){this.model.set({Cost:t.toFixed(2)})},UpdateQuantity:function(t){var e=parseInt(this.model.get("OriginalQuantity")),i=0;i=this.model.get("AdjustmentType")===I.In?e+t:e-t,this.model.set({QuantityAfter:i,Quantity:t})},ValidateInputNum:function(t){return!!(h.IsNullOrWhiteSpace(t)||t<0)}});return g});