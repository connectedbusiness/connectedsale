define(["jquery","mobile","underscore","backbone","shared/global","shared/enum","shared/service","shared/method","shared/shared","model/item","model/lookupcriteria","model/base","collection/base","collection/customers","collection/shipto","view/16.0.0/pos/item/header-info/company/company","view/16.0.0/pos/item/header-info/customer/customers","view/16.0.0/pos/item/header-info/customer/customerdetail","view/16.0.0/pos/item/header-info/customer/customerform","view/16.0.0/pos/item/header-info/shipto/shiptos","view/16.0.0/pos/item/header-info/shipto/shiptodetail","view/16.0.0/pos/item/header-info/shipto/shiptoform","view/16.0.0/pos/notes/customernotes/notes","view/16.0.0/pos/notes/customernotes/notedetail","view/16.0.0/pos/salesrep/salesrep","text!template/16.0.0/pos/item/header-info/customerinfo.tpl.html","text!template/16.0.0/pos/item/header-info/customerlist.tpl.html","text!template/16.0.0/pos/item/header-info/shiptolist.tpl.html","text!template/16.0.0/pos/notes/customernotes/notelist.tpl.html","view/spinner","js/libs/format.min.js"],function(e,t,o,i,r,s,n,a,u,c,h,l,p,m,d,C,T,S,f,g,y,w,v,b,D,P,L,N,I,O){var A=!1,k=i.View.extend({_template:o.template(P),customer:"",shipTo:"",customerCode:"",criteria:"",events:{"tap #customer-lookup":"buttonShowOnTap","tap #changeShipTo-btn":"buttonShowOnTap","tap #done-shipto":"buttonHideOnTap","tap #done-customer":"buttonHideOnTap","tap #done-noteList":"buttonHideOnTap","tap #back-customer":"buttonBackOnTap","tap #back-shipto":"buttonBackOnTap","tap #back-customerDetail":"buttonBackOnTap","tap #select-customer":"buttonCustomerSelectOnTap","tap #select-shipto":"buttonShipToSelectOnTap","tap #add-customer-btn":"buttonShowFormOnTap","tap #addShipTo-btn":"buttonShowFormOnTap","tap #add-noteList-btn":"buttonShowFormOnTap","keyup #customer-search":"inputKeyPressSearch","keyup #shipto-search":"inputKeyPressSearch","keyup #noteList-search":"inputKeyPressSearch","blur #customer-search":"HideClearBtn","blur #shipto-search":"HideClearBtn","tap #customer-searchClearBtn":"ClearText","tap #shipto-searchClearBtn":"ClearText","tap #customer-edit":"buttonEditCustomer","tap #customer-note":"buttonShowCustomerNote","tap #back-noteList":"ReloadCustomer"},buttonShowCustomerNote:function(e){e.preventDefault(),this.ShowCustomerNoteList()},buttonEditCustomer:function(e){e.preventDefault(),r.EditCustomerLoaded=!1,this.LoadEditCustomerForm()},buttonHideOnTap:function(e){e.preventDefault(),this.HideListContainer()},buttonShowOnTap:function(e){switch(e.preventDefault(),e.currentTarget.id){case"changeCustomer-btn":this.AllowChangeCustomer()&&this.ShowCustomerList();break;case"changeShipTo-btn":this.AllowToChangeShipto()&&this.ShowShipToList()}},buttonShowFormOnTap:function(t){switch(t.preventDefault(),t.currentTarget.id){case"add-customer-btn":this.AllowChangeCustomer()&&(r.Preference.AllowAddCustomer===!0?(this.HideListContainer(),this.ShowCustomerForm()):navigator.notification.alert("Adding a new customer is not allowed.",null,"Action Not Allowed","OK"));break;case"addShipTo-btn":this.AllowToChangeShipto()&&this.ShowShipToForm();break;case"add-noteList-btn":e("#noteList-search").blur(),this.ShowOrderNotesForm()}},buttonBackOnTap:function(t){switch(t.preventDefault(),e("#main-transaction-blockoverlay").removeClass("z2990"),t.target.id){case"back-customer":this.BackCustomer();break;case"back-shipto":this.BackShipTo();break;case"back-customerDetail":this.BackCustomer()}},buttonCustomerSelectOnTap:function(e){e.preventDefault(),this.SetSelectedCustomer(this.customer)},buttonShipToSelectOnTap:function(e){e.preventDefault(),this.SetSelectedShipTo(this.shipTo)},inputKeyPressSearch:function(t){if(13===t.keyCode)switch(t.target.id){case"customer-search":this.criteria=e("#customer-search").val(),this.LoadCustomer();break;case"shipto-search":this.criteria=e("#shipto-search").val(),this.LoadShipTo();break;case"noteList-search":this.criteria=e("#noteList-search").val(),this.LoadCustomerNote()}else this.ShowClearBtn(t)},changeCssForSelected:function(t){e("#customer-footer").removeClass("customer-selected"),e("#"+t).addClass("customer-selected")},initialize:function(){this.cart=this.options.cart,this.preference=this.options.preference,this.item=this.options.item,this.salesOrder=this.options.SO,this._info={CustomerName:u.TrimCustomerName(),ShipToName:u.TrimDefaultShipTo()},e("#headerInfoContainer").prepend(this._template(this._info)),this.SetDefaultCustomerShiptoAddress();var t=new l;t.set({PaymentTermCode:r.CurrentCustomer.PaymentTermCode,CreditLimit:this.preference.at(0).get("CreditLimit"),LoyaltyPoints:this.preference.at(0).get("LoyaltyPoints"),AvailableCredit:parseFloat(this.preference.at(0).get("AvailableCredit"))}),this.ShowCustomerDetails(t),this.HideCustomerPopover()},ShowCustomerDetails:function(t){var o=t.get("PaymentTermCode"),i=t.get("CreditLimit"),s=t.get("LoyaltyPoints"),n=t.get("AvailableCredit");e("#label-paymentTerm").html("Payment Term :"+o),e("#label-creditLimit").html("Credit Limit : "+r.CurrencySymbol+" "+format("#,##0.00",parseFloat(i))),e("#label-loyaltyPoints").html("Loyalty Points : "+s),e("#label-avalableCredit").html("Available Credit : "+r.CurrencySymbol+" "+format("#,##0.00",n))},GetCustomerHeaderInfo:function(){u.IsNullOrWhiteSpace(this.tempModel)?this.tempModel=new l:(this.tempModel.unbind(),this.tempModel=new l);var e,t,o=this;e=u.IsNullOrWhiteSpace(r.CurrentCustomer.CustomerCode)?r.CustomerCode:r.CurrentCustomer.CustomerCode,t=u.IsNullOrWhiteSpace(r.ShipTo.ShipToCode)?r.InitialShipToCode:r.ShipTo.ShipToCode,this.tempModel.set({CustomerCode:e,ShipToCode:t}),this.tempModel.url=r.ServiceUrl+n.CUSTOMER+a.LOADCUSTOMERHEADERINFO,this.tempModel.save(null,{success:function(e,t){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),o.SetCustomerLoyaltyHeaderInfo(t)}}),this.SetLoadedTransactionShiptoDetails()},SetLoadedTransactionShiptoDetails:function(){if(!u.IsNullOrWhiteSpace(r.IsLoadByTransaction)){var t="(No Address)",o="",o=t,i=r.CurrentCustomer.ShipToCity,s=r.CurrentCustomer.ShipToState,n=r.CurrentCustomer.ShipToPostalCode;null==r.Transaction.ShipToAddress&&null==i&&null==s&&null==n||(u.IsNullOrWhiteSpace(i)&&(i=""),u.IsNullOrWhiteSpace(s)&&(s=""),u.IsNullOrWhiteSpace(n)&&(n=""),t="",u.IsNullOrWhiteSpace(r.CurrentCustomer.ShipToAddress)||(t=r.CurrentCustomer.ShipToAddress),u.IsNullOrWhiteSpace(t)&&(t=""),o=t+" "+i+", "+s+" "+n,t=o),e("#label-shipto").html(this.TrimShipToName(r.CurrentCustomer.ShipToName)+","),e("#label-shipto").append("<br/>"+u.Escapedhtml(t))}},SetDefaultCustomerShiptoAddress:function(){console.log("SET Default");var t="(No Address)",o="",o=t,i=r.DefaultShipToCity,s=r.DefaultShipToState,n=r.DefaultShipToPostalCode;null==r.DefaultShipToAddress&&null==i&&null==s&&null==n||(u.IsNullOrWhiteSpace(i)&&(i=""),u.IsNullOrWhiteSpace(s)&&(s=""),u.IsNullOrWhiteSpace(n)&&(n=""),t="",u.IsNullOrWhiteSpace(r.DefaultShipToAddress)||(t=r.DefaultShipToAddress),u.IsNullOrWhiteSpace(t)&&(t=""),o=t+" "+i+", "+s+" "+n,t=o),console.log("ShiptoAddress : "+t),e("#label-shipto").html(u.TrimDefaultShipTo()),e("#label-shipto").append("<br/>"+u.Escapedhtml(t))},SetCustomerLoyaltyHeaderInfo:function(t){var o=new l;o.set(t);var i=o.get("LoyaltyPoints");i=Math.round(i).toLocaleString("en"),o.set({LoyaltyPoints:i}),this.ShowCustomerDetails(o),e("#customerInfoContainer").show();var r=e("#customer-selector").offset().left,s=e("#customer-selector").outerWidth(!0),n=e("#customerInfoContainer").find(".popover-content").width(),a=r+s/2-n/2;e("#customerInfoContainer").offset({left:a}),e("#customerInfoContainer").offset({left:a})},TrimShipToName:function(e){var t=u.Escapedhtml(e);return r.DefaultShipTo.length>=65?t=u.Escapedhtml(e.substring(0,71)+"..."):t},ShowCustomerPopover:function(){this.GetCustomerHeaderInfo()},HideCustomerPopover:function(){e("#customerInfoContainer").hide()},InitializeCompany:function(){this.companyView||(this.companyView=new C({el:e(".transactionSummary"),model:this.preference.at(0)}))},ShowShipToList:function(){e("#shipto").remove(),this.criteria="",this.CheckType(this.cart,"ShipToList")},ShowShipToForm:function(){this.CheckType(this.cart,"ShipToForm")},ShowCustomerList:function(){this.AllowChangeCustomer()&&(e("#customer").remove(),this.criteria="",this.CheckType(this.cart,"CustomerList"))},ShowSalesRepList:function(){e("#salesrep").remove(),this.CheckType(this.cart,"SalesRepList")},ShowCustomerForm:function(){this.CheckType(this.cart,"CustomerForm")},ShowCustomerNoteList:function(){this.criteria="",this.CheckType(this.cart,"CustomerNoteList")},BackCustomer:function(){e("#customer").replaceWith(o.template(L)),this.HideButtons("CustomerList"),this.LoadCustomer()},BackShipTo:function(){e("#shipto").replaceWith(o.template(N)),this.HideButtons("ShipToList"),this.LoadShipTo()},SetSelectedCustomer:function(t,i){if(r.ShipTo.ShipToCode=t.get("DefaultShipToCode"),r.ShipTo.ShipToName=t.get("ShipToName"),r.ShipTo.ShipToCountry=t.get("ShipToCountry"),r.ShipTo.ShipToCounty=t.get("ShipToCounty"),r.ShipTo.ShipToAddress=t.get("ShipToAddress"),r.ShipTo.ShipToCity=t.get("ShipToCity"),r.ShipTo.ShipToPhone=t.get("ShipToPhone"),r.ShipTo.ShipToPhoneExtension=t.get("ShipToPhoneExtension"),r.ShipTo.ShipToPostalCode=t.get("ShipToPostalCode"),r.ShipTo.ShipToState=t.get("ShipToState"),r.ShipTo.PaymentTermGroup=t.get("PaymentTermGroup"),r.ShipTo.PaymentTermCode=t.get("PaymentTermCode"),r.ShipTo.DiscountPercent=t.get("DiscountPercent"),r.ShipTo.DiscountType=t.get("DiscountType"),r.ShipTo.DiscountableDays=t.get("DiscountableDays"),r.ShipTo.DueType=t.get("DueType"),r.ShipTo.TaxCode=t.get("TaxCode"),!r.Preference.TaxByLocation){var s=window.sessionStorage.getItem("selected_taxcode");s&&window.sessionStorage.removeItem("selected_taxcode"),window.sessionStorage.setItem("selected_taxcode",r.ShipTo.TaxCode)}A=r.DefaultPrice!=t.get("DefaultPrice");var n="(No Address)",a=n;if(r.CurrentCustomerSourceCode=t.get("SourceCode"),r.CurrentCustomer=t.toJSON(),r.CustomerName=t.get("CustomerName"),r.CustomerEmail=t.get("Email"),r.DefaultContactEmail=t.get("DefaultContactEmail"),r.DefaultPrice=t.get("DefaultPrice"),r.IsTrackLoyaltyPoints=t.get("TrackLoyaltyPoints"),r.IsOverrideSalesRep){var c=o.find(r.SalesRepUserAccount,function(e){return e.UserName==r.UserInfo.UserCode});null!=c?(r.SalesRepGroupCode=c.SalesRepGroupCode,r.SalesRepGroupName=c.SalesRepGroupName,r.CommissionPercent=null==c.SalesRepGroupName?0:100):(r.SalesRepGroupCode="",r.SalesRepGroupName="",r.CommissionPercent=0)}else r.SalesRepGroupCode=t.get("SalesRepGroupCode"),r.SalesRepGroupName=t.get("SalesRepGroupName"),r.CommissionPercent=100;r.SalesRepList="",r.CurrentCustomerEmailChanged=!0;var a=n,h=r.CurrentCustomer.ShipToCity,p=r.CurrentCustomer.ShipToState,m=r.CurrentCustomer.ShipToPostalCode;null==r.CurrentCustomer.ShipToAddress&&null==h&&null==p&&null==m||(u.IsNullOrWhiteSpace(h)&&(h=""),u.IsNullOrWhiteSpace(p)&&(p=""),u.IsNullOrWhiteSpace(m)&&(m=""),n=r.CurrentCustomer.ShipToAddress,u.IsNullOrWhiteSpace(n)&&(n=""),a=n+" "+h+", "+p+" "+m,n=a);var d=r.CurrentCustomer.ShipToName;r.DefaultShipTo=d+",",e("#label-shipto").html(u.TrimDefaultShipTo()),e("#label-shipto").append("<br/>"+u.Escapedhtml(n)),console.log("Set SElected Customer"+n);var C=new l;C.set({PaymentTermCode:r.CurrentCustomer.PaymentTermCode,CreditLimit:t.get("CreditLimit"),LoyaltyPoints:t.get("OutstandingPoints"),AvailableCredit:parseFloat(t.get("AvailableCredit"))}),this.ShowCustomerDetails(C),e("#lbl-customerName").html(u.TrimCustomerName()),e("#lbl-salesrepName").html(u.TrimSalesRepName()),e("#splitrateName").html(u.TrimCommissionPercent()),r.CustomerCode===t.get("CustomerCode")?(this.trigger("customerchanged",this),this.trigger("shiptochanged",this),i&&r.Preference.CustomerCode===t.get("CustomerCode")?(r.Preference.CustomerName!=t.get("CustomerName")&&(r.Preference.CustomerName=t.get("CustomerName")),r.Preference.CustomerEmail!=t.get("Email")&&(r.Preference.CustomerEmail=t.get("Email"))):r.CurrentCustomerEmailChanged=!1,r.OnRechargeProcess&&this.trigger("proceedToLookupItems")):(r.CustomerCode=t.get("CustomerCode"),this.trigger("customerchanged",this),this.RecalculatePrice()),this.HideListContainer()},PricingHasChanged:function(){return A},SetAsDefaultShipto:function(e){var t=e.attributes;r.DefaultShipTo=t.ShipToName+",",r.DefaultShipToAddress=t.Address,r.ShipTo=t,r.ShipToDiscountPercent=t.DiscountPercent,r.ShipToDiscountType=t.DiscountType,r.ShipToDiscountableDays=t.DiscountableDays,r.Preference.CustomerCode===r.CustomerCode&&(r.Preferences.Preference.DefaultShipTo=t,r.Preferences.Preference.PaymentTermCode=t.PaymentTermCode,r.Preference.DefaultShipTo=t,r.Preference.PaymentTermCode=t.PaymentTermCode,r.ShipToName=t.ShipToName,r.ShipToAddress=t.Address,r.InitialShipToCode=t.ShipToCode,r.InitialDiscountPercent=t.DiscountPercent,r.DefaultShipTo=t.ShipToName+",",u.IsNullOrWhiteSpace(t.Address)||(r.DefaultShipToAddress=t.Address)),this.trigger("shiptochanged",this)},SetSelectedShipTo:function(t){if(this.AllowToChangeShipto()){1==t.get("IsDefaultShipTo")&&this.SetAsDefaultShipto(t);var o="(No Address)";if(r.CurrentCustomer.ShipToCode=t.get("ShipToCode"),r.CurrentCustomer.ShipToName=t.get("ShipToName"),r.CurrentCustomer.ShipToCountry=t.get("Country"),r.CurrentCustomer.ShipToCounty=t.get("County"),r.CurrentCustomer.ShipToAddress=t.get("Address"),r.CurrentCustomer.ShipToCity=t.get("City"),r.CurrentCustomer.ShipToPhone=t.get("Telephone"),r.CurrentCustomer.ShipToPhoneExtension=t.get("TelephoneExtension"),r.CurrentCustomer.ShipToPostalCode=t.get("PostalCode"),r.CurrentCustomer.ShipToState=t.get("State"),r.CurrentCustomer.PaymentTermCode=t.get("PaymentTermCode"),r.CurrentCustomer.DiscountPercent=t.get("DiscountPercent"),r.CurrentCustomer.DiscountType=t.get("DiscountType"),r.CurrentCustomer.DiscountableDays=t.get("DiscountableDays"),r.CurrentCustomer.DueType=t.get("DueType"),r.ShipTo.PaymentTermGroup=t.get("PaymentTermGroup"),r.ShipTo.PaymentTermCode=t.get("PaymentTermCode"),r.ShipTo.ShipToCode=t.get("ShipToCode"),r.ShipTo.DiscountPercent=t.get("DiscountPercent"),r.ShipTo.DiscountType=t.get("DiscountType"),r.ShipTo.DiscountableDays=t.get("DiscountableDays"),r.ShipTo.DueType=t.get("DueType"),r.ShipTo.TaxCode=t.get("TaxCode"),!r.Preference.TaxByLocation){var i=window.sessionStorage.getItem("selected_taxcode");i&&window.sessionStorage.removeItem("selected_taxcode"),window.sessionStorage.setItem("selected_taxcode",r.ShipTo.TaxCode)}var s=o,n=r.CurrentCustomer.ShipToCity,a=r.CurrentCustomer.ShipToState,c=r.CurrentCustomer.ShipToPostalCode;null==r.CurrentCustomer.ShipToAddress&&null==n&&null==a&&null==c||(u.IsNullOrWhiteSpace(n)&&(n=""),u.IsNullOrWhiteSpace(a)&&(a=""),u.IsNullOrWhiteSpace(c)&&(c=""),o=r.CurrentCustomer.ShipToAddress,u.IsNullOrWhiteSpace(o)&&(o=""),s=o+" "+n+", "+a+" "+c,console.log("County : "+r.CurrentCustomer.ShipToCounty),o=s);var h=r.CurrentCustomer.ShipToName;r.CurrentShipToUpdated=!0,r.DefaultShipTo=h+",",e("#label-shipto").html(u.TrimDefaultShipTo()),e("#label-shipto").append("<br/>"+u.Escapedhtml(o)),e("#label-paymentTerm").html("Payment Term :"+r.CurrentCustomer.PaymentTermCode),console.log("Set SElected Shipto"+o),this.trigger("shiptochanged",this),this.HideListContainer()}},AllowToChangeShipto:function(){var e;switch(r.TransactionType){case s.TransactionType.SalesPayment:break;case s.TransactionType.SalesRefund:break;case s.TransactionType.Recharge:break;case s.TransactionType.ConvertOrder:return e="You cannot change the ship-to name because this invoice came from sales order. You may void this invoice to change the ship-to on the sales order.",navigator.notification.alert(e,null,"Action Not Allowed","OK",!0),!1;default:return!0}return e||(e="Your action is not allowed for '"+r.TransactionType+"'."),navigator.notification.alert(e,null,"Action Not Allowed","OK"),!1},InitializeItemModel:function(){this.itemModel=new c,this.itemModel.url=r.ServiceUrl+n.SOP+a.GETCUSTOMERITEMSPRICES},RecalculatePrice:function(){this.InitializeItemModel();var e="";r.Coupon&&!r.CurrentCustomerChanged&&(e=r.Coupon.get("CouponID")),this.cart.length>0||!this.cart?this.itemModel.set({CustomerCode:r.CustomerCode,CategoryCode:r.Category,WarehouseCode:r.LocationCode,TaxByLocation:r.Preference.TaxByLocation,CouponID:e,SOPDetails:this.cart.toJSON(),ShipToCode:r.ShipTo.ShipToCode,DiscountPercent:r.ShipTo.DiscountPercent,DiscountType:r.ShipTo.DiscountType}):this.itemModel.set({CustomerCode:r.CustomerCode,CategoryCode:r.Category,WarehouseCode:r.LocationCode,TaxByLocation:r.Preference.TaxByLocation,CouponID:e,ShipToCode:r.ShipTo.ShipToCode,DiscountPercent:r.ShipTo.DiscountPercent,DiscountType:r.ShipTo.DiscountType});var t=this;this.itemModel.save(null,{success:function(e,o){t.cart.reset(),t.CheckCustomerItemPrices(o),o.SOPDetails&&t.cart.add(o.SOPDetails),t.salesOrder.reset(o.SOPDetails),t.salesOrder.each(t.ReloadItems,t),t.salesOrder.trigger("recalculateCompleted",t),t.ResetCurrentCustomerChanged(),t.trigger("shiptochanged",t),r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()},error:function(e,t,o){e.RequestError(t,"Error Recalculating Price"),r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}})},CheckCustomerItemPrices:function(e){o.each(e.SOPDetails,function(e){var t=e.SalesTaxAmountRate*e.QuantityOrdered;e.SalesTaxAmountRate=t,1==r.CurrentCustomerChanged&&(e.Pricing&&(e.Pricing=null),e.DoNotChangePrice&&(e.DoNotChangePrice=!1))})},ReloadItems:function(e){e.recalculate()},CheckType:function(e,t){switch(t){case"CustomerList":this.RenderCustomerListTemplate(),this.HideButtons(t),this.LoadCustomer();break;case"CustomerForm":this.LoadCustomerForm();break;case"ShipToList":this.RenderShipToListTemplate(),this.HideButtons(t),this.LoadShipTo();break;case"ShipToForm":this.LoadShipToForm();break;case"CustomerNoteList":this.RenderNoteListTemplate(),this.HideButtons(t),this.LoadCustomerNote();break;case"SalesRepList":this.RenderSalesRepListTemplate(),this.ShowSpinner("salesrep")}},RenderShipToListTemplate:function(){e("#headerInfoContainer").prepend(o.template(N))},LoadShipTo:function(){e("#spin").remove(),this.ShowSpinner(),this.InitializeShipTo(100,this.criteria),this.InitializeShipToView()},LoadShipToForm:function(){e("#headerInfoContainer").append("<div id='FormContainer'></div>");var t=new w({el:e("#FormContainer"),FormType:"New Ship To"});t.on("createdShipTo",this.ProcessShipTo,this),e("#main-transaction-blockoverlay").show()},InitializeShipTo:function(e,t,o){var i=this,s=new h;this.shipToCollection=new d,this.shipToCollection.on("selected",this.LoadShipToDetail,this),this.shipToCollection.on("viewDetail",this.SetSelectedShipTo,this),s.set({CriteriaString:t,CustomerCode:r.CurrentCustomer.CustomerCode}),s.url=r.ServiceUrl+n.CUSTOMER+a.SHIPTOLOOKUP+e,s.save(null,{success:function(e,t){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),i.shipToCollection.reset(t.ShipToCollection),"update"===o&&i.ProcessUpdatedShipTo(t),i.HideActivityIndicator()},error:function(e,t,o){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),i.HideActivityIndicator(),e.RequestError(t,"Error Retrieving Ship Tos")}})},InitializeShipToView:function(){this.shipTosView=new g({el:e("#shipto-content"),collection:this.shipToCollection})},LoadShipToDetail:function(e){var t=this;this.criteria=e.get("ShipToName");var o=this.shipToCollection.find(function(e){return e.get("ShipToName")==t.criteria});o&&this.LoadShipToDetailView(o),this.criteria=""},LoadShipToDetailView:function(t){var o=new y({el:e("#shipto-inner"),model:t});o.on("ProcessShipTo",this.ProcessShipTo,this),this.shipTo=t,this.HideButtons("ShipToDetail")},RenderCustomerListTemplate:function(){e("#headerInfoContainer").prepend(o.template(L))},LoadCustomer:function(){e("#spin").remove(),this.ShowSpinner(),this.InitializeCustomer(100,this.criteria),this.InitializeCustomerView()},RetrieveCurrentCustomer:function(e){this.currentCustomer=new m,this.currentCustomer.url=r.ServiceUrl+n.CUSTOMER+a.LOADCUSTOMERBYCODE+e,this.currentCustomer.fetch({success:function(){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()},error:function(e,t,o){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Retrieving Customer")}})},InitializeCustomer:function(e,t,o,i){var s=this,u=new h;this.customerCollection=new m,this.customerCollection.on("selected",this.LoadCustomerDetail,this),this.customerCollection.on("viewDetail",this.SetSelectedCustomer,this),this.customerCollection.on("create",this.SetNewCustomer,this),i||(i=!1),u.set({StringValue:t}),u.url=r.ServiceUrl+n.CUSTOMER+a.CUSTOMERLOOKUP+e,u.save(null,{success:function(e,t){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),s.customerCollection.reset(t.Customers),"Edit Customer"===o&&s.ProcessUpdatedCustomer(t),"New Customer"===o&&s.SetSelectedCustomer(s.customerCollection.at(0)),i&&s.SetSelectedCustomer(s.customerCollection.at(0)),s.HideActivityIndicator()},error:function(e,t,o){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),s.HideActivityIndicator(),e.RequestError(t,"Error Retrieving Customer List")}})},InitializeCustomerView:function(){this.customerView=new T({el:"#customer-content",collection:this.customerCollection})},AllowChangeCustomer:function(){if(console.log("AllowChangeCustomer: "+r.TransactionType),r.TransactionType===s.TransactionType.Sale||r.TransactionType===s.TransactionType.Quote||r.TransactionType===s.TransactionType.Order||r.TransactionType===s.TransactionType.Return)return!0;var e="";return r.TransactionType==s.TransactionType.ConvertOrder&&(e="converting an order"),r.TransactionType==s.TransactionType.ConvertQuote&&(e="converting a quote."),r.TransactionType==s.TransactionType.UpdateOrder&&(e="updating an order."),r.TransactionType==s.TransactionType.UpdateQuote&&(e="updating a quote."),e.length>0&&(e="Your action is not allowed when "+e),0==e.length&&(e="Your action is not allowed for '"+r.TransactionType.toString()+"'."),console.log(e),navigator.notification.alert(e,null,"Action Not Allowed","OK"),!1},LoadCustomerDetail:function(e){var t=this;this.customer=e,this.customerCollection=new m,this.customerCollection.url=r.ServiceUrl+n.CUSTOMER+a.LOADCUSTOMERBYCODE+e.get("CustomerCode"),this.customerCollection.fetch({success:function(){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.GetCustomer(e.get("CustomerCode"))},error:function(e,t,o){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Loading Customer Detail")}})},GetCustomer:function(e){var t=this;this.customerCollection.each(function(o){e===o.get("CustomerCode")&&(t.selectedCustomer=o,t.LoadCustomerDetailView(o))})},LoadCustomerDetailView:function(t){var o=new S({el:e("#customer-inner"),model:t});o.on("ProcessCustomer",this.ProcessCustomer,this),this.HideButtons("CustomerDetail")},LoadCustomerForm:function(){e("#headerInfoContainer").append("<div id='FormContainer'></div>");var t=new f({el:e("#FormContainer"),FormType:"New Customer"});t.on("createdCustomer",this.ProcessCustomer,this),e("#main-transaction-blockoverlay").show()},LoadEditCustomerForm:function(){e("#customer").remove(),e("#headerInfoContainer").append("<div id='FormContainer'></div>");var t=new f({el:e("#FormContainer"),FormType:"Edit Customer"});t.on("updatedCustomer",this.ProcessCustomer,this),t.on("formLoaded",this.EditCustomer,this),e("#main-transaction-blockoverlay").show()},EditCustomer:function(e){e&&e.EditCustomer(this.selectedCustomer),this.selectedCustomer=null},RenderSalesRepListTemplate:function(){if(r.TransactionType===s.TransactionType.SalesCredit||r.TransactionType===s.TransactionType.SalesPayment||r.TransactionType===s.TransactionType.SalesRefund||r.TransactionType===s.TransactionType.Suspend||r.TransactionType===s.TransactionType.ResumeSale||r.TransactionType===s.TransactionType.VoidTransaction||r.TransactionType===s.TransactionType.Recharge){var t="Your action is not allowed for '"+r.TransactionType.toString()+"'.";console.log(t),navigator.notification.alert(t,null,"Action Not Allowed","OK")}else{var o=new D({rows:100});o.on("hideSpinner",function(){this.HideActivityIndicator()}.bind(this))}e("#salesrep-container").append(o.render().el),e("#spin").remove(),this.HideActivityIndicator()},HideListContainer:function(){this.HideActivityIndicator(),u.FocusToItemScan(),e("#customer").hide(),e("#shipto").hide(),e("#noteList").remove(),e("#main-transaction-blockoverlay").hide()},HideButtons:function(t){switch(t){case"CustomerList":e("#back-customer").hide(),e("#select-customer").hide(),e("#customer-inner").css("height","538px"),e("#customer-footer").hide();break;case"CustomerDetail":e("#done-customer").hide(),e("#back-customer").show(),e("#select-customer").show(),e("#customer-inner").css("height","495px"),e("#customer-footer").show();break;case"ShipToList":e("#back-shipto").hide(),e("#select-shipto").hide();break;case"ShipToDetail":e("#done-shipto").hide(),e("#back-customerDetail").hide(),e("#back-shipto").show(),e("#select-shipto").show();break;case"CustomerNoteList":e("#select-noteList").hide(),e("#noteList-inner").css("height","538px"),e("#noteList-footer").hide();break;case"CustomerNoteDetail":e("#noteList-customer").hide(),e("#noteList-customer").show(),e("#noteList-customer").show(),e("#noteList-inner").css("height","495px"),e("#noteList-footer").show()}},ShowSpinner:function(t){e("#main-transaction-blockoverlay").show();var o=u.IsNullOrWhiteSpace(t)?"main-transaction-page":t;target=document.getElementById(o),this.ShowActivityIndicator(target),e("<h5>Loading...</h5>").appendTo(e("#spin"))},ShowActivityIndicator:function(t){e("<div id='spin'></div>").appendTo(t);var o=document.getElementById("spin");_spinner=O,_spinner.opts.color="#fff",_spinner.opts.lines=13,_spinner.opts.length=7,_spinner.opts.width=4,_spinner.opts.radius=10,_spinner.opts.top="auto",_spinner.opts.left="auto",_spinner.spin(o)},HideActivityIndicator:function(){_spinner=O,_spinner.stop(),e("#spin").remove()},DisableButton:function(){e("#done-customer").addClass("ui-disabled")},EnableLookupButton:function(){e("#done-customer").removeClass("ui-disabled")},ShowClearBtn:function(t){t.stopPropagation();var o=t.target.id,i=e("#"+o).val(),r=i.length,s=e("#"+o).position(),n=e("#"+o).width();r<=0?this.HideClearBtn():(console.log(o),null===s&&""===s||(e("#"+o+"ClearBtn").css({top:s.top+7,left:s.left+(n-18)}),e("#"+o+"ClearBtn").show()))},HideClearBtn:function(){e(".clearTextBtn").fadeOut()},ClearText:function(t){var o=t.target.id,i=o.substring(0,o.indexOf("ClearBtn"));e("#"+i).val(""),this.HideClearBtn()},ResetCurrentCustomerChanged:function(e){r.CurrentCustomerChanged=!1},ProcessCustomer:function(e,t){this.InitializeCustomer(1,e.get("CustomerCode"),t)},ProcessUpdatedCustomer:function(e){var t=new p;t.reset(e.Customers),this.SetSelectedCustomer(t.at(0),!0)},ProcessShipTo:function(e){this.InitializeShipTo(1,e.get("ShipToCode"),"update")},ProcessUpdatedShipTo:function(e){var t=new p;t.reset(e.ShipToCollection),this.SetSelectedShipTo(t.at(0))},RenderNoteListTemplate:function(){var t=o.template(I);if(this.selectedCustomer.get("CustomerName").length>15){var i=this.selectedCustomer.get("CustomerName").substring(0,14)+"...";this.selectedCustomer.set({CustomerName:i})}e("#headerInfoContainer").prepend(t(this.selectedCustomer.toJSON())),e("#done-customer").text("Detail")},LoadCustomerNote:function(){var e=this,t=new p,o=new l;null!=t._callBacks||void 0!=t._callBacks?t.unbind():(t.on("viewDetail",this.LoadNoteDetail,this),t.on("removeNote",this.RemoveNote,this)),o.set({CustomerCode:this.selectedCustomer.get("CustomerCode"),CriteriaString:this.criteria}),o.url=r.ServiceUrl+n.CUSTOMER+a.LOADCUSTOMERNOTELOOKUP,o.save(o,{success:function(o,i,s){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RenderNoteList(t,i),e.criteria=""}})},RenderNoteList:function(t,o){new v({el:e("#noteList-content"),collection:t});t.reset(o.OrderNotes),e("#customer").hide()},ReloadCustomer:function(t){t.preventDefault(),e("#noteList").remove(),e("#customer").show()},LoadNoteDetail:function(e){this.trigger("customernotes",r.NoteType.Customer,e.set({CustomerName:this.selectedCustomer.get("CustomerName")}),r.MaintenanceType.UPDATE)},ShowOrderNotesForm:function(){this.trigger("customernotes",r.NoteType.Customer,this.selectedCustomer,r.MaintenanceType.CREATE)},ReloadNote:function(){e("#noteList").remove(),this.ShowCustomerNoteList()},RemoveNote:function(e){this.trigger("removeNote",r.NoteType.Customer,e.set({CustomerName:this.selectedCustomer.get("CustomerName")}),r.MaintenanceType.DELETE)}});return k});