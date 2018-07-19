/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/shared',
  'text!template/15.1.0/pos/item/header-info/shipto/shipto.tpl.html'
], function($, $$, _, Backbone, Shared, template) {
  var ShipToView = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',
    events: {
      "tap": "ViewDetail",
      "tap #select-shipto-btn": "Selected",
      "tap #select-shipto": "Selected",
    },

    initialize: function() {},

    render: function() {
      var address = "";
      if (!Shared.IsNullOrWhiteSpace(this.model.get("Address"))) {
        address = this.model.get("Address");
        address = address.substr(0, 40) + "...";
      }
      this.model.set({
        DisplayAddress: address
      });
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    Selected: function(e) {
      e.stopPropagation();
      this.model.select();
    },

    ViewDetail: function(e) {
      e.stopPropagation();
      this.model.viewDetail();
    }

  });
  return ShipToView;
});
