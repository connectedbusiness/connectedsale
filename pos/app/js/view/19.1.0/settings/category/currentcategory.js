/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/shared',
  'text!template/19.1.0/settings/category/category.tpl.html'
], function($, $$, _, Backbone, Shared, template) {
  var CurrentCategoryView = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',
    events: {
      "tap": "SelectCategory",
      "tap #categoryItemDelete-btn": "DeleteCategoryItem"
    },
    initialize: function() {
      this.$el.attr("id", this.model.cid);
      this.$el.attr("class", "currentCategoryLi")
      this.model.bind('remove', this.RemoveItem, this);
    },
    render: function() {
      this.$el.html(this._template(Shared.EscapedModel(this.model).toJSON()));
      this.$("#deletebtn-overlay").show().fadeIn("slow");
      return this;
    },
    DeleteCategoryItem: function() {
      this.model.removeItem();
    },
    RemoveItem: function() {
      this.remove();
    },
    SelectCategory: function(e) {
      e.stopPropagation();
      $(this.el).undelegate('.currentCategoryLi', 'tap');
      this.model.setDefault();
    },
  });
  return CurrentCategoryView;
});
