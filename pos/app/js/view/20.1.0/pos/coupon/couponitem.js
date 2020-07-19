/**
 * Connected Business | 06-20-2012
 * Required: model
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/19.2.0/pos/coupon/couponitem.tpl.html',
], function($, $$, _, Backbone, template) {
  var CouponItemView = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',

    events: {
      "tap": "Selected"
    },

    render: function() {
      this.ManageBinding();
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    ManageBinding: function() {
      var _displayValue = "";
      switch (this.model.get("DiscountType")) {
        case "Amount":
          _displayValue = this.model.get("DiscountAmount")
          break;
        default:
          _displayValue = this.model.get("DiscountPercent")
          break;
      }
      this.model.set({
        "DisplayDiscount": _displayValue
      }, {
        silent: true
      })
    },

    Selected: function(e) {
      e.preventDefault();
      this.model.select();
    }

  });
  return CouponItemView;
})
