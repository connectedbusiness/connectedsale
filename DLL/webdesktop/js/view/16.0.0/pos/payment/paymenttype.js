define(["jquery","mobile","underscore","backbone","shared/global","shared/method","shared/service","shared/enum","model/base","text!template/16.0.0/pos/payment/paymenttype.tpl.html"],function(t,e,n,a,s,o,i,h,r,c){var y=a.View.extend({_template:n.template(c),events:{"tap #btn-donePayment":"buttonDone_payment","tap #btn-cashPayment":"buttonCash_payment","tap #btn-checkPayment":"buttonCheck_payment","tap #btn-cardPayment":"buttonCard_payment","tap #btn-gift":"buttonApplyGift","tap #btn-loyalty":"buttonApplyLoyalty","tap #btn-suspendPayment":"buttonSuspend_payment","tap #btn-paymentOnAccount":"buttonPaymentOnAccount","tap #btn-returnPayment":"buttonReturn_payment","tap #btn-saveOrder":"buttonSaveOrder"},buttonDone_payment:function(t){t.preventDefault(),this.Hide()},buttonCash_payment:function(t){t.preventDefault(),this.trigger("cash",this),this.Close()},buttonCheck_payment:function(t){t.preventDefault(),this.trigger("check",this),this.Close()},buttonCard_payment:function(t){t.preventDefault(),this.FetchCreditCardAllowSale()},FetchCreditCardAllowSale:function(){s.AllowSaleCreditPreference=!1;var t=this,e=new r;e.url=s.ServiceUrl+i.POS+o.GETCREDITCARDALLOWSALE,e.fetch({success:function(e,n,a){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),s.AllowSaleCreditPreference=n,t.ProceedToCardAction(),console.log(n)},error:function(e){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.ProceedToCardAction(),console.log(e)}})},ProceedToCardAction:function(){this.trigger("card",this),this.Close()},buttonApplyGift:function(t){t.preventDefault(),this.trigger("gift",this),this.Close()},buttonApplyLoyalty:function(t){t.preventDefault(),this.trigger("loyalty",this),this.Close()},buttonSuspend_payment:function(t){t.preventDefault(),this.trigger("suspend",this),this.Close()},buttonPaymentOnAccount:function(t){t.preventDefault(),this.trigger("onAccount",this),this.Close()},buttonSaveOrder:function(t){t.preventDefault(),this.trigger("onAccount",this),this.Close()},buttonReturn_payment:function(t){t.preventDefault(),this.trigger("onAccount",this),this.Close()},initialize:function(){this.isPaid=this.options.isPaid,this.render()},render:function(){switch(this.$el.html(this._template),s.TransactionType){case h.TransactionType.Sale:case h.TransactionType.Suspend:this.isPaid?t("#btn-suspendPayment").hide():t("#btn-suspendPayment").show(),t("#btn-cashPayment").show(),t("#btn-checkPayment").show(),t("#btn-cardPayment").show(),t("#btn-paymentOnAccount").show(),t("#btn-gift").show(),t("#btn-loyalty").show(),t("#btn-returnPayment").hide(),t("#btn-saveOrder").hide();break;case h.TransactionType.Order:t("#btn-cashPayment").show(),t("#btn-checkPayment").show(),t("#btn-cardPayment").show(),t("#btn-paymentOnAccount").hide(),t("#btn-gift").show(),t("#btn-loyalty").show(),t("#btn-cashPayment").addClass("box2"),t("#btn-returnPayment").hide(),t("#btn-saveOrder").show(),t("#btn-suspendPayment").hide();break;case h.TransactionType.Return:t("#btn-cashPayment").hide(),t("#btn-checkPayment").hide(),t("#btn-cardPayment").hide(),t("#btn-returnPayment").show(),t("#btn-gift").hide(),t("#btn-loyalty").hide(),t("#btn-paymentOnAccount").hide(),t("#btn-saveOrder").hide(),t("#btn-suspendPayment").hide();break;case h.TransactionType.UpdateInvoice:case h.TransactionType.Recharge:this.isPaid?t("#btn-suspendPayment").hide():t("#btn-suspendPayment").show(),t("#btn-cashPayment").show(),t("#btn-checkPayment").show(),t("#btn-cardPayment").show(),t("#btn-paymentOnAccount").show(),t("#btn-gift").show(),t("#btn-loyalty").show(),t("#btn-saveOrder").hide(),t("#btn-returnPayment").hide();break;case h.TransactionType.UpdateOrder:t("#btn-cashPayment").show(),t("#btn-checkPayment").show(),t("#btn-cardPayment").show(),t("#btn-saveOrder").show(),t("#btn-gift").show(),t("#btn-loyalty").show(),t("#btn-cashPayment").addClass("box2"),t("#btn-paymentOnAccount").hide(),t("#btn-returnPayment").hide(),t("#btn-suspendPayment").hide();break;case h.TransactionType.ConvertQuote:t("#btn-cashPayment").show(),t("#btn-checkPayment").show(),t("#btn-cardPayment").show(),t("#btn-saveOrder").show(),t("#btn-gift").show(),t("#btn-loyalty").show(),t("#btn-cashPayment").addClass("box2"),t("#btn-paymentOnAccount").hide(),t("#btn-returnPayment").hide(),t("#btn-suspendPayment").hide();break;case h.TransactionType.ConvertOrder:t("#btn-cashPayment").show(),t("#btn-checkPayment").show(),t("#btn-cardPayment").show(),t("#btn-paymentOnAccount").show(),t("#btn-gift").show(),t("#btn-loyalty").show(),t("#btn-returnPayment").hide(),t("#btn-saveOrder").hide(),t("#btn-suspendPayment").hide();break;case h.TransactionType.SalesPayment:t("#btn-cashPayment").show(),t("#btn-checkPayment").show(),t("#btn-cardPayment").show(),t("#btn-paymentOnAccount").show(),t("#btn-gift").show(),t("#btn-loyalty").show(),t("#btn-returnPayment").hide(),t("#btn-saveOrder").hide(),t("#btn-suspendPayment").hide();break;case h.TransactionType.SalesRefund:t("#btn-cashPayment").show(),t("#btn-checkPayment").show(),t("#btn-cardPayment").show(),t("#btn-returnPayment").show(),t("#btn-gift").hide(),t("#btn-loyalty").hide(),t("#btn-paymentOnAccount").hide(),t("#btn-saveOrder").hide(),t("#btn-suspendPayment").hide()}t("#main-transaction-blockoverlay").show(),this.$("#paymentTypeBody").trigger("create")},CheckIfIsTrackLoyalty:function(){s.CustomerHasLoyalty?t("#btn-loyalty").show():(t("#btn-loyalty").hide(),t("#btn-paymentOnAccount").is(":visible")?t("#btn-cashPayment").addClass("box2"):t("#btn-cashPayment").addClass("box3"))},Show:function(t){this.isPaid=t,this.$el.show(),this.render()},Close:function(){this.$("#paymentType").remove()},Hide:function(){t("#main-transaction-blockoverlay").hide(),this.$el.html(""),this.$el.hide()}});return y});