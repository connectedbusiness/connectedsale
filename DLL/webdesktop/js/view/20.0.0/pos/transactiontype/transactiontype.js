define(["jquery","mobile","underscore","backbone","shared/global","shared/enum","text!template/20.0.0/pos/transactiontype/transactiontype.tpl.html"],function(e,t,n,a,s,r,i){var o=a.View.extend({_template:n.template(i),className:"popover",id:"transaction-popover",attributes:{style:"display: none;"},events:{"tap li":"SelectTransactionType"},render:function(e){return this.$el.html(this._template()),this},SelectTransactionType:function(e){e.preventDefault();var t,n=e.target.id;switch(n){case"transType-Sale":t=r.TransactionType.Sale,s.Preference.DefaultPOSTransaction=0;break;case"transType-Order":t=r.TransactionType.Order,s.Preference.DefaultPOSTransaction=1;break;case"transType-Quote":if(this.HasPayment){var a="Current transaction already has payment. Change to 'Quote' is not allowed.";return console.log(a),void navigator.notification.alert(a,null,"Action Not Allowed","OK")}t=r.TransactionType.Quote,s.Preference.DefaultPOSTransaction=2;break;case"transType-Return":t=r.TransactionType.Return,s.Preference.DefaultPOSTransaction=3}this.trigger("transactionTypeChanged",t),this.Close()},Close:function(){this.Hide()},ApplyStyle:function(e,t,n){n?(e.css({color:"#324f85"}),t.css({visibility:"visible"})):(e.css({color:"#333333"}),t.css({visibility:"hidden"}))},ApplySelectedTransactionStyle:function(e){switch(this.ApplyStyle(this.$("#transType-Sale"),this.$("#transType-Sale .icon-ok"),!1),this.ApplyStyle(this.$("#transType-Order"),this.$("#transType-Order .icon-ok"),!1),this.ApplyStyle(this.$("#transType-Quote"),this.$("#transType-Quote .icon-ok"),!1),this.ApplyStyle(this.$("#transType-Return"),this.$("#transType-Return .icon-ok"),!1),e){case r.TransactionType.Sale:this.ApplyStyle(this.$("#transType-Sale"),this.$("#transType-Sale .icon-ok"),!0);break;case r.TransactionType.Order:this.ApplyStyle(this.$("#transType-Order"),this.$("#transType-Order .icon-ok"),!0);break;case r.TransactionType.Quote:this.ApplyStyle(this.$("#transType-Quote"),this.$("#transType-Quote .icon-ok"),!0);break;case r.TransactionType.Return:this.ApplyStyle(this.$("#transType-Return"),this.$("#transType-Return .icon-ok"),!0)}},Enabled:function(){s.Preference.AllowSales===!1&&this.$("#transType-Sale").hide(),s.Preference.AllowOrders===!1&&this.$("#transType-Order").hide(),s.Preference.AllowQuotes===!1&&this.$("#transType-Quote").hide(),s.Preference.AllowReturns===!1&&this.$("#transType-Return").hide()},Show:function(e,t){this.Enabled(),this.HasPayment=t,this.ApplySelectedTransactionStyle(e),this.$el.show()},Hide:function(){this.$el.hide()}});return o});