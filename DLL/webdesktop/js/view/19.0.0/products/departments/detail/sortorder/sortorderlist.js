define(["jquery","mobile","underscore","backbone","text!template/19.0.0/products/departments/detail/sortorder/sortorderlist.tpl.html"],function(e,t,r,i,n){var o=i.View.extend({_template:r.template(n),initialize:function(){this.render()},render:function(){this.$el.append(this._template(this.model.toJSON()))}});return o});