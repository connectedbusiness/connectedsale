define(["jquery","mobile","underscore","backbone","text!template/20.1.0/settings/general/taxscheme/taxscheme.tpl.html"],function(e,t,i,n,l){var a=n.View.extend({_template:i.template(l),tagName:"li",events:{tap:"Selected"},initialize:function(){},render:function(){return this.$el.html(this._template(this.model.toJSON())),this},Selected:function(){this.model.trigger("selected",this.model)}});return a});