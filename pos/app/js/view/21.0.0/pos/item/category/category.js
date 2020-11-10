/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/shared',
  'text!template/19.2.0/pos/item/category/category.tpl.html'
], function($, $$, _, Backbone, Shared, template) {
  var CategoryView = Backbone.View.extend({
    _template: _.template(template),
    tagName: "a",
    events: {
      "tap": "SelectCategory",
    },
    initialize: function() {
      this.$el.attr("id", this.model.cid);
      this.$el.attr("data-role", "button");
      this.$el.attr("class", "category-btn cat-btn");
    },

    render: function() {
      this.model.set({
        CategoryDescription: Shared.Escapedhtml(this.model.get("CategoryDescription")),
        FormattedCategoryDescription: Shared.Escapedhtml(this.model.get("CategoryDescription")),
      });

      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },
    SelectCategory: function() {
      this.ResetCategorySelected();
      this.model.select();
      $("#" + this.model.cid).addClass("selected");
    },

    ResetCategorySelected: function() {
      $(".category-btn").removeClass('selected'); //reset everything
    }
  });
  return CategoryView;
});
