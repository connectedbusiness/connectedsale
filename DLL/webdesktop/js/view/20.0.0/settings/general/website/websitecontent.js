define(["jquery","mobile","underscore","backbone","text!template/20.0.0/settings/general/website/websitecontent.tpl.html"],function(e,t,i,n,l){var s=n.View.extend({_template:i.template(l),tagName:"li",events:{tap:"Selected"},initialize:function(){this.render()},render:function(){return this.$el.attr("id",this.model.cid),this.$el.html(this._template(this.model.toJSON())),this},Selected:function(){this.model.select()}});return s});