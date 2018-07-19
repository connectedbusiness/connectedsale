/**
 * Connected Business | 07-09-2012
 * Required: model
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/15.0.0/settings/manager/administrator.tpl.html',
], function($, $$, _, Backbone, template) {
  var ItemView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "change input": "checkbox_change"
    },

    render: function() {
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    checkbox_change: function() {
      var _elementID = this.model.get("EditedRoleCode")
      var _selected = document.getElementById(_elementID).checked;
      this.model.set({
        Selected: _selected
      })
    },

  });
  return ItemView;
});
