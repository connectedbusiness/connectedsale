define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'text!template/18.1.0/pos/cart/promobuyitem.tpl.html'
], function($, $$, _, Backbone, Global, template) {

  return Backbone.View.extend({
    template: _.template(template),
    initialize: function() {            
      this.$el.html(this.template({        
        BuyItemName: this.model.BuyItemName,
        Quantity: this.model.BuyQuantity * this.options.getItemQty
      }));
    },
    render: function() {
      return this;
    }
  });
});
