define(["jquery","mobile","underscore","backbone","text!template/15.1.0/products/controls/generic-item.tpl.html"],function(t,e,i,n,o){var r=n.View.extend({_product:i.template(o),initialize:function(){this.$el.show()},render:function(){return this.model.set({ViewID:this.cid}),this.$el.html(this._product(this.model.toJSON())),this},Show:function(){this.render()}});return r});