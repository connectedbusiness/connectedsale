define(["jquery","mobile","underscore","backbone","shared/global","text!template/19.2.0/products/controls/generic-item.tpl.html"],function(e,t,i,n,o,r){var l=n.View.extend({_product:i.template(r),initialize:function(){this.$el.show()},render:function(){return this.model.set({ViewID:this.cid}),this.$el.html(this._product(this.model.toJSON())),this},Show:function(){this.render()}});return l});