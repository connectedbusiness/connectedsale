/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/24.0.0/settings/general/posshippingmethod/posshippingmethod.tpl.html'
], function($, $$, _, Backbone, POSShippingMethodTemplate) {
  var POSShippingMethodPreference = Backbone.View.extend({
    _posshippingmethodTemplate: _.template(POSShippingMethodTemplate),
    tagName: 'li',
    events: {
      "tap": "Selected"
    },

    initialize: function() {

    },

    render: function() {
      this.$el.attr("id", this.model.cid);
      this.$el.html(this._posshippingmethodTemplate(this.model.toJSON()));
      return this;
    },

    Selected: function() {      
      this.model.select();
    }
  });
  return POSShippingMethodPreference;
});
