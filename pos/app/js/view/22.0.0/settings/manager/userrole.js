/**
 * Connected Business | 07-09-2012
 * Required: model
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/23.0.0/settings/manager/userrole.tpl.html',
], function($, $$, _, Backbone, template) {
  var UserRoleView = Backbone.View.extend({
    _template: _.template(template),
    tagName: "span",

    events: {
      "change input": "radio_change"
    },

    render: function() {
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    radio_change: function() {
      var _roleCode = this.model.get("RoleCode");
      var _selected = document.getElementById(_roleCode).checked;
      if (_selected) {
        this.trigger("Selected", _roleCode, this);
      }
    },

  });
  return UserRoleView;
});
