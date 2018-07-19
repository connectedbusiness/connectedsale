/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'text!template/18.1.0/pos/itemdetail/accessory/accessorydetail.tpl.html'
], function($, $$, _, Backbone, Global, template) {
  var AccessoryDetail = Backbone.View.extend({
    _AccessoryDetailTemplate: _.template(template),
    events: {
      "tap #li-onhand": "Selected"
    },

    initialize: function() {},

    render: function(model) {
      this.model = model;
      this.model.set({
        CurrencySymbol: Global.CurrencySymbol,
      });
      this.$el.html(this._AccessoryDetailTemplate(this.model.toJSON()));
      this.DisplayWholesalePrice();
      return this;
    },

    DisplayWholesalePrice: function() {
      switch (Global.Preference.ShowWholesalePrice) {
        case true:
          this.$(".li-wholesalePrice").show();
          break;
        case false:
          this.$(".li-wholesalePrice").hide();
          break;
      }
    },

    Selected: function() {
      this.model.onHand();
    }
  });
  return AccessoryDetail;
});
