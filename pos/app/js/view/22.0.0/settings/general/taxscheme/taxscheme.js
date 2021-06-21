/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/22.0.0/settings/general/taxscheme/taxscheme.tpl.html'
], function($, $$, _, Backbone, template) {
  var TaxSchemePreference = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',
    events: {
      "tap": "Selected"
    },

    initialize: function() {

    },

    render: function() {
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    Selected: function() {
      this.model.trigger('selected', this.model);
    }
  });
  return TaxSchemePreference;
});
