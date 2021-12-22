define(["jquery","mobile","underscore","backbone","shared/enum","shared/global","shared/shared","text!template/20.1.0/pos/transactions/invoice.tpl.html","text!template/20.1.0/pos/transactions/order.tpl.html","text!template/20.1.0/pos/transactions/return.tpl.html"],function(e,t,o,a,r,s,n,i,d,l){var m=a.View.extend({_InvoiceTemplate:o.template(i),_OrderTemplate:o.template(d),_ReturnTemplate:o.template(l),tagName:"tr",id:"tr-transaction",events:{tap:"transaction_tap"},initialize:function(){this.model.bind("change",this.UpdateCart,this),this.model.bind("remove",this.RemoveItemFromCart,this),this.model.on("destroy-view",this.destroy,this)},destroy:function(){this.unbind(),this.remove()},render:function(){var e,t,o;switch(s.LookupMode){case r.LookupMode.Invoice:e=this.model.get("InvoiceDate"),t=this.model.get("InvoiceCode"),o=this._InvoiceTemplate;break;case r.LookupMode.Order:e=this.model.get("SalesOrderDate"),t=this.model.get("SalesOrderCode"),o=this._OrderTemplate;break;case r.LookupMode.Quote:e=this.model.get("SalesOrderDate"),t=this.model.get("SalesOrderCode"),o=this._OrderTemplate;break;case r.LookupMode.Return:e=this.model.get("ReturnDate"),t=this.model.get("ReturnCode"),o=this._ReturnTemplate;break;case r.LookupMode.Suspend:e=this.model.get("InvoiceDate"),t=this.model.get("InvoiceCode"),o=this._InvoiceTemplate}e=new Date(parseInt(e.substr(6)));var a=e.getMonth()+1,i=e.getDate(),d=e.getFullYear(),l=n.Escapedhtml(this.model.get("BillToName"));return e=a+"/"+i+"/"+d,this.model.set({FormattedBillToName:l,FormattedDate:e,TransactionCode:t,TransactionType:s.LookupMode,CurrencySymbol:s.CurrencySymbol}),this.$el.html(o(this.model.toJSON())),this},transaction_tap:function(e){e.preventDefault(),e.stopPropagation();var t=e.offsetX?e.offsetX:e.pageX-document.getElementById("tr-transaction").offsetLeft,o=e.offsetY?e.offsetY:e.pageY-document.getElementById("tr-transaction").offsetTop;if(s.isBrowserMode){var a=navigator.userAgent.toLowerCase().indexOf("chrome")>-1;if(a){var r=new Number,n=new Number;r=e.clientX,n=e.clientY,t=r,o=n}}this.SelectTransaction(t,o)},SelectTransaction:function(e,t){this.model.select(e,t)}});return m});