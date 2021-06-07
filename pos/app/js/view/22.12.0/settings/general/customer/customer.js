/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/22.12.0/settings/general/customer/customer.tpl.html'
], function($, $$, _, Backbone, template) {
  var CustomerPreference = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',
    events: {
      "tap": "Selected"
    },

    initialize: function() {

    },

    render: function() {
      this.$el.attr("id", this.model.cid);
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    Selected: function() {
      this.model.select();
    }
  });
  return CustomerPreference;
});
