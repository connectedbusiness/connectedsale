/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/20.1.0/settings/receipt/typelist/receipttypevalue.tpl.html'
], function($, $$, _, Backbone, template) {
  var ReceiptTypeValuePreference = Backbone.View.extend({
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
  return ReceiptTypeValuePreference;
});
