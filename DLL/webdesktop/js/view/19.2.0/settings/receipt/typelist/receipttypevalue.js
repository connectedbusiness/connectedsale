define(["jquery","mobile","underscore","backbone","text!template/19.2.0/settings/receipt/typelist/receipttypevalue.tpl.html"],function(e,t,i,l,n){var r=l.View.extend({_template:i.template(n),tagName:"li",events:{tap:"Selected"},initialize:function(){this.render()},render:function(){return this.$el.attr("id",this.model.cid),this.$el.html(this._template(this.model.toJSON())),this},Selected:function(e){e.preventDefault(),this.model.select()}});return r});