define(["jquery","mobile","underscore","backbone","text!template/19.0.0/settings/general/posshippingmethod/posshippingmethod.tpl.html"],function(e,t,i,n,s){var l=n.View.extend({_posshippingmethodTemplate:i.template(s),tagName:"li",events:{tap:"Selected"},initialize:function(){},render:function(){return this.$el.attr("id",this.model.cid),this.$el.html(this._posshippingmethodTemplate(this.model.toJSON())),this},Selected:function(){this.model.select()}});return l});