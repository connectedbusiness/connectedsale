define(["jquery","mobile","underscore","backbone","text!template/19.0.0/settings/general/paymenttype/paymenttype.tpl.html"],function(e,t,n,i,l){return i.View.extend({_paymentTypeTemplate:n.template(l),tagName:"li",events:{tap:"Selected"},initialize:function(){this.$el.attr("id",this.model.cid),this.$el.html(this._paymentTypeTemplate(this.model.toJSON()))},render:function(){return this},Selected:function(){this.model.select()}})});