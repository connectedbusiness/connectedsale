/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/16.0.0/pos/reason/reason.tpl.html'
], function($, $$, _, Backbone, template) {
  var ReasonView = Backbone.View.extend({
    _template: _.template(template),
    tagName: "li",
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
      $("#save-reason").removeClass("ui-disabled");
    }
  });
  return ReasonView;
})
