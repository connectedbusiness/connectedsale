/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/21.0.0/settings/receipt/print/printerlistvalue.tpl.html'
], function($, $$, _, Backbone, template) {
  var PrinterListValue = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',
    events: {
      "tap": "Selected"
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.attr("id", this.model.cid);
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    Selected: function(e) {
      e.preventDefault();
      this.model.select();
    }
  });
  return PrinterListValue;
});

