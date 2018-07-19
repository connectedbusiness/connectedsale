define(["jquery","mobile","underscore","backbone","shared/enum","view/16.0.0/pos/payment/paymentitem","text!template/16.0.0/pos/payment/payments.tpl.html","text!template/16.0.0/pos/payment/paymentdetailcash.tpl.html","text!template/16.0.0/pos/payment/paymentdetailcheck.tpl.html","text!template/16.0.0/pos/payment/paymentdetailcreditcard.tpl.html","text!template/16.0.0/pos/payment/paymentdetailgift.tpl.html","text!template/16.0.0/pos/payment/paymentdetailloyalty.tpl.html","js/libs/iscroll.js"],function(t,e,i,a,n,s,l,m,o,r,p,h){var y=a.View.extend({_template:i.template(l),_cashTemplate:i.template(m),_checkTemplate:i.template(o),_creditCardTemplate:i.template(r),_giftTemplate:i.template(p),_loyaltyTemplate:i.template(h),events:{"tap .btn-Done":"btnDone_tap","tap .btn-Remove":"btnRemove_tap","tap .btn-Back":"btnBack_tap"},initialize:function(){this.render()},render:function(){return 0===this.collection.length?void this.Close():(this.$el.html(this._template()),this.InitializePaymentItems(),void t("#main-transaction-blockoverlay").show())},InitializePaymentItems:function(){this.paymentHasSignature=!1,this.CCPaymentHasSignature=!1,this.collection.each(this.InitializePaymentItem,this),this.$(".btn-Done").show(),this.$(".btn-Remove").hide(),this.$(".title").html("Payments"),this.$(".popover-left").hide(),this.$(".div-paymentsList").show(),this.$(".div-paymentDetail").hide(),this.AdjustFormSize(),this.$("#paymentsListBody").trigger("create"),this.myScroll=new iScroll("paymentsListBody")},InitializePaymentItem:function(t){var e=new s({model:t});this.$(".ul-paymentsList").append(e.render().el),e.bind("paymentSelected",this.PaymentSelected,this),null!=t.get("SignatureSVG")&&""!=t.get("SignatureSVG")&&(this.paymentHasSignature=!0,t.get("PaymentType")===n.PaymentType.CreditCard&&(this.CCPaymentHasSignature=!0))},AdjustFormSize:function(){this.CCPaymentHasSignature?t("#paymentsListBody").addClass("paymentsListBodyLarge"):this.paymentHasSignature&&t("#paymentsListBody").addClass("paymentsListBodyMedium")},InitializePaymentDetail:function(t){if(this.model=t,t){var e,i=t.get("PaymentType");switch(i){case n.PaymentType.Cash:case"Term Discount":e=this._cashTemplate;break;case n.PaymentType.Check:e=this._checkTemplate;break;case n.PaymentType.CreditCard:e=this._creditCardTemplate;break;case n.PaymentType.Gift:e=this._giftTemplate;break;case n.PaymentType.Loyalty:e=this._loyaltyTemplate}if(e){this.$(".btn-Done").hide(),this.$(".btn-Remove").show(),this.$(".title").html(i),this.$(".popover-left").show(),this.$(".div-paymentsList").hide(),t.get("EncryptedCreditCardNumber")||t.set({EncryptedCreditCardNumber:""});var a=t.clone(),s=function(t,e,i){t=t||"",e=e||0,i=i||0;for(var a="",n=0;n<i;n++)a+="X";return a+t.substring(i,t.length)},l=a.get("SerialLotNumber")||"";l=l.length<=4?s(l,0,l.length):s(l,0,l.length-4),a.set({SerialLotNumber:l}),this.$(".div-paymentDetail").html(e(a.toJSON())),this.$(".div-paymentDetail").show(),this.$("#paymentsListBody").trigger("create"),this.GetSignature(t)}}},PaymentSelected:function(t){this.InitializePaymentDetail(t)},Close:function(){this.Hide(),t("#main-transaction-blockoverlay").hide()},Show:function(){this.render(),this.$el.show(),this.myScroll=new iScroll("paymentsListBody")},Hide:function(){this.$el.hide()},btnDone_tap:function(t){t.preventDefault(),this.Close()},btnRemove_tap:function(t){t.preventDefault(),this.model&&this.model.get("IsNew")?(this.collection.remove(this.model),this.render()):(console.log("Only new payments can be removed."),navigator.notification.alert("Only new payments can be removed.",null,"Action Not Allowed","OK"))},btnBack_tap:function(t){t.preventDefault(),this.render()},GetSignature:function(e){var i=e.get("SignatureSVG");if(i){i.indexOf("[SVGID]:")!==-1&&(i=e.get("SignatureSVGContent"));var a=i,n=new Image;n.src="data:image/svg+xml;base64,"+a,this.$(".signatureDisplay-container").show(),this.$(".signatureDisplay").html(t(n))}}});return y});