define(["jquery","mobile","underscore","backbone","text!template/22.0.0/pos/reason/reason.tpl.html"],function(e,t,l,n,a){var s=n.View.extend({_template:l.template(a),tagName:"li",events:{tap:"Selected"},render:function(){return this.$el.html(this._template(this.model.toJSON())),this},Selected:function(t){t.preventDefault(),this.model.select(),e("#save-reason").removeClass("ui-disabled")}});return s});