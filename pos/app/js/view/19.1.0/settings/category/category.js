/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/19.1.0/settings/category/category.tpl.html'
], function($, $$, _, Backbone, template) {
  var CategoryView = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',
    events: {
      "tap": "SelectCategory",
    },
    initialize: function() {
      this.$el.attr("id", this.model.cid);
      this.model.bind('remove', this.RemoveItem, this);
    },
    render: function() {
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },
    RemoveItem: function() {
      this.remove();
    },
    SelectCategory: function() {
      this.model.select();
    },
  });
  return CategoryView;
});
