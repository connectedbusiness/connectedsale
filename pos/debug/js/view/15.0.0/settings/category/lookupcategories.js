/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'view/15.0.0/settings/category/lookupcategory',
  'text!template/15.0.0/settings/category/lookupcategories.tpl.html',
  'js/libs/iscroll.js',
], function($, $$, _, Backbone, Global, Shared, LookupCategoryView, template) {
  var collection, current;
  var LookupCategoriesView = Backbone.View.extend({
    _template: _.template(template),
    initialize: function() {
      this.collection.bind('reset', this.LoadItems, this);
      this.collection.bind('add', this.AddOneItem, this);
      collection = this.collection;
      current = this.options.currentCollection;
      this.render();
    },

    render: function() {
      this.$el.html(this._template);
      this.$("#lookupCategoryListContainer").empty();
      $("#lookupCategory").trigger("create");
    },

    LoadItems: function() {
      this.CheckDupe();
      this.GetCategoryItem(collection);
      if (Global.isBrowserMode) Shared.UseBrowserScroll('#right-pane-content');
      else this.myScroll = new iScroll('right-pane-content');
    },

    CheckDupe: function() {
      current.each(this.RemoveDupe, this);
    },

    AddOneItem: function(model) {
      this.view = new LookupCategoryView({
        model: model
      });
      this.$("#lookupCategoryListContainer").append(this.view.render().el);
    },

    RemoveDupe: function(model) {
      collection.each(function(category) {
        if (model.get("CategoryCode") === category.get("CategoryCode")) {
          collection.remove(category);
        }
      });
    },

    GetCategoryItem: function(collection) {
      collection.each(this.RenderCollection);
      $("#lookupCategoryListContainer").listview("refresh");
    },

    RenderCollection: function(category) {
      this.categoryView = new LookupCategoryView({
        model: category
      });
      this.$("#lookupCategoryListContainer").append(this.categoryView.render().el);
    },
  });
  return LookupCategoriesView;
});
