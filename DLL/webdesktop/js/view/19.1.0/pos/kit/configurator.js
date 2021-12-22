define(["jquery","mobile","underscore","backbone","model/base","collection/base","shared/global","shared/service","shared/shared","shared/method","shared/enum","view/19.1.0/pos/kit/kit","view/19.1.0/pos/kit/preview","text!template/19.1.0/pos/kit/configurator.tpl.html","js/libs/iscroll.js"],function(e,t,i,o,r,n,s,l,a,c,u,d,h,p){return o.View.extend({template:i.template(p),events:{"click #done":"done","click #cancel":"cancel"},cancel:function(e){e.preventDefault(),this.close()},finish:function(e){e.preventDefault();var t=this.kitOption.filter(function(e){return e.get("ItemType")===u.ItemType.Stock});this.result.add(t),this.trigger("getItems",this.result)},initialize:function(){this.$el.html(this.template({KitItemCode:this.model.get("ItemCode"),KitDescription:this.model.get("ItemDescription"),Total:this.model.get("Price"),Currency:s.CurrencySymbol,Quantity:this.model.get("QuantityOrdered")?this.model.get("QuantityOrdered"):1})),this.coupon=this.options.coupon,this.getKitOptionGroup(),this.kitPreview=this.$el.find("#kit-configurator-preview"),this.result=new n},render:function(){return e("#main-transaction-blockoverlay").show(),this},getKitOptionGroup:function(){var t=new r,o=this.model.get("ItemCode"),a=JSON.parse(window.sessionStorage.getItem("kitItems-"+this.options.lineNum)),u=!!a,d=s.Preference.DefaultLocation?"&warehouseCode="+s.Preference.DefaultLocation:"",h=s.CurrentCustomer.DefaultPrice?"&defaultPrice="+s.CurrentCustomer.DefaultPrice:"&defaultPrice="+s.Preference.CustomerDefaultPrice,p=s.Preference.WebSiteCode?"&websiteCode="+s.Preference.WebSiteCode:"";t.url=s.ServiceUrl+l.PRODUCT+c.GETITEMKITDETAILS+"?itemKitCode="+o+h+d+p,t.fetch({success:function(t,o,r){this.kitOption=new n(o.KitOptionDetail),this.kitDetails=new n(o.KitDetails),this.kitDetails.each(function(e){if(u){var t=i.find(a,function(t){return t.ItemCode===e.get("ItemCode")&&t.GroupCode===e.get("GroupCode")});t?e.set("IsDefault",t.IsDefault):e.set("IsDefault",!1)}e.get("IsDefault")?e.set("IsSelected",!0):e.set("IsSelected",!1)}),this.kitOption.on("resetSelected",function(){var t=this.$("ul").children();i.each(t,function(t){e(t).removeClass("selected")})}.bind(this)),this.kitOption.on("selected_option",this.getKitItemDetails,this),this.kitDetails.on("selected_item",this.updateOptionGroupPrice,this),this.renderAllKitOptionGroup(!0)}.bind(this),error:function(e,t,i){navigator.notification.alert("Failed to retrieve Kit Detail",null,"Error","OK")}.bind(this)})},updateOptionGroupPrice:function(e){var t=this.kitOption.find(function(t){return t.get("GroupCode")==e.at(0).get("GroupCode")});this.kitOption.each(function(t){var i=e.reduce(function(e,t){var i=s.CurrentCustomer.DefaultPrice?s.CurrentCustomer.DefaultPrice:s.Preference.CustomerDefaultPrice;return"Retail"===i?e+t.get("RetailPrice"):e+t.get("WholeSalePrice")},0);e.length>0&&e.at(0).get("GroupCode")==t.get("GroupCode")&&t.set("Price",i)}.bind(this)),e.length>0&&(this.$("#kit-configurator-list").find("ul").empty(),this.renderAllKitOptionGroup(!1),this.$("#kit-configurator-list").find("ul").find("#"+t.cid).addClass("selected"))},renderAllKitOptionGroup:function(e){this.kitOption.each(this.renderOneKitOption,this),this.$("#kit-configurator-list").find("ul").listview().listview("refresh"),e&&this.getKitItemDetails(this.kitOption.at(0)),e&&this.$("#kit-configurator-list").find("ul").find("li:first-child").addClass("selected"),this.loadScrollOptions()},render:function(){return e("#main-transaction-blockoverlay").show(),this},renderOneKitOption:function(e,t){var i=this.kitDetails.filter(function(t){return t.get("GroupCode")==e.get("GroupCode")&&1==t.get("IsSelected")}),o=new d({model:e,collection:this.kitDetails});this.$("#kit-configurator-list").find("ul").append(o.render().el),o.setSelectedPrice(new n(i))},getKitItemDetails:function(e){var t=(new r,e.get("GroupCode")),i=(e.get("ItemKitCode"),new n(this.kitDetails.filter(function(e){return e.get("GroupCode")===t})));this.renderKitItemDetails(i,t)},renderKitItemDetails:function(e,t){var i=this.kitOption.find(function(e){return e.get("GroupCode")===t}),o=this;this.groupType=i.get("GroupType"),this.itemKitcode=i.get("ItemKitCode"),this.$("#kit-configurator-preview").find("ul").empty(),e.each(function(e){o.renderOneKitDetail(e,o.groupType,t)}),this.$("#kit-configurator-preview").find("ul").listview().listview("refresh"),this.loadScrollDetails()},renderOneKitDetail:function(e,t,i){var o=new h({model:e,groupType:t,collection:this.kitDetails,groupCode:i,group:this.kitOption});this.$("#kit-configurator-preview").find("ul").append(o.render().el),o.setSelected(e.cid)},close:function(){e("#main-transaction-blockoverlay").hide(),this.unbind(),this.remove()},done:function(e){e.preventDefault();var t=new r,o=new r,n=s.TransactionType,c=this;this.kitDetails.each(function(e){e.set("OriginalQuantity",e.get("Quantity"))});var d=this.kitDetails.filter(function(e){return e.get("IsSelected")===!0}),h=i.filter(d,function(e){return e.get("GroupType")==c.groupType});if(0==h.length)return void navigator.notification.alert("You are required to select at least one (1) item for this Require group",null,"Action not Allowed","OK");s.TransactionType==u.TransactionType.UpdateInvoice&&(n=u.TransactionType.ResumeSale);var p=window.sessionStorage.getItem("selected_taxcode"),f=this.coupon?this.coupon.get("CouponID"):null,m=this.$el.find("#qty").val();o.set({ItemCode:this.itemKitcode,CustomerCode:s.CustomerCode,WarehouseCode:s.LocationCode,UnitMeasureCode:"EACH",IsTaxByLocation:s.Preference.TaxByLocation,CouponId:f,ShipToCode:s.ShipTo.ShipToCode,WebsiteCode:a.GetWebsiteCode(),DiscountPercent:s.ShipTo.DiscountPercent,DiscountType:s.ShipTo.DiscountType,LineNum:null,TaxCode:p?p:s.ShipTo.TaxCode,TransactionType:n,QuantityOrdered:parseInt(m)}),t.url=s.ServiceUrl+l.SOP+"salekititemtax/",t.set("KitDetails",d),t.set("SaleItemGroup",o),t.save(null,{success:function(e,t,i){return t.ErrorMessage?void navigator.notification.alert(t.ErrorMessage,null,"Error","OK"):(c.options.isEditMode?c.trigger("editItems",t):c.trigger("getItems",t),void c.close())},error:function(e,t,i){navigator.notification.alert("There seem to be a problem computing tax for kit item(s)",null,"Error","OK")}})},loadScrollDetails:function(){var e="kit-configurator-preview",t={vScrollbar:!1,vScroll:!0,snap:!1,momentum:!0,hScrollbar:!0,onBeforeScrollStart:function(e){for(var t=e.target;1!=t.nodeType;)t=t.parentNode;"INPUT"!=t.tagName&&e.preventDefault()}};s.isBrowserMode?a.UseBrowserScroll("#"+e):this.myScrollDetails?this.myScrollDetails.refresh():this.myScrollDetails=new iScroll(e,t)},loadScrollOptions:function(){var e="kit-configurator-list",t={vScrollbar:!1,vScroll:!0,snap:!1,momentum:!0,hScrollbar:!0};s.isBrowserMode?a.UseBrowserScroll("#"+e):this.myScrollOptions?this.myScrollOptions.refresh():this.myScrollOptions=new iScroll(e,t)}})});