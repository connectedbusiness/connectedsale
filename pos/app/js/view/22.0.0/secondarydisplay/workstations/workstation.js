/**
 * Connected Business | 5-14-2013
 * Required: model
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/19.2.0/secondarydisplay/workstations/workstation.tpl.html',
], function($, $$, _, Backbone, template) {
  var WorkstationItemView = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',

    events: {
      "tap": "Selected"
    },

    render: function() {
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    Selected: function(e) {
      e.preventDefault();
      this.model.select();
    }

  });
  return WorkstationItemView;
})
