define(["jquery","mobile","underscore","backbone","shared/global","text!template/16.0.0/pos/payment/paymentitem.tpl.html"],function(e,t,a,n,m,r){var l=n.View.extend({_template:a.template(r),tagName:"li",events:{tap:"PaymentSelected"},render:function(){var e=this.model.get("PaymentDate"),t=this.model.get("PaymentType"),a=this.model.get("Mode");return"Refund"==a&&(t=a+" - "+t),e=e?new Date(parseInt(e.substr(6))):new Date,e=this.FormatDate(e),this.model.set({FormattedDate:e,CurrencySymbol:m.CurrencySymbol,FormattedPaymentType:t}),this.$el.html(this._template(this.model.toJSON())),this},FormatDate:function(e){var t=e.getMonth()+1,a=e.getDate(),n=e.getFullYear();return t+"/"+a+"/"+n},PaymentSelected:function(e){e.preventDefault(),this.trigger("paymentSelected",this.model)}});return l});