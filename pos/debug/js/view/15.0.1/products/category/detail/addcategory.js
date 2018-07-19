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
  'text!template/15.0.1/products/category/detail/addcategory.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, Shared, LookUpCriteriaModel, BaseModel, CategoryCollection, template) {

  var AddCategoryView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap .saveBtn ": "saveBtn_Tap",
      "tap .cancelBtn ": "cancelBtn_Tap",
      "change #categoryCode": "categoryCode_Change"
    },

    initialize: function() {
      currentInstance = this;
      this.render();
    },

    render: function() {
      this.$el.html(this._template);

    },

    InitializeChildViews: function() {
      this.InitializeParentCategories();
      $("categoryStatus-div").trigger('create');
    },

    BindToForm: function(categoryView) {
      this.mainCategoryView = categoryView;
    },

    InitializeParentCategories: function() {
      this.categoryLookUp = new LookUpCriteriaModel();
      var _rowsToSelect = 100;
      var _self = this;
      this.categoryLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETCATEGORYDETAILS + _rowsToSelect;
      this.categoryLookUp.save(null, {
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.LoadParentCategories(response.SystemCategories);
        },
        error: function() {
          Shared.Products.RequestTimeOut();
        }
      });
    },

    LoadParentCategories: function(response) {

      $('#cmbParentCategory > option[val !=""]').remove();
      this.categoryCollection = new CategoryCollection();
      this.categoryCollection.reset(response);

      this.categoryCollection.comparator = function(_collection) {
        return _collection.get("CategoryCode");
      };

      this.categoryCollection.add({
        CategoryCode: "DEFAULT"
      });
      this.categoryCollection.sort({
        silent: true
      });

      if (this.categoryCollection.length > 0) {

        this.categoryCollection.each(function(model) {
          var parentCategory = model.get("CategoryCode");
          $("#cmbParentCategory").append(new Option(parentCategory, parentCategory));
          //if(parentCategory === "DEFAULT") $("#cmbParentCategory option[value='"+parentCategory+"']").attr("selected", true);
        });

        var found = [];
        $("select option").each(function() {
          if ($.inArray(this.value, found) != -1) $(this).remove();
          found.push(this.value);
        });
      }
      $("#cmbParentCategory").val("DEFAULT");
    },

    saveBtn_Tap: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.ValidateFields();
    },

    cancelBtn_Tap: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      navigator.notification.confirm("Do you want to cancel Adding new Category?", confirmCancelNew, "Confirmation", ['Yes', 'No']);
    },

    DoCancelNew: function() {
      Global.FormHasChanges = false;
      this.mainCategoryView.LoadItems();
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

      if (Shared.IsNullOrWhiteSpace(this.categoryCode)) {
        Shared.Products.ShowNotification("Category Code is Required.", true);
        return;
      }
      if (Shared.IsNullOrWhiteSpace(this.parentCategory)) {
        Shared.Products.ShowNotification("Parent Category is Required.", true);
        return;
      }
      if (Shared.IsNullOrWhiteSpace(this.description)) {
        Shared.Products.ShowNotification("Description is Required.", true);
        return;
      }

      Shared.Products.Overlay.Show();
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
      this.categoryModel.url = Global.ServiceUrl + Service.PRODUCT + Method.CREATESYSTEMCATEGORY;
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
      if (response.ErrorMessage) {
        navigator.notification.alert(response.ErrorMessage, null, "Unable to Add Category", "OK");
        Shared.Products.Overlay.Hide();
      } else {
        Shared.Products.ShowNotification("Category Successfully Saved");
        Shared.Products.Overlay.Hide();
        Global.FormHasChanges = false;

        this.mainCategoryView.LoadItems("", response);
        //this.mainCategoryView.LoadSelectedItem(response);
      }
    },

    categoryCode_Change: function(e) {
      e.preventDefault();
      this.AssignDescriptionFromCategoryCode();
    },

    AssignDescriptionFromCategoryCode: function() {
      var code = $("#categoryCode").val();
      var desc = $("#description").val();

      if (code == null || code == "") return;
      if (desc != null && desc != "") return;

      this.AssignDescription(code);
    },

    AssignDescription: function(desc) {
      $("#description").val(desc);
    }

  });

  var currentInstance;
  var confirmCancelNew = function(button) {
    if (button == 1) {
      currentInstance.DoCancelNew();
    }
  }

  return AddCategoryView;
})
