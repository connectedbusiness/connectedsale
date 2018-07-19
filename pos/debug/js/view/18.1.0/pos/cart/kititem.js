define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'text!template/18.1.0/pos/cart/kititem.tpl.html'
], function($, $$, _, Backbone, Global, template) {

  return Backbone.View.extend({
    template: _.template(template),
    initialize: function() {
      this.$el.attr('id', this.model.get('LineNum'));
      this.$el.attr('style', 'padding: 0px 10px;');
      this.model.set('Price', Global.CurrencySymbol + ' ' + this.model.get('Total').toFixed(2));
      this.$el.html(this.template(this.model.attributes));
    },
    render: function() {
      return this;
    }
  });
});
