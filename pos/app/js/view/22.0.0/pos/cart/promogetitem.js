define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'text!template/22.0.0/pos/cart/promogetitem.tpl.html'
], function($, $$, _, Backbone, Global, template) {

  return Backbone.View.extend({
    template: _.template(template),
    initialize: function() {                  
      this.$el.html(this.template({        
        GetItemName: this.model.GetItemName,
        Quantity: this.options.getItemQty
      }));
    },
    render: function() {
      return this;
    }
  });
});
