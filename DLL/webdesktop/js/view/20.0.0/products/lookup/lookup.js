define(["jquery","mobile","underscore","backbone","text!template/20.0.0/products/lookup/lookup.tpl.html"],function(e,t,i,n,l){var o=n.View.extend({_template:i.template(l),initialize:function(){this.render()},render:function(){this.$el.html(this._template())},InitializeChildViews:function(){}});return o});