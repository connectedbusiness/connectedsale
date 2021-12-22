define(["backbone","shared/global","shared/service","shared/method","shared/shared","model/base","model/lookupcriteria","collection/base","text!template/22.0.0/pos/customerpo/customerpo.tpl.html","js/libs/format.min.js"],function(e,t,i,s,o,a,n,r,h,l){var d="#paymentTerm",c="#paymentTerm-div",u="#paymentTermLabel",p="#shippingMethod",m="#shippingMethod-div",S="#shippingMethodLabel",C="#contact",v="#contact-div",g="#contactLabel",M="#customer-Source",y="#customerPOSource-div",f="#sourceLabel",O="#customer-PO",P="#POLabel",T="#customer-ShipDate",w="#shipdateLabel",b=e.View.extend({_template:_.template(h),events:{"tap #customer-po-btn-done ":"ValidateInputs","tap #customer-po-btn-cancel ":"Cancel"},initialize:function(){this.render()},render:function(){this.$el.html(this._template);var e=new Date;return $(T).val(this.JSONtoDate(e)),o.BrowserModeDatePicker("#customer-ShipDate","datepicker"),this.$el.trigger("create"),$("#customerPOSource-div > :first-child > :first-child").addClass("po-source-border"),$("#paymentTerm-div > :first-child > :first-child").addClass("po-source-border"),$("#shippingMethod-div > :first-child > :first-child").addClass("po-source-border"),$("#contact-div > :first-child > :first-child").addClass("po-source-border"),this},InitializeChildViews:function(){},JsonToAspDate:function(e){var t=Date.parse(e),i=new Date(t),s=i.getMonth(),o=i.getDate(),a=i.getFullYear();return i=Date.UTC(a,s,o),i="/Date("+i+")/"},JSONtoDate:function(e){var t="YYYY-MM-DD",i=moment(e).format(t);return i},ValidateInputs:function(e){e.preventDefault();var t=this.$(O).val(),i=this.$(T).val(),s=this.JsonToAspDate(i),o=this.$(M).val(),a=this.$(d).val().split("|"),n=this.$(p).val().split("|"),r=this.$(C).val();return 1==this.hasShipDate&&this.IsNullOrWhiteSpace(i)?void navigator.notification.alert("Shipping Date is required",null,"Cannot Save Transaction","OK"):void this.Save(t,s,o,a[1],a[0],n[1],n[0],r)},Cancel:function(e){e.preventDefault(),$("#main-transaction-blockoverlay").hide(),this.trigger("ResetCustomerPO"),this.$el.hide()},Save:function(e,t,i,s,o,a,n,r){this.model.set({POCode:e,SourceCode:i,ShippingDate:t,PaymentTermGroup:s,PaymentTermCode:o,ShippingMethodGroup:a,ShippingMethodCode:n,ContactCode:r}),this.trigger("AddCustomerPO",this.model,this.type),this.Close()},Close:function(){this.$el.hide()},Show:function(e,t,i,s,o,n,r){this.$el.show(),this.model=new a,this.model=e,this.type="",this.sourceModel=new a,this.customerSourceCode=i,this.paymentTermModel=new a,this.paymentTermCode=s,this.shippingMethodModel=new a,this.shippingMethodCode=o,this.contactModel=new a,this.contactCode=n,this.transactionModel=new a,this.IsNullOrWhiteSpace(r)||(this.transactionModel=r.at(0)),this.IsNullOrWhiteSpace(t)||(this.type=t),this.InitializeControls()},InitializeControls:function(){this.$(O).removeClass("ui-disabled"),this.$(P).removeClass("ui-disabled"),this.$(T).removeClass("ui-disabled"),this.$(w).removeClass("ui-disabled"),this.$(M).removeClass("ui-disabled"),this.$(f).removeClass("ui-disabled"),this.$(d).removeClass("ui-disabled"),this.$(u).removeClass("ui-disabled"),this.$(p).removeClass("ui-disabled"),this.$(S).removeClass("ui-disabled"),this.$(C).removeClass("ui-disabled"),this.$(g).removeClass("ui-disabled"),this.PaymentTerm=!0,this.ShippingMethod=!0,this.Contact=!0,this.hasCustomerPO=!0,this.hasShipDate=!0,this.Source=!0,t.Preference.AskForCustomerPO||(this.$(O).addClass("ui-disabled"),this.$(P).addClass("ui-disabled"),this.hasCustomerPO=!1),t.Preference.AskForShipDate||(this.$(T).addClass("ui-disabled"),this.$(w).addClass("ui-disabled"),this.hasShipDate=!1),t.Preference.AskForSource||(this.$(y).addClass("ui-disabled"),this.$(f).addClass("ui-disabled"),this.$(M+" > option").remove(),this.Source=!1),t.Preference.AskForPaymentTerm||(this.$(c).addClass("ui-disabled"),this.$(u).addClass("ui-disabled"),this.$(d+" > option").remove(),this.PaymentTerm=!1),t.Preference.AskForShippingMethod||(this.$(m).addClass("ui-disabled"),this.$(S).addClass("ui-disabled"),this.$(p+" > option").remove(),this.ShippingMethod=!1),t.Preference.AskForContact||(this.$(v).addClass("ui-disabled"),this.$(g).addClass("ui-disabled"),this.$(C+" > option").remove(),this.Contact=!1),this.InitializeSystemSource(),this.InitializeSystemPaymentTerm(t.CustomerCode),this.InitializeSystemShippingMethod(t.CustomerCode),this.InitializeCRMContact(t.CustomerCode)},IsNullOrWhiteSpace:function(e){return o.IsNullOrWhiteSpace(e)},InitializePreviousTransction:function(){if(this.customerTransactionModel=new a,!this.IsNullOrWhiteSpace(this.transactionModel)){var e=this.transactionModel.get("POCode"),t=this.transactionModel.get("SourceCode"),i=this.transactionModel.get("PaymentTermCode"),s=this.transactionModel.get("ShippingMethodCode"),o=this.transactionModel.get("ContactCode"),n=this.JSONtoDate(this.transactionModel.get("ShippingDate"));this.IsNullOrWhiteSpace(e)&&(e=""),this.$(O).val(e),this.$(T).val(n),this.$(M).val(t),this.IsNullOrWhiteSpace(t)||(this.$(M+" > option[value='"+t+"']").attr("selected","selected"),this.$(M).trigger("change")),this.$(d).val(i),this.IsNullOrWhiteSpace(i)||(this.$(d+" > option[value='"+i+"']").attr("selected","selected"),this.$(d).trigger("change")),this.$(p).val(s),this.IsNullOrWhiteSpace(s)||(this.$(p+" > option[value='"+s+"']").attr("selected","selected"),this.$(p).trigger("change")),this.$(C).val(o),this.IsNullOrWhiteSpace(o)||(this.$(C+" > option[value='"+o+"']").attr("selected","selected"),this.$(C).trigger("change"))}},InitializeSystemSource:function(e){this.sytemSourceModel=new a;var o=100;this.IsNullOrWhiteSpace(e)||this.systemSourceModel.set({StringValue:e});var n=this;this.sytemSourceModel.url=t.ServiceUrl+i.POS+s.LOADSYTEMSOURCE+o,this.sytemSourceModel.save(null,{success:function(e,i){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),n.LoadSytemSource(i)}})},GetCustomerSourceCode:function(){if(!this.IsNullOrWhiteSpace(this.customerSourceCode)){var e=this.customerSourceCode;this.$(M).val(e),this.$(M+" > option[value='"+e+"']").attr("selected","selected"),this.$(M).trigger("change")}this.InitializePreviousTransction()},LoadSytemSource:function(e){this.$(M+" > option").remove();var t=this;this.IsNullOrWhiteSpace(e)||(this.systemSourceCollection=new r,this.systemSourceCollection.reset(e.SystemSources),t.$(M).append(new Option("-Select Source-","")),this.systemSourceCollection.each(function(e){var i=e.get("SourceDescription"),s=e.get("SourceCode");"Unknown"==e.get("SourceCode")&&(_defaultSource=e.get(i)),t.$(M).append(new Option(i,s))}),this.GetCustomerSourceCode())},InitializeSystemPaymentTerm:function(e){this.sytemPaymentTermModel=new a;var o=100;this.IsNullOrWhiteSpace(e)||this.sytemPaymentTermModel.set({StringValue:e});var n=this;this.sytemPaymentTermModel.url=t.ServiceUrl+i.POS+s.LOADSYSTEMPAYMENTTERM+o,this.sytemPaymentTermModel.save(null,{success:function(e,i){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),n.LoadSytemPaymentTerm(i)}})},GetPaymentTermCode:function(){if(!this.IsNullOrWhiteSpace(this.paymentTermCode)){var e=this.paymentTermCode;this.$(d).val(e),this.$(d+" > option[value='"+e+"']").attr("selected","selected"),this.$(d).trigger("change")}this.InitializePreviousTransction()},LoadSytemPaymentTerm:function(e){this.$(d+" > option").remove();var t=this;this.IsNullOrWhiteSpace(e)||(this.systemPaymentTermCollection=new r,this.systemPaymentTermCollection.reset(e.SystemPaymentTerms),t.$(d).append(new Option("-Select Payment Term-","")),this.systemPaymentTermCollection.each(function(e){var i=e.get("PaymentTermDescription"),s=e.get("PaymentTermCode"),o=e.get("PaymentTermGroup");"Unknown"==e.get("PaymentTermCode")&&(_defaultPaymentTerm=e.get(i)),t.$(d).append(new Option(i,s+"|"+o))}),this.GetPaymentTermCode())},InitializeSystemShippingMethod:function(e){this.sytemShippingMethodModel=new a;var o=100;this.IsNullOrWhiteSpace(e)||this.sytemShippingMethodModel.set({StringValue:e});var n=this;this.sytemShippingMethodModel.url=t.ServiceUrl+i.POS+s.LOADSYSTEMSHIPPINGMETHOD+o,this.sytemShippingMethodModel.save(null,{success:function(e,i){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),n.LoadSytemShippingMethod(i)}})},GetShippingMethoCode:function(){if(!this.IsNullOrWhiteSpace(this.shippingMethodCode)){var e=this.shippingMethodCode;this.$(p).val(e),this.$(p+" > option[value='"+e+"']").attr("selected","selected"),this.$(p).trigger("change")}this.InitializePreviousTransction()},LoadSytemShippingMethod:function(e){this.$(p+" > option").remove();var t=this;this.IsNullOrWhiteSpace(e)||(this.systemShippingMethodCollection=new r,this.systemShippingMethodCollection.reset(e.SystemShippingMethods),t.$(p).append(new Option("-Select Shipping Method-","")),this.systemShippingMethodCollection.each(function(e){var i=e.get("ShippingMethodDescription"),s=e.get("ShippingMethodCode"),o=e.get("ShippingMethodGroup");"Unknown"==e.get("ShippingMethodCode")&&(_defaultShippingMethod=e.get(i)),t.$(p).append(new Option(i,s+"|"+o))}),this.GetShippingMethodCode())},InitializeCRMContact:function(e){this.crmContactModel=new a;var o=100;this.IsNullOrWhiteSpace(e)||this.crmContactModel.set({StringValue:e});var n=this;this.crmContactModel.url=t.ServiceUrl+i.POS+s.LOADCRMCONTACT+o,this.crmContactModel.save(null,{success:function(e,i){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),n.LoadCRMContact(i)}})},GetContactCode:function(){if(!this.IsNullOrWhiteSpace(this.contactCode)){var e=this.contactCode;this.$(C).val(e),this.$(C+" > option[value='"+e+"']").attr("selected","selected"),this.$(C).trigger("change")}this.InitializePreviousTransction()},LoadCRMContact:function(e){this.$(C+" > option").remove();var t=this;this.IsNullOrWhiteSpace(e)||(this.contactCollection=new r,this.contactCollection.reset(e.CRMContacts),t.$(C).append(new Option("-Select Contact-","")),this.contactCollection.each(function(e){var i=e.get("ContactFullName"),s=e.get("ContactCode");"Unknown"==e.get("ContactCode")&&(_defaultContact=e.get(i)),t.$(C).append(new Option(i,s))}),this.GetContactCode())}});return b});