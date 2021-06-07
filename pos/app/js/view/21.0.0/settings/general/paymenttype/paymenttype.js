/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/21.0.0/settings/general/paymenttype/paymenttype.tpl.html'
], function($, $$, _, Backbone, PaymentTypeTemplate) {
  return Backbone.View.extend({
    _paymentTypeTemplate: _.template(PaymentTypeTemplate),
    tagName: 'li',
    events: {
      "tap": "Selected"
    },

    initialize: function() {
      this.$el.attr("id", this.model.cid);
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
