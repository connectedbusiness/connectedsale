define(["jquery","mobile","underscore","bigdecimal","backbone","shared/global","text!template/19.1.0/pos/cart/total.tpl.html","js/libs/format.min.js"],function(t,e,o,a,i,l,n){var s=i.View.extend({_template:o.template(n),initialize:function(){this.type=this.options.type,this.collection.on("change",this.UpdateTotal,this),this.collection.on("add",this.UpdateTotal,this),this.collection.on("remove",this.UpdateTotal,this),this.model.on("add",this.UpdateTotal,this),this.model.on("change",this.UpdateTotal,this),this.model.on("remove",this.UpdateTotal,this),this.render()},UpdateTotal:function(){this.render()},render:function(){var t=format("0.0000",this.collection.totalTax()),e=format("0.0000",this.collection.total());t=parseFloat(this.RoundNumber(format("0.00000",t),4)),total=parseFloat(e)+parseFloat(t),total=parseFloat(this.RoundNumber(format("0.00000",total),2)),this.$el.html(this._template({CurrencySymbol:l.CurrencySymbol,Total:format("#,##0.00",total)}))},RoundNumber:function(t,e){var o=new a.BigDecimal(t);return o.setScale(e,a.MathContext.ROUND_HALF_UP)}});return s});