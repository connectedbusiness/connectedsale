define(["jquery","mobile","underscore","backbone","bigdecimal","shared/global","shared/enum","shared/shared","view/18.1.0/pos/cart/total","view/18.1.0/pos/cart/cartItem","view/18.1.0/pos/cart/kit","view/18.1.0/pos/cart/promo","view/18.1.0/pos/cart/summary","view/18.1.0/pos/itemdetail/itemdetail","view/18.1.0/pos/seriallot/seriallot","model/summary","text!template/18.1.0/pos/cart/cart.tpl.html","js/libs/iscroll.js","js/libs/format.min.js","model/base"],function(t,e,i,a,s,o,n,r,l,c,m,h,d,u,w,p,y,g){var S=a.View.extend({_template:i.template(y),initialize:function(){this.summaryModel=this.options.summary,this.accessory=this.options.accessory,this.type=this.options.type,this.collection.on("add",this.ModelAdded,this),this.collection.on("change",this.ModelChanged,this),this.collection.on("viewDetails",this.ShowItemDetails,this),this.collection.on("viewFreeStock",this.ShowFreeStock,this),this.collection.on("viewAccessory",this.ShowAccessory,this),this.collection.on("viewSubstitute",this.ShowSubstitute,this),this.collection.on("itemRemoved",this.RemoveItem,this),this.collection.on("reset",this.ReinitializeCart,this),this.collection.on("removeSerialLot",this.RemoveSerial,this),this.collection.on("viewSerialLot",this.ShowSerialLot,this),this.collection.on("viewNotes",this.ShowNotes,this),this.collection.on("change:SalesPriceRate",this.PriceChanged,this),this.collection.on("showItems",this.ShowItems,this),this.collection.on("editKitItem",this.EditKit,this),this.render(),this.on("serialLotReady",this.FetchSerialLotCollection,this),this.on("updateKitDisplay",this.UpdateKitDisplay,this),this.on("updatePromoDisplay",this.UpdatePromoDisplay,this),o.Preference.AllowSaleDiscount&&window.sessionStorage.setItem("MaxSaleDiscount",o.Preference.MaxSaleDiscount)},PriceChanged:function(t){this.ReloadModel()},UpdateKitDisplay:function(t){var e=t.get("ItemCode")+"-"+t.get("LineNum"),i=this.$el.find("tbody#kit-"+e),a=i.prev();if(i.remove(),t.get("ItemType")==n.ItemType.Kit){var s=new m({id:e,lineNum:t.get("LineNum")});a.after(s.render().el)}},UpdatePromoDisplay:function(t,e){var i=new h({collection:t,getItemQty:e});this.$("#cartListContainer").append(i.render().el),this.LoadiScroll()},ShowItems:function(e){var i=this;t("#cartContent").hide(),e.each(function(t){i.ModelAdded(t)}),t("#cartContent").show()},render:function(){switch(this.type){case"POS":this.$el.html(this._template),this.InitializeTotalView(".total"),this.InitializeSummaryView(".transactionSummary")}},LoadiScroll:function(){var e="cartContent",i="cartListContainer",a=t("#"+e).offset().top+t("#"+e).height(),s=t("#"+i).offset().top+t("#"+i).height();return o.isBrowserMode?void(s>a&&t("#"+e).animate({scrollTop:t("#"+i)[0].scrollHeight},100)):void(this.myScroll?(this.myScroll.refresh(),s>a&&this.myScroll.scrollToElement("tbody:last-child",100)):this.myScroll=new iScroll(e,{vScrollbar:!0,vScroll:!0,snap:!0,momentum:!0,onBeforeScrollStart:function(t){for(var e=t.target;1!=e.nodeType;)e=e.parentNode;"SELECT"!=e.tagName&&"INPUT"!=e.tagName&&"TEXTAREA"!=e.tagName&&t.preventDefault()}}))},RefreshScroll:function(){var t=this;this.myScroll&&setTimeout(function(){t.myScroll.refresh()},500)},AddOneItemToCart:function(e){if(this.collection.total()<=1e10){var i=new c({model:e,totalDiscount:this.collection.totalDiscount(),type:o.ApplicationType});if(i.on("editKitItem",function(){this.trigger("editKitItem")}.bind(this)),this.$("#cartListContainer").append(i.render().el),1==e.get("IsPromoItem")&&(t("#"+e.cid+" #quantityDisplay").addClass("ui-disabled"),t("#"+e.cid+" #display-itemName").addClass("ui-disabled"),t("#"+e.cid+" #itemPriceDisplay").addClass("ui-disabled"),t("#"+e.cid+" #discountDisplay").addClass("ui-disabled"),t("#"+e.cid+" #extPriceRate-td").addClass("ui-disabled"),i.displayPromoCaption()),e.get("ItemType")===n.ItemType.Kit){var a=new m({id:e.get("ItemCode")+"-"+e.get("LineNum"),lineNum:e.get("LineNum")});this.$("#cartListContainer").append(a.render().el)}this.AddNetToInvoiceTotal(e,"add"),i.bindEvents();var s=o.TransactionType===n.TransactionType.SalesRefund;this.ShowOutstanding(s)}},InitializeTotalView:function(e){this.totalView=new l({collection:this.collection,model:this.summaryModel,el:t(e),type:o.ApplicationType})},InitializeSummaryView:function(t){this.summaryView=new d({model:this.summaryModel,type:o.ApplicationType}),this.summaryView.on("viewPayments",this.ViewPayments,this),this.summaryView.on("viewSignature",this.ViewSignature,this),this.summaryView.on("viewTaxOverrideList",this.ViewTaxList,this),this.summaryView.on("loadOrderNotes",this.LoadOrderNotes,this),this.summaryView.on("orderNotesSaved",this.ProcessSavedNotes,this),this.$(t).html(this.summaryView.render().el)},InitializeSerializeLot:function(e,i,a,s,o){this.serializeLot?this.serializeLot.Show(this.serialLot,e,i,a,s,o,t("#serialLotContainer")):this.serializeLot=new w({el:t("#serialLotContainer"),type:e,itemCode:i,itemName:a,lineNum:s,itemType:o,collection:this.serialLot})},InitializeSummaryModel:function(){this.summaryModel=new p},ModelAdded:function(t){this.AddOneItemToCart(t),this.RefreshCartTable()},ModelChanged:function(t){this.AddNetToInvoiceTotal(t,"update")},RefreshCartTable:function(){this.$(".cartDetails .itemName").width(this.$("#cartListContainer .cart-details .itemName").width()),this.$(".cartDetails .itemQty").width(this.$("#cartListContainer .cart-details .itemQty").width()),this.$(".cartDetails .itemRemaining").width(this.$("#cartListContainer .cart-details .itemRemaining").width()),this.$(".cartDetails .itemPrice").width(this.$("#cartListContainer .cart-details .itemPrice").width()),this.$(".cartDetails .itemDiscount").width(this.$("#cartListContainer .cart-details .itemDiscount").width()),this.$(".cartDetails .itemExtPrice").width(this.$("#cartListContainer .cart-details .itemExtPrice").width()),this.$(".cartDetails .itemViewDetail").width(this.$("#cartListContainer .cart-details .itemViewDetail").width()),this.LoadiScroll()},AddNetToInvoiceTotal:function(t,e){var i=0,a=0,s=0,r=0,l="QuantityOrdered",c=0,m=this.summaryModel.get("TotalTax"),h=this.collection.total(),d=this.summaryModel.get("Payment"),u=this.summaryModel.get("Qty"),w=0,p=0,y=this.summaryModel.get("TotalDiscount"),g=0;switch(o.TransactionType!==n.TransactionType.SalesRefund&&o.TransactionType!==n.TransactionType.Return||(l="Good"),e){case"add":i=t.get("ExtPriceRate"),a=t.get("SalesTaxAmountRate"),r=t.get(l),u+=r;break;case"update":i=t.get("ExtPriceRate")-t.previous("ExtPriceRate"),a=t.get("SalesTaxAmountRate")-t.previous("SalesTaxAmountRate"),r=t.get(l)-t.previous(l),c=this.computeDiscount(t),u+=r;break;case"delete":i=t.get("ExtPriceRate"),a-=t.get("SalesTaxAmountRate"),r=t.get(l),u-=r}m+=a,s=h+m-d,h=parseFloat(h.toFixed(2)),m=parseFloat(this.RoundNumber(format("0.00000",m),4));var S=parseFloat(this.RoundNumber(format("0.00000",m),4));if(this.IsReturn()){var T=parseFloat(parseFloat(m).toFixed(4)),f=parseFloat(this.preciseRound(m,4));S=.005==parseFloat((T-f).toFixed(3))?f:T,S=format("#,##0.00",this.RoundNumber(format("0.00000",S),4))}s=parseFloat(s.toFixed(2)),o.TransactionType!=n.TransactionType.SalesRefund&&o.TransactionType!=n.TransactionType.Return&&(this.collection.length>0?(this.collection.each(function(t){w+=t.get("SalesPriceRate")*t.get("QuantityOrdered"),p+=t.get("ExtPriceRate"),(t.get("Discount")>0||t.get("CouponDiscountAmount")>0)&&(g=1)}),w!=h&&1==g&&(y=w-h)):y=0),this.summaryModel.set({SubTotal:h,TotalTax:m,Payment:d,Balance:s,Qty:this.RetrieveSubtotal(),TaxDisplay:m,TotalDiscount:y}),o.Summary=this.summaryModel.attributes},IsReturn:function(){return o.TransactionType===n.TransactionType.SalesRefund||(o.TransactionType===n.TransactionType.SalesCredit||o.TransactionType===n.TransactionType.Return)},computeDiscount:function(t){var e=t.get("Discount"),i=t.previous("Discount"),a=t.get("CouponDiscountType"),s=(t.get("CouponDiscountAmount"),t.get("CouponDiscount"),t.get("CouponCode")),o=t.get("SalesPrice"),n=t.get("ExtPriceRate"),r=0;if(r=o*(e-i)/100,s)switch(a){case"Percent":r+=n*(e-i)/100}return r},preciseRound:function(t,e){null==e&&(e=2);var i=t.toString();return i.indexOf(".")==-1?i:i.substr(0,i.indexOf(".")+e+1)},RetrieveSubtotal:function(){var t="QuantityOrdered",e=0;return o.TransactionType===n.TransactionType.SalesRefund&&o.TransactionType===n.TransactionType.Return&&(t="Good"),this.collection.each(function(i,a){e+=i.get(t)<0?0:i.get(t)}),e},RoundNumber:function(t,e){var i=new s.BigDecimal(t);return i.setScale(e,s.MathContext.ROUND_HALF_UP)},ReloadModel:function(){var e="#itemDetailContainer";if(t(e).is(":visible")&&this.itemDetailView&&this.itemDetailView.model){var i=this.itemDetailView.model.attributes.ItemCode,a=this.itemDetailView.model.attributes.UnitMeasureCode,s=this.itemDetailView.model.attributes.LineNum,o=this;this.collection.each(function(t){t.get("ItemCode")===i&&t.get("UnitMeasureCode")===a&&t.get("LineNum")===s&&o.ShowItemDetails(t)})}},ShowItemDetails:function(e){var i="#itemDetailContainer";this.isItemDetailViewOpen&&(this.itemDetailView=null),this.itemDetailView?this.itemDetailView.Show(e,"Item"):this.itemDetailView=new u({el:t(i),model:e,collection:this.accessory,type:this.type}),this.CurrentItemDetailViewID=this.itemDetailView.cid,this.CurrentItemDetailModel=e,this.itemDetailView.SetCartInstance(this),this.isItemDetailViewOpen=!0},ShowFreeStock:function(t){this.itemDetailView.Show(t,"FreeStock")},ShowAccessory:function(t){this.itemDetailView.Show(t,"Accessory")},ShowSubstitute:function(t){this.itemDetailView.Show(t,"Substitute")},ShowSerialLot:function(t){this.trigger("ShowSerialLot",t)},RemoveItem:function(t){o.ManagerValidated=!1;var e=parseFloat(window.sessionStorage.getItem("MaxSaleDiscount"));window.sessionStorage.setItem("MaxSaleDiscount",e+t.get("Discount")),this.LastItemRemoved=t.attributes,this.RemoveKitItem(t),this.collection.remove(t),o.TransactionType!=n.TransactionType.SalesRefund&&this.UpdateLineNum(),o.HasChanges=!0,this.AddNetToInvoiceTotal(t,"delete"),this.trigger("ItemRemoved"),this.trigger("updateSerialLot",t.get("ItemCode")),this.isItemDetailViewOpen&&(this.itemDetailView.Close(),this.isItemDetailViewOpen=!1),this.RefreshCartTable()},RemoveKitItem:function(t){t.get("ItemType")==n.ItemType.Kit&&(window.sessionStorage.removeItem("kitItems-"+t.get("LineNum")),window.sessionStorage.removeItem("kitBundleItems-"+t.get("LineNum")))},UpdateLineNum:function(){this.collection.length+1;this.collection.each(function(t,e){t.set({LineNum:e+1})})},RemoveSerial:function(t){if(this.serialLot){var e=this.serialLot.filter(function(e){return r.IsNullOrWhiteSpace(e.get("UnitMeasureCode"))?e.get("ItemCode")===t.get("ItemCode")&&e.get("LineNum")===t.get("LineNum"):e.get("ItemCode")===t.get("ItemCode")&&e.get("UnitMeasureCode")===t.get("UnitMeasureCode")&&e.get("LineNum")===t.get("LineNum")});e&&this.serialLot.remove(e)}},ClearCart:function(){this.$("#cartListContainer").html(""),this.ResetSummaryModel(),this.myScroll&&(this.myScroll.destroy(),this.myScroll=null,this.$("#cartListContainer").removeAttr("style"))},ResetSummaryModel:function(){this.summaryModel.set({SubTotal:0,TotalTax:0,Payment:0,Balance:0,Qty:0,TaxDisplay:0,TotalDiscount:0})},ViewPayments:function(){this.trigger("viewPayments",this)},ViewSignature:function(){this.trigger("viewSignature",this)},ViewTaxList:function(){this.trigger("viewTaxOverrideList",this)},ReinitializeCart:function(){o.Preference.AllowSaleDiscount&&window.sessionStorage.setItem("MaxSaleDiscount",o.Preference.MaxSaleDiscount),this.ClearCart(),this.totalView.render(),this.ShowOutstanding(!1)},ShowOutstanding:function(e){e?(t(".itemRemaining").show(),t(".itemName").addClass("itemNameRefund"),t(".itemExtPrice").addClass("itemExtPriceRefund")):(t(".itemRemaining").hide(),t(".itemName").removeClass("itemNameRefund"),t(".itemExtPrice").removeClass("itemExtPriceRefund"))},FetchSerialLotCollection:function(t){this.serialLot=t,console.log(t.toJSON())},LoadOrderNotes:function(t){this.trigger("loadOrderNotes",t)},ShowNotes:function(t,e){this.trigger("showNotes",t,e,o.MaintenanceType.UPDATE)},UpdateSalesTaxAmountField:function(t,e){this.UpdateField("SalesTaxAmountRate",t,e)},UpdateExtPriceField:function(t,e){this.UpdateField("ExtPriceRate",t,e)},UpdateField:function(e,i,a){if(t("#itemDetailContainer").is(":visible")&&this.itemDetailView&&this.itemDetailView.model){var s=this,o=this.itemDetailView.model.attributes.ItemCode,n=this.itemDetailView.model.attributes.UnitMeasureCode,r=this.itemDetailView.model.attributes.LineNum;this.IsSameItem(this.itemDetailView.model,a)&&this.collection.each(function(t){t.get("ItemCode")===o&&t.get("UnitMeasureCode")===n&&t.get("LineNum")===r&&("ExtPriceRate"==e?s.itemDetailView.UpdateExtPriceField(i):"SalesTaxAmountRate"==e&&s.itemDetailView.UpdateSalesTaxAmountField(i))})}},IsSameItem:function(t,e){var i=t.attributes,a=e.attributes;return i.ItemCode===a.ItemCode&&i.UnitMeasureCode===a.UnitMeasureCode&&i.LineNum===a.LineNum},EditKit:function(t){this.trigger("editKitItem",t,!0)}});return S});