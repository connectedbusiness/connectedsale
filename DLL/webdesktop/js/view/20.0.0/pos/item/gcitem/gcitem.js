define(["jquery","mobile","backbone","underscore","shared/global","text!template/20.0.0/pos/item/gcitem/gcitem.tpl.html"],function(e,t,i,l,s,a){var d=i.View.extend({template:l.template(a),tagName:"li",events:{tap:"selected_tap"},disableItem:function(t){e("#"+t.cid).addClass("ui-disabled")},selected_tap:function(e){e.preventDefault(),this.trigger("selected",this.model)},initialize:function(){this.model.on("change:IsSerialGenerated",this.disableItem,this),this.$el.attr({id:this.model.cid})},render:function(){return this.model.set({CurrencySymbol:s.CurrencySymbol,SalesPriceRate:this.model.get("SalesPriceRate")?this.model.get("SalesPriceRate"):this.model.get("Price")}),this.$el.html(this.template(this.model.toJSON())),this}});return d});