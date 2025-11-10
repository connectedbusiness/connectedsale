define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/lookupcriteria',
  'model/base',
  'collection/base',
  'text!template/26.0.0/products/category/detail/general.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, Shared, LookUpCriteriaModel, BaseModel, CategoryCollection, template) {

  var _proceed = false,
    _categoryForm;

  var deleteCategory = function(button) {
    if (button === 1) {
      //_categoryForm.ValidateRemoveCategory(); // removed : 06.11.13 : CSL - 9272
      _categoryForm.RemoveCategoryAccepted();
    } else {
      _categoryForm.CancelAction();
    }
  };

  var CategoryGeneralView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap #categorySaveBtn": "SaveCategory",
      "tap #categoryRemoveBtn": "RemoveCategory"
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(this._template);
      this.InitializeGeneralView();
      Global.FormHasChanges = false;
      Global.IsSaveChanges = false;
      $("categoryStatus-div").trigger('create');
      _categoryForm = this;
      this.CheckReadOnlyMode();
    },

    CheckReadOnlyMode: function() {
      if (this.options.IsReadOnly) {
        $("#categorySaveBtn").addClass('ui-disabled');
        $("#categoryRemoveBtn").addClass('ui-disabled');

        $("#description").addClass('ui-readonly');
        $("#categoryCode").addClass('ui-readonly');
        $("#cmbParentCategory").addClass('ui-readonly');
      }
    },

    InitializeChildViews: function() {},

    BindToForm: function(categoryView) {
      this.mainCategoryView = categoryView;
    },

    InitializeGeneralView: function() {
      this.InitializeParentCategories();
      this.DisplayDetails();
    },



    DisplayDetails: function() {
      if (this.model) {
        $("#description").val(this.model.get("Description"));
        $("#categoryCode").val(this.model.get("CategoryCode"));
        $("#cmbParentCategory").val(this.model.get("ParentCategory"));
      }

    },
    CancelAction: function() {
      Global.IsSaveChanges = false;
    },

    InitializeParentCategories: function() {
      //if (!this.parentCategoryModel) {
      var _rowsToSelect = 1000;
      var _self = this;
      this.parentCategoryModel = new LookUpCriteriaModel();
      this.parentCategoryModel.url = Global.ServiceUrl + Service.PRODUCT + Method.GETCATEGORYDETAILS + _rowsToSelect;
      this.parentCategoryModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.LoadParentCategories(response.SystemCategories);
          //_self.LoadCategoryDetails();
        },
        error: function() {
          Shared.Products.RequestTimeOut();
        }
      });
      //}
    },

    LoadParentCategories: function(response) {
      if (!this.categoryParentCollection) this.categoryParentCollection = new CategoryCollection();
      $('#cmbParentCategory > option[val !=""]').remove();
      this.categoryParentCollection.reset(response);
      this.categoryParentCollection.comparator = function(_collection) {
        return _collection.get("CategoryCode");
      };

      this.categoryParentCollection.add({
        CategoryCode: "DEFAULT"
      });
      this.categoryParentCollection.sort({
        silent: true
      });

      this.categoryParentCollection.each(function(model) {
        var parentCategory = model.get("CategoryCode");
        $("#cmbParentCategory").append(new Option(parentCategory, parentCategory));
      });
      $("#cmbParentCategory").val(this.model.get("ParentCategory"));

      this.DisplayDetails();
    },
    SaveCategory: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.ValidateFields();
    },

    RemoveCategory: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.ConfirmationMessage();

    },
    ConfirmationMessage: function() {
      if (!Global.IsSaveChanges || Global.IsSaveChanges == false) {
        Global.IsSaveChanges = true
        navigator.notification.confirm("Are you sure want to remove this Category?", deleteCategory, "Confirmation", ['Yes', 'No']);
      }
    },
    ValidateRemoveCategory: function() {
      this.categoryLookUp = new LookUpCriteriaModel();
      var _rowsToSelect = 100;
      var _self = this;
      this.categoryLookUp.set({
        SortOrderCriteria: "ParentCategory"
      });
      this.categoryLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETCATEGORYDETAILS + _rowsToSelect;
      this.categoryLookUp.save(null, {
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.CheckIfParent(response.SystemCategories);
        },
        error: function() {
          Shared.Products.RequestTimeOut();
        }
      });
    },
    CheckIfParent: function(response) {
      var isParent = false;
      var self = this;
      this.categoryCode = $("#categoryCode").val();
      this.parentCategoryCollection = new CategoryCollection();
      this.parentCategoryCollection.reset(response);
      this.parentCategoryCollection.each(function(model) {
        if (model.get('ParentCategory') == self.categoryCode) {
          if (self.categoryCode = model.get("CategoryCode")) {
            isParent = false;
          } else {
            isParent = true;
          }
        }
      });
      if (isParent === true) {
        var message = "This category cannot be deleted because there are item(s) associated with this record. Please remove this association then retry.";
        navigator.notification.confirm(message, null, "Failed to Remove Category", "Ok");
        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      } else {
        this.RemoveCategoryAccepted();
      }
    },
    RemoveCategoryAccepted: function() {
      this.categoryModel = new BaseModel();
      this.categoryCode = $("#categoryCode").val();
      this.parentCategory = $("#cmbParentCategory").val();
      this.categoryModel.set({
        CategoryCode: this.categoryCode,
        ParentCategory: this.parentCategory,
        IsActive: true,
        Description: this.description
      });
      var _self = this;
      this.categoryModel.url = Global.ServiceUrl + Service.PRODUCT + Method.DELETESYSTEMCATEGORY;
      this.categoryModel.save(null, {

        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.RemoveCategoryCompleted(response);
        },
        error: function(model, error, response) {
          //model.RequestError(error, "Error");
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.RemoveCategoryCompleted(error);
          Shared.Products.RequestTimeOut();
        }
      });
    },

    RemoveCategoryCompleted: function(response) {
      Global.IsSaveChanges = false;
      if (!response) {
        Shared.Products.ShowNotification("Category successfully deleted.");
        this.mainCategoryView.LoadItems();
      } else {
        var error = response.ErrorMessage;
        //Shared.Products.ShowNotification(error,true);
        navigator.notification.alert(error, null, "Failed to Remove Category", "OK");
        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      }
    },

    RemoveCategoryFailed: function(response) {

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
    ValidateFields: function() {
      this.categoryCode = $("#categoryCode").val();
      this.parentCategory = $("#cmbParentCategory").val();
      this.description = $("#description").val();

      //this.isActive = $('#categoryStatus').is(':checked')

      if (this.IsNullOrWhiteSpace(this.categoryCode)) {
        Shared.Products.ShowNotification("Category Code is Required.", true);
        return;
      }
      if (this.IsNullOrWhiteSpace(this.parentCategory)) {
        Shared.Products.ShowNotification("Parent Category is Required.", true);
        return;
      }
      if (this.IsNullOrWhiteSpace(this.description)) {
        Shared.Products.ShowNotification("Description is Required.", true);
        return;
      }
      this.CreateSystemCategory();

    },

    CreateSystemCategory: function() {
      this.categoryModel = new BaseModel();

      this.categoryModel.set({
        CategoryCode: this.categoryCode,
        ParentCategory: this.parentCategory,
        IsActive: true,
        Description: this.description

      });
      var _self = this;
      this.categoryModel.url = Global.ServiceUrl + Service.PRODUCT + Method.UPDATESYSTEMCATEGORY;
      this.categoryModel.save(null, {

        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.CategorySavedCompleted(response);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error");
          Shared.Products.RequestTimeOut();
        }

      });
    },

    CategorySavedCompleted: function(response) {
      if (response.ErrorMessage == null) {
        Shared.Products.ShowNotification("Category Successfully Saved.");
        Global.IsSaveChanges = false;
        this.mainCategoryView.LoadItems("", response);
      } else {
        navigator.notification.alert(response.ErrorMessage, null, "Saving Faiiled", "OK");
        Global.IsSaveChanges = false;
      }
    },

  });
  return CategoryGeneralView;
})
