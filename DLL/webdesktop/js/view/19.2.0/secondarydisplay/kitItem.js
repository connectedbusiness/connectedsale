define(["jquery","mobile","underscore","backbone","shared/global","text!template/19.2.0/secondarydisplay/kititem.tpl.html"],function(t,e,i,l,n,r){return l.View.extend({template:i.template(r),initialize:function(){this.$el.attr("id",this.model.get("LineNum")),this.$el.attr("style","padding: 0px 10px;"),this.model.set("Price",n.CurrencySymbol+" "+this.model.get("Total")),this.$el.html(this.template(this.model.attributes))},render:function(){return this}})});