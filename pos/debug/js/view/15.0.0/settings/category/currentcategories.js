/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'view/15.0.0/settings/category/currentcategory',
  'text!template/15.0.0/settings/category/currentcategories.tpl.html',
], function($, $$, _, Backbone, CurrentCategoryView, template) {
  var _view = null;
  var CurrentCategoriesView = Backbone.View.extend({
    _template: _.template(template),
    initialize: function() {
      this.collection.bind('reset', this.LoadItems, this);
      this.collection.bind('add', this.AddOneItem, this);
      this.render();
    },

    render: function() {
      this.$el.html(this._template);
      $("#currentCategory").trigger("create");
    },

    LoadItems: function() {
      this.$("#currentCategoryListContainer").empty();
      var _lastCategory = "";

      this.collection.each(function(model) {

        if (model.get("CategoryCode") != _lastCategory) {
          _view = new CurrentCategoryView({
            model: model
          });
          this.$("#currentCategoryListContainer").append(_view.render().el);
        } else {
          model.destroy();
        }

        _lastCategory = model.get("CategoryCode");

      });
      this.$("#currentCategoryListContainer").listview("refresh");
    },

    AddOneItem: function(model) {
      _view = new CurrentCategoryView({
        model: model
      });
      this.$("#currentCategoryListContainer").append(_view.render().el);
    },
  });
  return CurrentCategoriesView;
});
