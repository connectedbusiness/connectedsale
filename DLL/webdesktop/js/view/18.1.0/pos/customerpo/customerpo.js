define(["backbone","shared/global","shared/service","shared/method","shared/shared","model/base","model/lookupcriteria","collection/base","text!template/18.1.0/pos/customerpo/customerpo.tpl.html","js/libs/format.min.js"],function(e,t,i,s,o,a,r,l,n,h){var c="#customer-Source",u="#customerPOSource-div",d="#sourceLabel",S="#customer-PO",p="#POLabel",m="#customer-ShipDate",v="#shipdateLabel",C=e.View.extend({_template:_.template(n),events:{"tap #customer-po-btn-done ":"ValidateInputs","tap #customer-po-btn-cancel ":"Cancel"},initialize:function(){this.render()},render:function(){this.$el.html(this._template);var e=new Date;return $(m).val(this.JSONtoDate(e)),o.BrowserModeDatePicker("#customer-ShipDate","datepicker"),this.$el.trigger("create"),$("#customerPOSource-div > :first-child > :first-child").addClass("po-source-border"),this},InitializeChildViews:function(){},JsonToAspDate:function(e){var t=Date.parse(e),i=new Date(t),s=i.getMonth(),o=i.getDate(),a=i.getFullYear();return i=Date.UTC(a,s,o),i="/Date("+i+")/"},JSONtoDate:function(e){var t="YYYY-MM-DD",i=moment(e).format(t);return i},ValidateInputs:function(e){e.preventDefault();var t=this.$(S).val(),i=this.$(m).val(),s=this.JsonToAspDate(i),o=this.$(c).val();return 1==this.hasShipDate&&this.IsNullOrWhiteSpace(i)?void navigator.notification.alert("Shipping Date is required",null,"Cannot Save Transaction","OK"):void this.Save(t,s,o)},Cancel:function(e){e.preventDefault(),$("#main-transaction-blockoverlay").hide(),this.trigger("ResetCustomerPO"),this.$el.hide()},Save:function(e,t,i){this.model.set({POCode:e,SourceCode:i,ShippingDate:t}),this.trigger("AddCustomerPO",this.model,this.type),this.Close()},Close:function(){this.$el.hide()},Show:function(e,t,i,s){this.$el.show(),this.model=new a,this.model=e,this.type="",this.sourceModel=new a,this.customerSourceCode=i,this.transactionModel=new a,this.IsNullOrWhiteSpace(s)||(this.transactionModel=s.at(0)),this.IsNullOrWhiteSpace(t)||(this.type=t),this.InitializeControls()},InitializeControls:function(){this.$(S).removeClass("ui-disabled"),this.$(p).removeClass("ui-disabled"),this.$(m).removeClass("ui-disabled"),this.$(v).removeClass("ui-disabled"),this.$(c).removeClass("ui-disabled"),this.$(d).removeClass("ui-disabled"),this.hasCustomerPO=!0,this.hasShipDate=!0,this.Source=!0,t.Preference.AskForCustomerPO||(this.$(S).addClass("ui-disabled"),this.$(p).addClass("ui-disabled"),this.hasCustomerPO=!1),t.Preference.AskForShipDate||(this.$(m).addClass("ui-disabled"),this.$(v).addClass("ui-disabled"),this.hasShipDate=!1),t.Preference.AskForSource||(this.$(u).addClass("ui-disabled"),this.$(d).addClass("ui-disabled"),this.$(c+" > option").remove(),this.Source=!1),this.InitializeSystemSource()},IsNullOrWhiteSpace:function(e){return o.IsNullOrWhiteSpace(e)},InitializePreviousTransction:function(){if(this.customerTransactionModel=new a,!this.IsNullOrWhiteSpace(this.transactionModel)){var e=this.transactionModel.get("POCode"),t=this.transactionModel.get("SourceCode"),i=this.JSONtoDate(this.transactionModel.get("ShippingDate"));this.IsNullOrWhiteSpace(e)&&(e=""),this.$(S).val(e),this.$(m).val(i),this.$(c).val(t),this.IsNullOrWhiteSpace(t)||(this.$(c+" > option[value='"+t+"']").attr("selected","selected"),this.$(c).trigger("change"))}},InitializeSystemSource:function(e){this.sytemSourceModel=new a;var o=100;this.IsNullOrWhiteSpace(e)||this.systemSourceModel.set({StringValue:e});var r=this;this.sytemSourceModel.url=t.ServiceUrl+i.POS+s.LOADSYTEMSOURCE+o,this.sytemSourceModel.save(null,{success:function(e,i){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),r.LoadSytemSource(i)}})},GetCustomerSourceCode:function(){if(!this.IsNullOrWhiteSpace(this.customerSourceCode)){var e=this.customerSourceCode;this.$(c).val(e),this.$(c+" > option[value='"+e+"']").attr("selected","selected"),this.$(c).trigger("change")}this.InitializePreviousTransction()},LoadSytemSource:function(e){this.$(c+" > option").remove();var t=this;this.IsNullOrWhiteSpace(e)||(this.systemSourceCollection=new l,this.systemSourceCollection.reset(e.SystemSources),t.$(c).append(new Option("-Select Source-","")),this.systemSourceCollection.each(function(e){var i=e.get("SourceDescription"),s=e.get("SourceCode");"Unknown"==e.get("SourceCode")&&(_defaultSource=e.get(i)),t.$(c).append(new Option(i,s))}),this.GetCustomerSourceCode())}});return C});