/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/15.0.1/settings/general/paymenttype/paymenttype.tpl.html'
], function($, $$, _, Backbone, PaymentTypeTemplate) {
  return Backbone.View.extend({
    _paymentTypeTemplate: _.template(PaymentTypeTemplate),
    tagName: 'li',
    events: {
      "tap": "Selected"
    },

    initialize: function() {
      this.$el.html(this._paymentTypeTemplate(this.model.toJSON()));
    },

    render: function() {
      return this;
    },

    Selected: function() {
      this.model.select();
    }
  });
});
