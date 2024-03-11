define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'model/lookupcriteria',
  'collection/base',
  'view/24.0.0/products/category/detail/sortorder/sortorderlist',
  'text!template/24.0.0/products/category/detail/sortorder.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, LookUpCriteriaModel, CategoryCollection, SortOrderListView, template) {

  var CategorySortOrderView = Backbone.View.extend({
    _template: _.template(template),

    events: {

    },

    initialize: function() {
      this.render()
    },

    render: function() {
      this.$el.html(this._template);
      this.InitializeChildViews();
    },
    InitializeChildViews: function() {
      this.InitializeSortOrderView();
    },
    InitializeSortOrderView: function() {

      this.categoryLookUp = new LookUpCriteriaModel();
      var _rowsToSelect = 100;
      var _self = this;
      this.categoryLookUp.set({
        SortOrderCriteria: "ParentCategory"
      });
      this.categoryLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETCATEGORYDETAILS + _rowsToSelect;
      this.categoryLookUp.save(null, {
        success: function(collection, response) {
          _self.DisplayParentNode(response.SystemCategories);
          _self.InitializeParentNode();
        }
      });

    },
    DisplayParentNode: function(response) {
      this.categoryCollection = new CategoryCollection();
      this.categoryCollection.reset(response);
      this.categoryCollection.each(function(model) {
        var parentCategory = model.get("ParentCategory");
        parentCategory = parentCategory.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
        model.set({
          ParentID: parentCategory
        });
        var sortOrderList = new SortOrderListView({
          el: $("#sortOrderList"),
          model: model
        })
      });



    },
    InitializeParentNode: function() {
      this.categoryLookUp = new LookUpCriteriaModel();
      var _rowsToSelect = 100;
      var _self = this;

      this.categoryLookUp.set({
        SortOrderCriteria: "CategoryCode"
      });
      this.categoryLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETCATEGORYDETAILS + _rowsToSelect;
      this.categoryLookUp.save(null, {
        success: function(collection, response) {
          _self.DisplayChildNode(response.SystemCategories);
        }
      });
    },
    DisplayChildNode: function(response) {
      this.parentCategoryItemCollection = new CategoryCollection();
      this.parentCategoryItemCollection.reset(response);
      var self = this;

      var self = this;
      this.parentCategoryItemCollection.each(function(model) {

        var parentCategory = model.get("ParentCategory");
        parentCategory = parentCategory.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
        var modelID = model.get("CategoryCode").replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
        model.set({
          ParentID: parentCategory,
          ModelID: modelID,
        });
        if ($("#" + parentCategory).hasClass('childNode')) {
          $("#" + parentCategory).html("");
          $("#" + parentCategory).append("<label>" + model.get("ParentCategory") + "</label><input type='checkbox' checked='checked' /><ol><li class='file childNode' id =" + modelID + "><a>" + model.get("CategoryCode") + "</a></li><ol>");
          $("#" + parentCategory).removeClass('childNode');
          $("#" + parentCategory).addClass('childNodeParent');
        } else {
          if ($("#" + parentCategory).hasClass('childNodeParent')) {
            $("#" + parentCategory + " > ol").append("<li class='file childNode' id =" + modelID + "><a>" + model.get("CategoryCode") + "</a></li>");
          } else {
            $("#" + parentCategory + "> input").removeAttr("disabled");
            $("#" + parentCategory + "> ol").append("<li class='file childNode' id =" + modelID + "><a>" + model.get("CategoryCode") + "</a></li>");
          }
        }

      });


    },

    LoadScroll: function() {
      this.myScroll = new iScroll('parentCategoryListContainer', {
        vScrollbar: true,
        vScroll: true,
        snap: false,
        momentum: true,
        zoom: true,
        onBeforeScrollStart: function(e) {
          var target = e.target;
          while (target.nodeType != 1) target = target.parentNode;

          if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
            e.preventDefault();
        }
      });
      //this.myScroll = new iScroll('parentCategoryListContainer',{vScrollbar:true, vScroll:true, snap:false, momentum:true,zoom:true});
      setTimeout(function() {
        this.myScroll = new iScroll('parentCategoryListContainer', {
          vScrollbar: true,
          vScroll: true,
          snap: false,
          momentum: true,
          zoom: true,
          onBeforeScrollStart: function(e) {
            var target = e.target;
            while (target.nodeType != 1) target = target.parentNode;

            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
              e.preventDefault();
          }
        });
        myScroll.refresh();
      }, 1000);
    }


  });
  return CategorySortOrderView;
})
