define(["jquery","mobile","underscore","backbone","model/base","collection/base","shared/global","shared/service","shared/shared","shared/method","shared/enum","view/20.1.0/pos/bundle/bundle","view/20.1.0/pos/bundle/preview","text!template/20.1.0/pos/bundle/configurator.tpl.html","js/libs/iscroll.js"],function(e,t,i,r,n,l,o,s,a,u,c,d,h,m){var f=r.View.extend({template:i.template(m),events:{"click #done":"done","click #cancel":"cancel"},cancel:function(e){e.preventDefault(),this.close()},finish:function(e){e.preventDefault();var t=this.bundleDetail.filter(function(e){return e.get("ItemType")===c.ItemType.Stock});this.result.add(t),this.trigger("getitems",this.result)},done:function(e){e.preventDefault();var t=new n,i=new n,r=o.TransactionType,l=this.$el.find("#qty").val(),u=this;if(!this.result)return navigator.notification.alert("Please select attributes for the matrix item(s) in the list",null,"Action not Allowed","OK"),void this.close();var d=this.bundleDetail.filter(function(e){return e.get("ItemType")===c.ItemType.Stock}),h=this.result.add(d);o.TransactionType==c.TransactionType.UpdateInvoice&&(r=c.TransactionType.ResumeSale);var m=window.sessionStorage.getItem("selected_taxcode");i.set({ItemCode:null,CustomerCode:o.CustomerCode,WarehouseCode:o.LocationCode,UnitMeasureCode:"EACH",IsTaxByLocation:o.Preference.TaxByLocation,CouponId:null,ShipToCode:o.ShipTo.ShipToCode,WebsiteCode:a.GetWebsiteCode(),DiscountPercent:o.ShipTo.DiscountPercent,DiscountType:o.ShipTo.DiscountType,LineNum:null,TaxCode:m?m:o.ShipTo.TaxCode,TransactionType:r,QuantityOrdered:parseInt(l),IsUsePOSShippingMethod:o.Preference.IsUsePOSShippingMethod,POSShippingMethod:o.Preference.POSShippingMethod}),t.url=o.ServiceUrl+s.SOP+"salebundlegrouptax/",t.set("BundleCodes",h.toJSON()),t.set("SaleItemGroup",i),t.save(null,{success:function(e,t,i){return t.ErrorMessage?void navigator.notification.alert(t.ErrorMessage,null,"Error","OK"):(console.log("success"),u.trigger("getitems",t.SaleItems),void u.close())},error:function(e,t,i){navigator.notification.alert("There seem to be a problem with computing tax for bundle item(s)",null,"Error","OK")}})},updateQty:function(e){13===e.keyCode&&(this.$el.find("ul").empty(),this.bundleDetail.reset(this.items),this.updateBundleQty(parseInt(e.currentTarget.value)),this.renderAllBundleDetail())},initialize:function(){this.$el.html(this.template({BundleCode:this.model.get("ItemCode"),BundleDescription:this.model.get("ItemDescription"),Total:this.model.get("Price"),Currency:o.CurrencySymbol})),this.getBundleDetail(),this.bundlePreview=this.$el.find("#bundle-configurator-preview"),this.result=new l},render:function(){return e("#main-transaction-blockoverlay").show(),this},close:function(){e("#main-transaction-blockoverlay").hide(),window.sessionStorage.removeItem("matrix_attributes"),this.unbind(),this.remove()},loadScroll:function(){o.isBrowserMode?a.UseBrowserScroll("#bundle-configurator-list"):this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll("bundle-configurator-list")},getBundleDetail:function(){var e=new n,t=this.model.get("ItemCode"),i=o.CurrentCustomer.DefaultPrice?"&defaultPrice="+o.CurrentCustomer.DefaultPrice:"&defaultPrice="+o.Preference.CustomerDefaultPrice,r=o.Preference.DefaultLocation?"&warehouseCode="+o.Preference.DefaultLocation:"",a=o.Preference.WebsiteCode?"&websiteCode="+o.Preference.WebSiteCode:"",c=this;e.url=o.ServiceUrl+s.PRODUCT+u.GETBUNDLEDETAIL+"?bundleCode="+t+i+r+a,e.fetch({success:function(e,t,i){c.matrixItems=new l(t.MatrixItems),c.bundleDetail=new l(t.Items),c.items=t.Items,c.bundleDetail.on("resetSelected",function(){c.$("ul").find("li").removeClass("selected")}),c.bundleDetail.on("selected_matrix",c.getMatrixGroupAttributes,c),c.bundleDetail.on("selected_stock",c.renderStockAttributes,c),c.bundleDetail.on("updateAttribDisplay",c.updateAttribDisplay,c),c.renderAllBundleDetail()},error:function(e,t,i){navigator.notification.alert("Failed to retrieve Bundle Detail",null,"Error","OK")}})},getMatrixGroupAttributes:function(e){var t=new n,i="?itemCode="+e.get("ItemCode"),r=e.get("ItemType"),a="&warehouseCode="+o.Preference.DefaultLocation,c=this;t.url=o.ServiceUrl+s.PRODUCT+u.GETMATRIXGROUPATTRIBUTES+i+a,t.fetch({success:function(t,n,o){c.matrixAttributes=new l(n.MatrixAttributes),c.renderMatrixAttributes(r,i,e)},error:function(e,t,i){navigator.notification.alert("Failed to retrieve Matrix group attributes",null,"Error","OK")}})},renderAllBundleDetail:function(){this.populateItemQty(),this.totalStockItems(),this.bundleDetail.each(this.renderOneBundleDetail,this),this.$el.find("ul").listview().listview("refresh"),this.loadScroll(),this.bundleDetail.at(0).get("ItemType")===c.ItemType.Stock?this.renderStockAttributes(this.bundleDetail.at(0)):this.getMatrixGroupAttributes(this.bundleDetail.at(0)),this.$el.find("ul").find("li:first-child").addClass("selected")},computeStockItems:function(){var e=this.bundleDetail.filter(function(e){return e.get("ItemType")===c.ItemType.Stock});return price=i.reduce(e,function(e,t){var i=o.CurrentCustomer.DefaultPrice?o.CurrentCustomer.DefaultPrice:o.Preference.CustomerDefaultPrice;return"Retail"===i&&t.get("ItemType")===c.ItemType.Stock?t.get("RetailPrice")+e:t.get("WholeSalePrice")+e},0)},totalStockItems:function(){this.$el.find("#total > span").text(this.computeTotal(this.computeStockItems()?price:0))},renderOneBundleDetail:function(e){if(e.get("ItemType")!=c.ItemType.MatrixItem){var t=new d({model:e});this.$el.find("ul").append(t.render().el)}},renderMatrixAttributes:function(e,t,i){var r=new h({collection:this.matrixAttributes,matrixItems:this.matrixItems,model:i,type:e,code:t});this.bundlePreview.html(r.render().el),r.loadScroll()},renderStockAttributes:function(e){var t=new h({model:e,type:e.get("ItemType"),code:e.get("ItemCode")});this.bundlePreview.html(t.render().el),t.loadScroll()},computeTotal:function(e){var t=this.$el.find("#qty").val(),i=0;return i=parseFloat(e)*parseInt(t),i.toFixed(2)},updateAttribDisplay:function(e){if(e){var t=this.$el.find("#"+e.ID),i=e.model,r=this.result.find(function(e){return e.get("ItemID")==i.get("ItemID")});r&&this.result.remove(r),this.result.add(i);var n=0!=this.result.length?this.result.reduce(function(e,t){return e+t.get("Price")},0):e.price(!1),l=this.computeStockItems()+n;t.find(".item-attrib").text(e.value()),t.find(".item-price").find("h5").html(e.price(!0)),this.$el.find("#total").find("span").text(this.computeTotal(l))}},populateItemQty:function(){var e=[],t=this.bundleDetail.filter(function(e){return e.get("ItemType")!=c.ItemType.Stock});t&&i.each(t,function(t){for(var r,n=1;n<t.get("Quantity");n++)r=i.clone(t),e.push(r.attributes)}.bind(this)),this.bundleDetail.add(e),this.bundleDetail.each(function(e,t){e.set("DetailLineNum",t+1)}),this.bundleDetail.comparator=function(e){return e.get("DetailLineNum")},this.bundleDetail.sort()},updateBundleQty:function(e){var t=[];this.bundleDetail.comparator=function(e){return e.get("ItemType")},this.bundleDetail.sort(),this.bundleDetail.each(function(r){for(var n=1;n<e;n++){var l=i.clone(r);t.push(l.attributes)}}.bind(this)),this.bundleDetail.add(t)}});return f});