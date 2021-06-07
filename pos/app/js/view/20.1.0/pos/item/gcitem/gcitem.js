
define([
  'jquery',
  'mobile',
  'backbone',
  'underscore',
  'shared/global',
  'text!template/20.1.0/pos/item/gcitem/gcitem.tpl.html'
], function($, $$, Backbone, _, Global, Template) {
  var GCItemListView = Backbone.View.extend({
    template: _.template(Template),
    tagName: 'li',
    events: {
      "tap": "selected_tap"
    },

    disableItem: function(model) {
      $("#" + model.cid).addClass("ui-disabled");
    },

    selected_tap: function(e) {
      e.preventDefault();
      //$(e.currentTarget).addClass("ui-disabled");
      this.trigger('selected', this.model);
    },

    initialize: function() {
      this.model.on('change:IsSerialGenerated', this.disableItem, this);
      this.$el.attr({
        "id": this.model.cid
      });
    },

    render: function() {
      this.model.set({
        CurrencySymbol: Global.CurrencySymbol,
        SalesPriceRate: (this.model.get("SalesPriceRate")) ? this.model.get("SalesPriceRate") : this.model.get("Price")
      });
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  return GCItemListView;
})
