/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/22.12.0/settings/general/gateway/gateway.tpl.html'
], function($, $$, _, Backbone, GatewayTemplate) {
  var GatewayPreference = Backbone.View.extend({
    _gatewayTemplate: _.template(GatewayTemplate),
    tagName: 'li',
    events: {
      "tap": "Selected"
    },

    initialize: function() {

    },

    render: function() {
      this.$el.attr("id", this.model.cid);
      this.$el.html(this._gatewayTemplate(this.model.toJSON()));
      return this;
    },

    Selected: function() {
      this.model.select();
    }
  });
  return GatewayPreference;
});
