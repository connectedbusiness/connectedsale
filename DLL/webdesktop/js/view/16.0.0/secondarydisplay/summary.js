define(["jquery","mobile","underscore","backbone","shared/global","text!template/16.0.0/secondarydisplay/summary.tpl.html"],function(e,t,l,r,n,m){var a=r.View.extend({_template:l.template(m),render:function(e){return null==e&&(e=this.model.toJSON()),e.CurrencySymbol=n.CurrencySymbol,this.$el.html(this._template(e)),this}});return a});