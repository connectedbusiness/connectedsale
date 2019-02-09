/**
 * Connected Business | 06-19-2012
 * Required: el
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'model/lookupcriteria',
  'model/category',
  'collection/preferences',
  'collection/categories',
  'collection/lookupcategories',
  'view/19.1.0/settings/category/lookupcategories',
  'view/19.1.0/settings/category/currentcategories',
  'text!template/19.1.0/settings/category/categorypage.tpl.html',
  'view/spinner',
], function($, $$, _, Backbone, Global, Service, Method,
  LookupCriteriaModel, CategoryModel,
  PreferenceCollection, CategoryCollection, LookupCategoryCollection,
  LookupCategoriesView, CurrentCategoriesView,
  template, Spinner) {
  var CartView = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(this._template);
      this.InitializeCurrentCategoryView();
    },

    InitializeCurrentCategoryView: function() { //15x
      this.InitializeCategories();
      if (this.categoriesView) {
        this.categoriesView.setElement(this.$("#currentCategory"));
        this.categoriesView.render();
      } else {
        this.categoriesView = new CurrentCategoriesView({
          el: this.$("#currentCategory"),
          collection: this.currentCollection
        });

      }

      this.FetchPreference();
    },

    InitializeLookupCategoriesView: function() {
      this.InitializeLookupCategories();
      if (this.lookupcategoriesView) {
        this.lookupcategoriesView.setElement(this.$("#lookupCategory"));
        this.lookupcategoriesView.render();
      } else {
        this.lookupcategoriesView = new LookupCategoriesView({
          el: this.$("#lookupCategory"),
          collection: this.lookupCategories,
          currentCollection: this.currentCollection
        });
      }

      this.FetchLookupCategories();
    },

    InitializeCategories: function() {
      if (!this.currentCollection) {
        this.currentCollection = new CategoryCollection();
        this.currentCollection.on('setDefault', this.CurrentCategoryIsSelected, this);
        this.currentCollection.on('categoryRemoved', this.RemoveCurrentCategory, this);
      }
    },

    InitializeLookupCategories: function() {
      if (!this.lookupCategories) {
        this.lookupCategories = new LookupCategoryCollection();
        this.lookupCategories.on('selected', this.LookupCategoryIsSelected, this);
      }
    },

    InitializePreferences: function() {
      //this is the collection that holds the entire POSPreferenceGroup
      if (!this.preferences) {
        this.preferences = new PreferenceCollection();
      }
    },

    FetchPreference: function() {
      var self = this;
      this.ShowSpinner();
      $("#settings-category").trigger("create");

      this.InitializePreferences();
      this.preferences.url = Global.ServiceUrl + Service.POS + Method.GETPREFERENCEBYWORKSTATION + Global.POSWorkstationID;
      this.preferences.fetch({
        success: function(collection, response) {
          self.ResetCurrentCollection(response.Categories);

          self.InitializeLookupCategoriesView();
          self.SetSelected();
          self.HideActivityIndicator();
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Retrieving Workstation Preferences");
        }
      });
    },

    ResetCurrentCollection: function(categories) {
      this.currentCollection.reset(categories);
    },

    FetchLookupCategories: function() {
      var _self = this;
      var _categoryLookup = new LookupCriteriaModel();
      var _rowsToSelect = 100;

      _categoryLookup.set({
        StringValue: ""
      })

      _categoryLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.CATEGORYLOOKUP + _rowsToSelect;
      _categoryLookup.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          //_self.lookupCategories.reset(response.SystemCategories);
          _self.SetLookUpCategories(response.SystemCategories);
          _self.EnableButton();
          _self.HideActivityIndicator();
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving Categories");
        }
      });
    },
    
    SetLookUpCategories: function(collection) {
      var tempCollection = new CategoryCollection(collection);
      tempCollection.each(function(model) {
        var _desc = model.get("Description");
        model.set("FormattedCategoryDescription", _desc);
      });
      
      this.lookupCategories.reset(tempCollection.models);
    },
    
    LookupCategoryIsSelected: function(category) {
      this.CheckDupeCurrentCategory(category);
      this.ReloadListView();
    },

    CheckDupeCurrentCategory: function(category) { //15x
      var _categoryCode = category.get("CategoryCode");
      var _default = category.get("IsDefault");
      var _description = category.get("FormattedCategoryDescription");

      var _exist = this.currentCollection.find(function(model) {
        return model.get("CategoryCode") === _categoryCode;
      });

      if (_exist) {
        console.log("category exist");
      } else {
        this.lookupCategories.remove(category);
        this.currentCollection.add({
          CategoryCode: _categoryCode,
          IsDefault: _default,
          RowID: guid(),
          WorkstationID: Global.POSWorkstationID,
          FormattedCategoryDescription: _description
        });
        if (this.currentCollection.length === 1) {
          this.CurrentCategoryIsSelected(this.currentCollection.at(0));
        }
      }
    },

    ReloadListView: function() {
      $("#currentCategoryListContainer").listview("refresh");
      $("#lookupCategoryListContainer").listview("refresh");
    },

    EnableButton: function() {
      $("#back-main").removeClass('setting-category-disable');
    },

    RemoveCurrentCategory: function(category) {
      var _isDefault = category.get('IsDefault');
      this.CheckDupeLookupCategory(category);
      this.CheckIsDefault(_isDefault);
      this.SetSelected();
      this.ReloadListView();
    },

    CheckDupeLookupCategory: function(category) {
      var _categoryCode = category.get("CategoryCode");

      var _exist = this.lookupCategories.find(function(model) {
        return model.get("CategoryCode") === _categoryCode;
      });

      if (_exist) {
        console.log("category exist");
      } else {
        this.currentCollection.remove(category);
        category.set({
          IsDefault: false
        });
        this.lookupCategories.add(category);
        //sort will trigger a reset and instead it will double up the rendering of collection so empty the container first.
        $("#lookupCategoryListContainer").empty();
        this.lookupCategories.sort();
      }
    },

    CheckIsDefault: function(isDefault) {
      if (!isDefault) return;
      this.SetDefaultFirstCategory();
    },

    SetDefaultFirstCategory: function() {
      if (this.currentCollection.length != 0) {
        var _category = this.currentCollection.at(0);
        _category.set({
          IsDefault: true
        });
      }
    },

    SetSelected: function() {
      this.currentCollection.each(function(category) {
        if (category.get("IsDefault") === true) {
          $("#currentCategoryListContainer li > img").remove();
          $("#currentCategoryListContainer li").removeClass('ui-li-has-icon');
          $("<img class='ui-li-icon' style ='height:25px;width:27px;'/>").attr({
            src: "img/check@2x.png"
          }).prependTo($('#' + category.cid));
          $("#currentCategoryListContainer").listview("refresh");
        }
      });
    },

    CurrentCategoryIsSelected: function(category) {
      if (category.get("IsDefault") === true) {
        return;
      } else {
        this.ResetToNonDefault(category);
        category.set({
          IsDefault: true
        });
        this.RemoveCheckImage(category);
      }
    },

    ResetToNonDefault: function(category) {
      this.currentCollection.each(function(model) {
        if (model != category) {
          model.set({
            IsDefault: false
          });
        }
      });
    },

    RemoveCheckImage: function(category) {
      $("#currentCategoryListContainer li > img").remove();
      $("#currentCategoryListContainer li").removeClass('ui-li-has-icon');
      $("<img class='ui-li-icon' style ='height:17px;width:18px;' src='img/check@2x.png'/>").prependTo($('#' + category.cid));
      $("#currentCategoryListContainer").listview("refresh");
    },

    Save: function() {
      if (!this.currentCollection || !this.preferences || this.preferences.length === 0) {
        return;
      } else {
        var _self = this;
        var _preferenceModel = this.preferences.at(0)
        _preferenceModel.set({
          Categories: this.currentCollection.toJSON()
        })
        var _self = this;
        _preferenceModel.url = Global.ServiceUrl + Service.POS + Method.UPDATEPREFERENCE;
        _preferenceModel.save(null, {
          success: function(model, response) {
            _self.SaveCompleted()
          },
          error: function(model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.RequestError(error, "Error Saving Selected Categories");
          }
        });
      }
    },

    SaveCompleted: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.trigger("SaveCompleted", this);
    },

    ShowSpinner: function() {
      $("#spin").remove();
      $("#main-transaction-blockoverlay").show();
      target = document.getElementById('settings-category');
      this.ShowActivityIndicator(target);
      $("<h5>Loading...</h5>").appendTo($("#spin"));
    },

    ShowActivityIndicator: function(target) {
      $("<div id='spin'></div>").appendTo(target);
      var _target = document.getElementById('spin');
      _spinner = Spinner;
      _spinner.opts.color = '#fff'; //The color of the spinner
      _spinner.opts.lines = 13; // The number of lines to draw
      _spinner.opts.length = 7; // The length of each line
      _spinner.opts.width = 4; // The line thickness
      _spinner.opts.radius = 10; // The radius of the inner circle
      _spinner.opts.top = 'auto'; // Top position relative to parent in px
      _spinner.opts.left = 'auto';
      _spinner.spin(_target);
    },

    HideActivityIndicator: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      _spinner = Spinner;
      _spinner.stop();
      $("#spin").remove();
    },

  });

  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  // Generate a pseudo-GUID by concatenating random hexadecimal.
  function guid() {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  };

  return CartView;
});
