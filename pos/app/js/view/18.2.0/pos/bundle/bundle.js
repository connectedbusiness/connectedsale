define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/enum',
  'text!template/18.2.0/pos/bundle/bundle.tpl.html'
], function($, $$, _, Backbone, Global, Enum, template) {
  return Backbone.View.extend({
    template: _.template(template),
    tagName: 'li',
    initialize: function() {
      this.$el.attr('data-icon', false);
      this.model.set('Price', this.getPrice());
      this.$el.html(this.template(this.model.attributes));
      this.$el.attr('id', this.model.cid);
    },
    events: {
      "click": "select"
    },
    render: function() {
      return this;
    },
    select: function(e) {
      e.preventDefault();
      this.model.trigger('resetSelected');

      $(e.currentTarget).addClass('selected');
      if (this.model.get('ItemType') === Enum.ItemType.MatrixGroup) {
        this.model.trigger('selected_matrix', this.model);
      } else {
        this.model.trigger('selected_stock', this.model);
      }
    },
    getPrice: function() {
      var pricing = Global.CurrentCustomer.DefaultPrice ? Global.CurrentCustomer.DefaultPrice : Global.Preference.CustomerDefaultPrice;
      if (pricing === 'Retail') {
        return Global.CurrencySymbol + this.model.get('RetailPrice').toFixed(2);
      } else {
        return Global.CurrencySymbol + this.model.get('WholeSalePrice').toFixed(2);
      }
    },
    removeSelected: function() {
      this.$el.removeClass('selected');
    }
  });
});
