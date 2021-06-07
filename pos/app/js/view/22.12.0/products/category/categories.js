define([
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'model/base',
  'model/lookupcriteria',
  'collection/base',
  'view/22.12.0/products/category/details',
  'view/22.12.0/products/category/detail/addcategory',
  'view/22.12.0/products/controls/generic-list',
  'text!template/22.12.0/products/category/categories.tpl.html',
  'text!template/22.12.0/products/controls/generic-layout.tpl.html'
], function(Backbone, Global, Service, Method,
  BaseModel, LookUpCriteriaModel,
  BaseCollection, CategoryDetailView, AddCategoryView,
  GenericListView,
  CategoryTemplate, GenericLayOutTemplate) {

  var _currentForm = "",
    _proceed = false;
  var proceedToSearch = function(button) {
    if (button === 1) {
      _currentForm.LoadSearchItem();
    }
  };
  var proceedToSelectedItem = function(button) {
    if (button === 1) {
      _currentForm.LoadSelectedItem();
    }
  };

  var ClassID = {
    SearchInput: "#txt-search",
    CategoryForm: "#categories-form"
  }

  var CategoryView = Backbone.View.extend({

    _categoriesFormTemplate: _.template(CategoryTemplate),
    _genericLayoutTemplate: _.template(GenericLayOutTemplate),

    initialize: function() {},

    render: function() {
      this.$el.html(this._categoriesFormTemplate);
      this.$(ClassID.CategoryForm).html(this._genericLayoutTemplate);
      _currentForm = this;
      return this;
    },

    btnSearch: function(e) {
      this.LoadItems($(ClassID.SearchInput).val());
    },

    Show: function() {
      this.LoadItems();
      this.render();
    },
    InitializeCategoryLookUp: function() {
      if (!this.categoryLookUp) {
        this.categoryLookUp = new LookUpCriteriaModel();
        this.categoryLookUp.on('sync', this.CategoryLookUpLoadSuccess, this);
        this.categoryLookUp.on('error', this.CategoryLookUpLoadError, this);
      }
    },
    CategoryLookUpLoadSuccess: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.categories = new BaseCollection();
      this.categories.reset(response.SystemCategories);
      this.DisplayItemList();
    },
    HasChanges: function() {
      if (Global.FormHasChanges) {
        this.UnloadConfirmationMessage = "Do you want to cancel Adding new Category?";
        return true;
      }
    },
    AddCategory: function() {
      if (Global.FormHasChanges === false) {
        if (!this.IsNullOrWhiteSpace(this.addnewCategory)) {
          this.addnewCategory.unbind();
        }
        this.addnewCategory = new AddCategoryView({
          el: $("#right-panel"),
        });
        this.addnewCategory.InitializeChildViews();
        this.addnewCategory.BindToForm(this);
        Global.FormHasChanges = true;
      }

    },
    CategoryLookUpLoadError: function(model, error, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
    },
    IsNullOrWhiteSpace: function(str) {
      if (!str) {
        return true;
      }
      if (str === "" || str === null || str === undefined) {
        return true;
      }
      return false;
    },
    LoadItems: function(_categoryCode, newModel) {
      if (!this.IsNullOrWhiteSpace(newModel)) {
        this.isNewLyAdded = true;
        this.newModel = newModel;
      }

      this.InitializeCategoryLookUp();
      var _rowsToSelect = 1000;
      this.categoryLookUp.clear();
      this.categoryLookUp.set({
        StringValue: _categoryCode
      });
      var _self = this;
      this.categoryLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETCATEGORYDETAILS + _rowsToSelect;
      this.categoryLookUp.save();

    },
    GetFirstItem: function() {
      var _model = new BaseModel();
      if (!this.IsNullOrWhiteSpace(this.isNewLyAdded) || this.isNewLyAdded == true) {
        _model.set(this.newModel);
      } else {
        _model = this.genericListView.GetFirstModel();
      }
      if (!this.IsNullOrWhiteSpace(this.categoryDetailView)) {
        this.categoryDetailView.unbind();
      }
      this.categoryDetailView = new CategoryDetailView({
        el: $("#right-panel"),
        model: _model,
        IsReadOnly: this.options.IsReadOnly
      });

      this.categoryDetailView.toBeSearched = this.genericListView.GetItemToSearch();
      this.categoryDetailView.BindToForm(this);
      this.categoryDetailView.InitializeChildViews();
      this.isNew = false;

      if (!this.IsNullOrWhiteSpace(this.isNewLyAdded) || this.isNewLyAdded == true) {
        this.SelectNewlyAddedItem()
      }
    },

    DisplayItemList: function() {
      if (!this.genericListView) {
        this.genericListView = new GenericListView({
          el: "#left-panel",
          DisableAdd: this.options.IsReadOnly
        });
        this.genericListView.on("search", this.SearchItem, this);
        this.genericListView.on("selected", this.SelectedItem, this);
        this.genericListView.on("add", this.AddCategory, this);
        this.genericListView.on('loaded', this.GetFirstItem, this);
        this.genericListView.collection = this.categories;
        this.genericListView.SetPlaceHolder("Search Categories");
        this.genericListView.SetDisplayField("CategoryCode");
        this.genericListView.Show();
      } else {
        this.genericListView.RefreshList(this.categories);
      }
    },

    SearchItem: function() {
      if (this.genericListView) {
        if (Global.FormHasChanges == true) {
          navigator.notification.confirm("Do you want to cancel changes?", proceedToSearch, "Confirmation", ['Yes', 'No']);
        } else {
          this.LoadSearchItem();
        }
      }

    },

    LoadSearchItem: function() {
      this.LoadItems(this.genericListView.GetItemToSearch());
      Global.FormHasChanges = false;
    },
    SelectNewlyAddedItem: function() {
      var _model = new BaseModel();
      _model.set(this.newModel);
      this.genericListView.SelectByAttribute("CategoryCode", _model.get("CategoryCode"));
      this.LoadSelectedItem(this.newModel);
      this.newModel = null;
      this.isNewLyAdded = false;
    },
    LoadSelectedItem: function(model) {
      if (!model) {
        this.categoryModel = this.genericListView.GetSelectedModel();
      } else {
        var newModel = new BaseModel();
        newModel.set(model);
        this.categoryModel = newModel;
      }
      if (!this.IsNullOrWhiteSpace(this.categoryDetailView)) {
        this.categoryModel.unbind();
      }
      this.categoryDetailView = new CategoryDetailView({
        el: $("#right-panel"),
        model: this.categoryModel,
        IsReadOnly: this.options.IsReadOnly
      });

      this.categoryDetailView.BindToForm(this);
      this.categoryDetailView.InitializeChildViews();
      Global.FormHasChanges = false;
    },

    SelectedItem: function() {
      if (this.genericListView) {
        if (Global.FormHasChanges == true) {
          navigator.notification.confirm("Do you want to cancel changes?", proceedToSelectedItem, "Confirmation", ['Yes', 'No']);
        } else {
          this.LoadSelectedItem();
        }
      }
    }


  });

  return CategoryView;
});
