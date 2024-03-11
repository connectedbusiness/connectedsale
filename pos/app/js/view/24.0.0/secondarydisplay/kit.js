define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/enum',
  'collection/base',
  'view/24.0.0/secondarydisplay/kitItem',
  'text!template/24.0.0/secondarydisplay/kit.tpl.html'
], function($, $$, _, Backbone, Global, Enum, BaseCollection, KitItemView, template) {

  return Backbone.View.extend({
    template: _.template(template),
    tagName: 'tbody',
    initialize: function() {
      this.$el.html(this.template({
        id: this.options.id
      }));
      this.$el.attr('id', 'kit-' + this.options.id);
      this.$el.attr('class', 'cartKitDetails');
      this.$el.attr('style', 'box-shadow:0px 8px 7px #CFCFCF inset;');

      if (Global.TransactionType == Enum.TransactionType.SalesRefund) {
        this.$el.find('#kit-edit').hide();
        this.$el.find('#items').attr('colspan', 8);
        this.$el.find('#summary').attr('colspan', 8);
      }
    },
    renderItems: function() {
      var itemCount = this.collection.length;
      this.collection.each(this.renderItem, this);

      this.$el.find('#summary').find('div:first-child').html(itemCount + ' item(s)');
    },
    renderItem: function(model, i) {
      model.set('LineNum', i + 1);
      var kitItemView = new KitItemView({
        model: model
      });

      this.$el.find('#items').append(kitItemView.render().el);
    },
    render: function() {
      setTimeout(function() {
        this.renderItems();
      }.bind(this), 100);
      return this;
    }
  });
});
