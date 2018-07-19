define(["jquery","mobile","underscore","shared/global","backbone","shared/enum","shared/method","shared/service","shared/shared","model/lookupcriteria","model/base","collection/stocks","collection/accessories","collection/substitutes","collection/unitmeasures","view/15.1.0/pos/itemdetail/item","view/15.1.0/pos/itemdetail/freestock","view/15.1.0/pos/itemdetail/accessory/accessories","view/15.1.0/pos/itemdetail/accessory/accessorydetail","text!template/15.1.0/pos/itemdetail/itemdetail.tpl.html","text!template/15.1.0/pos/itemdetail/accessory/accessorypage.tpl.html","js/libs/iscroll.js"],function(e,t,i,s,o,a,c,n,r,l,d,h,m,u,w,b,S,I,p,y,C){var g,v="",D=!1,k=null,f=null,A=o.View.extend({_template:i.template(y),_AccessoryTemplate:i.template(C),events:{"tap #done-itemDetail":"doneItemDetail_touchstart","tap #back-itemDetail":"backItemDetail_touchstart","tap #back-accessory":"backItemDetail_touchstart","tap #back-substitute":"backItemDetail_touchstart","tap #add-itemDetail":"addItemDetail_touchstart","keypress #accessory-search":"inputKeypress","tap #accessory-search":"ShowClearBtn","blur #accessory-search":"HideClearBtn","tap #accessory-searchClearBtn":"ClearText"},initialize:function(){this.model.on("change:SalesPriceRate",this.UpdatedPrice,this),this.type=this.options.type,this.Show(this.model,"Item"),g=this.model,s.ReasonViewRendered=!1},UpdatedPrice:function(t){e("#price-input").val(t.get("SalesPriceRate"))},inputKeypress:function(t){if(!f||this.cid==f.CurrentItemDetailViewID)if(13===t.keyCode){var i=e("#accessory-search").val();this.FindItem(i)}else this.ShowClearBtn(t)},SetCartInstance:function(e){f=e},FindItem:function(e){switch(this.isSearch=!0,f&&f.CurrentItemDetailModel.get("ItemCode")!=this.model.get("ItemCode")&&(this.model=f.CurrentItemDetailModel),v){case"Accessory":this.LoadAccessory(this.model,100,e),v="Accessory";break;case"Substitute":this.LoadSubstitute(this.model,100,e),v="Substitute"}},FetchUM:function(){var e=this,t=new l,i=100,o=this.model.get("UnitMeasureCode");t.set({CriteriaString:this.model.get("ItemCode")}),t.url=s.ServiceUrl+n.PRODUCT+c.UNITMEASURECODELOOKUP+i+"/"+this.model.get("ItemCode"),t.save(null,{success:function(t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RetrieveUM(i,o)},error:function(e,t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Retrieving Unit of Measure")}})},RetrieveUM:function(t,i){this.umCollection=new w,this.umCollection.reset(t.UnitMeasures),e("#itemDetail-umList").html(""),this.umCollection.each(function(t){e("#itemDetail-umList").append(new Option(t.get("UnitMeasureCode"),t.get("UnitMeasureCode"))),e("#itemDetail-umList option[value='"+i+"']").attr("selected","selected"),e("#itemDetail-umList").selectmenu("refresh",!0)})},render:function(t){g=this.model=t;var i=s.ServiceUrl+c.IMAGES+this.model.get("ItemCode")+".png?"+Math.random(),o=r.Escapedhtml(this.model.get("ItemName"));r.Escapedhtml(this.model.get("ItemDescription"));if(this.model.get("ItemDescriptionWithNotesDisplay"))var a=r.Escapedhtml(this.model.get("ItemDescriptionWithNotesDisplay"));else var a=r.Escapedhtml(this.model.get("ItemDescription"));s.IsUseISEImage&&(i=this.AssignISEImageLocation(this.model.get("Filename"))),this.model.set({ImageLocation:i,ItemNameDisplay:o,ItemDescriptionDisplay:a},{silent:!0}),this.$el.html(this._template(this.model.toJSON())),this.FetchUM(),this.ShowContent("Item"),e("#main-transaction-blockoverlay").show()},RenderView:function(){e("#itemDetail-inner").replaceWith(this._AccessoryTemplate)},GenerateAccImageByItemCode:function(){var e=new l;e.on("sync",this.ShowAccView,this),e.set({StringValue:this.model.get("ItemCode")}),e.url=s.ServiceUrl+n.PRODUCT+c.GENERATEITEMIMAGEBYCODE,e.save()},GenerateSubImageByItemCode:function(){var e=new l;e.on("sync",this.ShowSubView,this),e.set({StringValue:this.model.get("ItemCode")}),e.url=s.ServiceUrl+n.PRODUCT+c.GENERATEITEMIMAGEBYCODE,e.save()},ShowAccView:function(){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator();var e=s.ServiceUrl+c.IMAGES+this.model.get("ItemCode")+".png?"+Math.random();s.IsUseISEImage&&(e=this.AssignISEImageLocation(this.model.get("Filename"))),this.model.set({ImageLocation:e},{silent:!0}),this.$el.html(this._template(this.model.toJSON())),this.ShowContent("Accessory")},ShowSubView:function(){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator();var e=s.ServiceUrl+c.IMAGES+this.model.get("ItemCode")+".png?"+Math.random();s.IsUseISEImage&&(e=this.AssignISEImageLocation(this.model.get("Filename"))),console.log(e),this.model.set({ImageLocation:e},{silent:!0}),this.$el.html(this._template(this.model.toJSON())),this.ShowContent("Substitute")},RenderAccView:function(e){this.model=e,this.GenerateAccImageByItemCode()},RenderSubView:function(e){this.model=e,this.GenerateSubImageByItemCode()},ShowContent:function(e){switch(e){case"Item":this.ShowItemView();break;case"Accessory":this.ShowDetailView(e),v="AccessoryDetail";break;case"Substitute":this.ShowDetailView(e),v="SubstituteDetail"}},ShowView:function(t,i){switch(i){case"Accessory":e("#itemDetail-title").html("Accessory"),e("#done-itemDetail").show(),e("#back-itemDetail").show(),e("#add-itemDetail").hide(),e("#back-accessory").hide();break;case"Substitute":e("#itemDetail-title").html("Substitute"),e("#done-itemDetail").show(),e("#back-itemDetail").show(),e("#add-itemDetail").hide(),e("#back-substitute").hide()}this.RenderView(),this.accessoryView=new I({el:e("#accessory-content"),collection:t}),e("#itemDetail").removeClass("itemDetalViewFullDetails")},ShowDetailView:function(t){switch(t){case"Accessory":e("#back-accessory").show(),e("#back-substitute").hide();break;case"Substitute":e("#back-substitute").show(),e("#back-accessory").hide()}e("#itemDetail-title").html("Details"),e("#back-itemDetail").hide(),e("#done-itemDetail").hide(),e("#add-itemDetail").show(),this.accessoryDetailView=new p({model:this.model}),this.$("#itemDetail-content").html(this.accessoryDetailView.render(this.model).el),this.$("#itemDetail-content").trigger("create")},ShowItemView:function(){e("#itemDetail-title").html("Item"),e("#add-itemDetail").hide(),e("#back-accessory").hide(),e("#back-substitute").hide(),e("#back-itemDetail").hide(),this.itemView=null,this.itemView=new b({model:this.model}),this.$("#itemDetail-content").html(this.itemView.render(this.model,this.type).el),this.$("#itemDetail-content").trigger("create")},ShowFreeStock:function(t){switch(t){case"FreeStock":e("#back-itemDetail").show(),e("#add-itemDetail").css("visibility","hidden"),e("#back-accessory").css("visibility","hidden"),e("#back-substitute").css("visibility","hidden");break;case"AccessoryDetail":e("#back-itemDetail").show(),e("#back-accessory").css("visibility","hidden"),e("#add-itemDetail").css("visibility","hidden"),e("#done-itemDetail").css("visibility","hidden"),v="AccessoryFreeStock";break;case"SubstituteDetail":e("#back-itemDetail").show(),e("#back-substitute").css("visibility","hidden"),e("#add-itemDetail").css("visibility","hidden"),e("#done-itemDetail").css("visibility","hidden"),v="SubstituteFreeStock"}e(".popover-right").css("visibity","hidden")},ShowFreeStockView:function(t,i){e("#itemDetail").removeClass("itemDetalViewFullDetails"),e("#itemDetail-title").html("Free Stock");var s=this.LoadFreeStockByUnitOfMeasure(t);console.log("state : "+v),this.ShowFreeStock(v),k=new S({model:this.model}),k.on("freeStockLoaded",this.FreeStockLoaded),this.$("#itemDetail-content").html(k.render(s).el),this.$("#itemDetail-content").trigger("create"),this.myScroll=new iScroll("itemDetail-content"),k.trigger("freeStockLoaded",this)},FreeStockLoaded:function(e){console.log("FreeStockLoaded!"),D=!0},LoadFreeStockByUnitOfMeasure:function(e){var t=this.model.get("UnitMeasureCode");if(this.stockContainer=new h,this.stockContainer.reset(e.StockTotalDetails),this.stockCollection=new h,this.stockContainer.length>0){var i=this;this.stockContainer.each(function(e){e.get("UnitMeasureCode")===t&&i.stockCollection.add(e)})}return this.stockCollection},Close:function(){s.IsOnItemDetail=!1,r.FocusToItemScan(),this.isSearch=!1,this.Hide(),e("#main-transaction-blockoverlay").hide()},GenerateItemImageByCode:function(e){this.tempModel=new l,this.tempModel=e,this.generateImage=new l,this.generateImage.on("sync",this.ShowItemDetails,this),this.generateImage.set({StringValue:e.get("ItemCode")}),this.generateImage.url=s.ServiceUrl+n.PRODUCT+c.GENERATEITEMIMAGEBYCODE,this.generateImage.save()},ShowItemDetails:function(){switch(this.viewType){case"Item":this.render(this.tempModel),v=this.viewType,e("#itemDetail").addClass("itemDetalViewFullDetails"),this.tempModel.get("ItemType")!=a.ItemType.Service&&this.tempModel.get("ItemType")!=a.ItemType.NonStock||e("#li-freestock").css("display","none !important");break;case"FreeStock":this.LoadFreeStock(this.tempModel),v=this.viewType;break;case"Accessory":this.LoadAccessory(this.tempModel,100,""),v=this.viewType;break;case"Substitute":this.LoadSubstitute(this.tempModel,100,""),v=this.viewType}var t="";switch("Kiosk"==s.ApplicationType&&(t='<br class="clearfloat"/>'),e(".kiosk-itemdetail-clearfloat").html(t),s.TransactionType){case a.TransactionType.SalesPayment:case a.TransactionType.VoidTransaction:case a.TransactionType.Recharge:this.$("#btn-remove-item").hasClass("ui-disabled")||this.$("#btn-remove-item").addClass("ui-disabled");break;case a.TransactionType.ConvertOrder:0==this.itemView.isCurrentOrder?this.$("#btn-remove-item").hasClass("ui-disabled")&&this.$("#btn-remove-item").removeClass("ui-disabled"):this.$("#btn-remove-item").hasClass("ui-disabled")||this.$("#btn-remove-item").addClass("ui-disabled");break;default:this.$("#btn-remove-item").removeClass("ui-disabled")}this.$el.show()},Clear:function(){this.unbind()},Show:function(e,t){s.IsOnItemDetail=!0,this.viewType=t,this.$("#btn-remove-item").addClass("ui-disabled"),this.GenerateItemImageByCode(e),s.ReasonViewRendered=!1},Hide:function(){this.$el.hide()},doneItemDetail_touchstart:function(e){e.preventDefault(),this.Close()},backItemDetail_touchstart:function(t){switch(t.preventDefault(),t.stopImmediatePropagation(),v){case"Accessory":this.render(g),v="Item";break;case"FreeStock":this.render(g),v="Item";break;case"Substitute":this.render(g),v="Item";break;case"AccessoryDetail":this.LoadAccessory(g,100,""),v="Accessory";break;case"AccessoryFreeStock":D&&k.model&&(this.model=k.model,k.UnbindView,k=null,D=!1),this.RenderAccView(this.model),v="AccessoryDetail";break;case"SubstituteDetail":this.LoadSubstitute(g,100,""),v="Substitute";break;case"SubstituteFreeStock":D&&k.model&&(this.model=k.model,k.UnbindView,k=null,D=!1),this.RenderSubView(this.model),v="SubstituteDetail"}e("#itemDetail").addClass("itemDetalViewFullDetails")},addItemDetail_touchstart:function(e){e.preventDefault(),this.AddItem(this.model)},AddItem:function(e){this.collection.add(e),this.Close()},LoadAccessory:function(t,i,o){var a=this,d=new l,h=i,u=t.get("ItemCode");this.model=t,this.accessoryCollection||(this.accessoryCollection=new m,this.accessoryCollection.bind("selected",this.RenderAccView,this),this.accessoryCollection.bind("showOnHand",this.LoadFreeStock,this),this.accessoryCollection.bind("itemAdded",this.AddItem,this)),o||(o=""),d.set({ItemCode:u,CriteriaString:o,WebsiteCode:r.GetWebsiteCode(),WarehouseCode:s.LocationCode}),d.url=s.ServiceUrl+n.PRODUCT+c.ACCESSORYLOOKUP+h,d.save(null,{success:function(t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e("#li-accessory").removeClass("ui-disabled"),i.Items?(a.accessoryCollection.reset(i.Items),a.ShowView(a.accessoryCollection,v)):1==a.isSearch?(a.isSearch=!1,navigator.notification.alert('Item "'+o+'" does not exist.',null,"Item Not Found","OK"),e("#accessory-search").val("")):(console.log(u+"has no accessories."),navigator.notification.alert("Item has no accessories.",null,"No Accessories Found","OK"))},error:function(t,i,o){e("#li-accessory").removeClass("ui-disabled"),s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.RequestError(i,"Error Retrieving Accessories")}})},LoadFreeStock:function(e){var t=e.get("ItemCode"),i=e.get("UnitMeasureCode");this.model.set(e.attributes);var o=this;this.freeStockCollection||(this.freeStockCollection=new h);var a=new d;a.url=s.ServiceUrl+n.PRODUCT+c.LOCATIONSTOCKLOOKUP,a.set({ItemCode:t,UnitMeasureCode:i}),a.save(null,{success:function(e,t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),o.ShowFreeStockView(t)},error:function(e,t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Retrieving Free Stock"),console.log("Error Retrieving Free Stock")}})},LoadSubstitute:function(t,i,o){var a=this,d=new l,h=i,m=t.get("ItemCode");this.model=t,this.substituteCollection||(this.substituteCollection=new u,this.substituteCollection.bind("selected",this.RenderSubView,this),this.substituteCollection.bind("showOnHand",this.LoadFreeStock,this),this.substituteCollection.bind("itemAdded",this.AddItem,this)),o||(o=""),d.set({ItemCode:m,CriteriaString:o,WebsiteCode:r.GetWebsiteCode(),WarehouseCode:s.LocationCode}),d.url=s.ServiceUrl+n.PRODUCT+c.SUBSTITUTELOOKUP+h,d.save(null,{success:function(t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e("#li-substitute").removeClass("ui-disabled"),i.Items?(a.substituteCollection.reset(i.Items),a.ShowView(a.substituteCollection,v)):1==a.isSearch?(navigator.notification.alert('Item "'+o+'" does not exist.',null,"Item Not Found","OK"),e("#accessory-search").val(""),a.isSearch=!1):navigator.notification.alert("Item has no substitute.",null,"No Substitute Found","OK")},error:function(t,i,o){e("#li-substitute").removeClass("ui-disabled"),s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.RequestError(i,"Error Retrieving Substitute")}})},ShowClearBtn:function(t){t.stopPropagation();var i=t.target.id,i=t.target.id,s=e("#"+i).val(),o=s.length,a=e("#"+i).position(),c=e("#"+i).width();o<=0?this.HideClearBtn():null===a&&""===a||(e("#"+i+"ClearBtn").css({top:a.top+8,left:a.left+(c-25)}),e("#"+i+"ClearBtn").show())},HideClearBtn:function(){e(".clearTextBtn").fadeOut()},ClearText:function(t){var i=t.target.id,s=i.substring(0,i.indexOf("ClearBtn"));e("#"+s).val(""),this.HideClearBtn()},AssignISEImageLocation:function(e){var t=this.model.get("ItemDescription");if(console.log(s.TransactionType),void 0===e||null===e)switch(s.TransactionType){case a.TransactionType.UpdateInvoice:case a.TransactionType.SalesPayment:case a.TransactionType.UpdateOrder:case a.TransactionType.UpdateQuote:case a.TransactionType.ConvertOrder:case a.TransactionType.ConvertQuote:case a.TransactionType.SalesRefund:var i=t.replace(/[^a-zA-Z0-9]/g,"");return i=i.replace(/\s+/g,"")+".jpg",console.log(i+" "+this.model.get(i)),s.WebSiteURL+c.ISEIMAGES+s.ISEImageSize+i}return s.WebSiteURL+"/"+c.ISEIMAGES+s.ISEImageSize+e},UpdateSalesTaxAmountField:function(e){this.itemView&&this.itemView.UpdateSalesTaxAmountField(e)},UpdateExtPriceField:function(e){this.itemView&&this.itemView.UpdateExtPriceField(e)}});return A});