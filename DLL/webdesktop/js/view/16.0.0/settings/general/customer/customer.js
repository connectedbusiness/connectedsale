define(["jquery","mobile","underscore","backbone","text!template/16.0.0/settings/general/customer/customer.tpl.html"],function(e,t,i,l,n){var r=l.View.extend({_template:i.template(n),tagName:"li",events:{tap:"Selected"},initialize:function(){},render:function(){return this.$el.attr("id",this.model.cid),this.$el.html(this._template(this.model.toJSON())),this},Selected:function(){this.model.select()}});return r});