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
  'view/19.0.0/settings/category/lookupcategory',
  'text!template/19.0.0/settings/category/lookupcategories.tpl.html',
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
      if (Global.isBrowserMode) {
        Shared.UseBrowserScroll('#category-left-pane-content');
        Shared.UseBrowserScroll('#category-right-pane-content');
      }
      else {
        this.myScroll = new iScroll('category-left-pane-content');
        this.myScroll = new iScroll('category-right-pane-content');
      }
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
      var _collection = collection.pluck('FormattedCategoryDescription');
      
      var _result = _.groupBy(_collection, function(category) {
        return category.charAt(0).toUpperCase();
      });
      
      for (var category in _result) {
        $("#lookupCategoryListContainer").append("<li data-role='list-divider' data-id=" + category + ">" + category + "</li>");
        
        collection.each(function (model) {
          var _category = model.get("FormattedCategoryDescription");
        
          if (_category.charAt(0).toUpperCase() === category.toUpperCase()) {
            this.RenderCollection(model);
          }
        }.bind(this));
      }
      
      
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
