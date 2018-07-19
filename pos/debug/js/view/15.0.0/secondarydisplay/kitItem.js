define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'text!template/15.0.0/secondarydisplay/kititem.tpl.html'
], function($, $$, _, Backbone, Global, template) {

  return Backbone.View.extend({
    template: _.template(template),
    initialize: function() {
      this.$el.attr('id', this.model.get('LineNum'));
      this.$el.attr('style', 'padding: 0px 10px;');
      this.model.set('Price', Global.CurrencySymbol + ' ' + this.model.get('Total'));
      this.$el.html(this.template(this.model.attributes));
    },
    render: function() {
      return this;
    }
  });
});
