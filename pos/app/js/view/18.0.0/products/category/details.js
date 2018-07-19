define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'view/16.0.0/products/category/detail/general',
  'view/16.0.0/products/category/detail/sortorder',
  'text!template/16.0.0/products/category/details.tpl.html',
  'text!template/16.0.0/products/category/detailsmenu.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, Shared, GeneralView, SortOrderView, template, menuTemplate) {

  var _categoryDetailContainer_el = "#categoryDetailsContainer";

  var CategoryDetailView = Backbone.View.extend({
    _template: _.template(template),
    _menuTemplate: _.template(menuTemplate),

    events: {
      'tap #category-General': 'General_Tap'
    },

    initialize: function() {
      this.render();
    },
    General_Tap: function() {
      Global.IsLoaded = false;
      this.SetSelectedTab("General");
      this.generalView = new GeneralView({
        el: $(_categoryDetailContainer_el),
        model: this.model,
        IsReadOnly: this.options.IsReadOnly
      });
      this.generalView.BindToForm(this.mainCategoryView);
    },
    BindToForm: function(categoryView) {
      this.mainCategoryView = categoryView;
    },
    SortOrder_Tap: function() {
      this.SetSelectedTab("SortOrder");
      if (Global.IsLoaded == false) {
        Global.IsLoaded = true;
        this.sortOrderView = new SortOrderView({
          el: $(_categoryDetailContainer_el),
          model: this.model
        });
        this.sortOrderView.LoadScroll();
      }
    },

    SetSelectedTab: function(type) {

      this.$("#category-General").removeClass("selectedCategory ");
      this.$("#category-General").addClass("unSelectedCatagory");
      this.$("#category-SortOrder").removeClass("selectedCategory");
      this.$("#category-SortOrder").addClass("unSelectedCatagory");
      this.$("#category-" + type).removeClass("unSelectedCatagory");
      this.$("#category-" + type).addClass("selectedCategory");
      this.$("#category-" + type).css("color", "black");


    },
    render: function() {
      this.$el.html(this._template);
      Global.IsNewCatagory = true;
    },
    InitializeChildViews: function() {
      if (this.model) {
        this.$("#categoryDetails > #categoryMenu").html(this._menuTemplate);
        this.SetSelectedTab("General");
        this.General_Tap();
      } else {
        this.DisplayNoRecordFound();
      }

    },

    DisplayNoRecordFound: function() {
      Shared.Products.DisplayNoRecordFound("#right-panel", ".list-wrapper", this.toBeSearched);
    },


  });
  return CategoryDetailView;
})
