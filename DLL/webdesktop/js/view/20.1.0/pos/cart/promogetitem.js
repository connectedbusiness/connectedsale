define(["jquery","mobile","underscore","backbone","shared/global","text!template/20.1.0/pos/cart/promogetitem.tpl.html"],function(t,e,i,n,m,l){return n.View.extend({template:i.template(l),initialize:function(){this.$el.html(this.template({GetItemName:this.model.GetItemName,Quantity:this.options.getItemQty}))},render:function(){return this}})});