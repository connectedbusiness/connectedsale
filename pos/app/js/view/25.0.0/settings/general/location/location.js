/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/25.0.0/settings/general/location/location.tpl.html'
], function($, $$, _, Backbone, LocationTemplate) {
  var LocationPreference = Backbone.View.extend({
    _locationTemplate: _.template(LocationTemplate),
    tagName: 'li',
    events: {
      "tap": "Selected"
    },

    initialize: function() {

    },

    render: function() {
      this.$el.attr("id", this.model.cid);
      this.$el.html(this._locationTemplate(this.model.toJSON()));
      return this;
    },

    Selected: function() {      
      this.model.select();
    }
  });
  return LocationPreference;
});
