define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/enum',
  'text!template/18.2.0/pos/kit/kit.tpl.html',
  'shared/method'
], function($, $$, _, Backbone, Global, Enum, template, Method) {
  return Backbone.View.extend({
    template: _.template(template),
    tagName: 'li',
    initialize: function() {
      this.$el.attr('data-icon', false);
      this.model.set('Price', this.getPrice());
      this.model.set('ImageLocation', this.showImage());
      this.model.set('CurrencySymbol', Global.CurrencySymbol);
      this.model.set('cid', this.model.cid);
      this.$el.html(this.template(this.model.attributes));
      this.$el.attr('id', this.model.cid);

      //this.model.on('selected_item', this.setSelectedPrice, this);
    },
    events: {
      "click": "select"
    },
    render: function() {
      return this;
    },
    select: function(e) {
      e.preventDefault();
      var isSelected = this.$el.hasClass("selected");
      if (!isSelected) {
        this.model.trigger('resetSelected');
        $(e.currentTarget).addClass('selected');
        this.model.trigger('selected_option', this.model);
      }
    },
    getPrice: function() {
      return (typeof this.model.get('Price') === "number") ? this.model.get('Price') : 0.00;
    },
    removeSelected: function() {
      this.$el.removeClass('selected');
    },
    showImage: function() {
      return Global.ServiceUrl + Method.IMAGES + this.model.get("ItemKitCode") + ".png?" + Math.random();
    },
    setSelectedPrice: function(data) {
      var sum = data.reduce(function(memo, num) {
        return memo + num.get("Total");
      }, 0);
      this.$el.find("#item-price-" + this.model.cid).find("#h5-" + this.model.cid).html(Global.CurrencySymbol + ' ' + sum);
      // this.model.set("Price",sum);
    }
  });
});
