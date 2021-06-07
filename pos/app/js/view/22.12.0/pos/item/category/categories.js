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
  'view/22.12.0/pos/item/category/category',
  'text!template/22.12.0/pos/item/category/categories.tpl.html',
  'js/libs/swipe.min.js'
], function($, $$, _, Backbone, Global, Shared, CategoryView, template) {
  var _limit = 4,
    _i = 1,
    _remaining = 0,
    _page = 0;

  var CategoriesView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap #cat-arrow-right": "RightArrow_tapped",
      "tap #cat-arrow-left": "LeftArrow_tapped",
    },

    initialize: function() {
      this.collection.bind('reset', this.LoadItems, this);
      _collection = this.collection;
    },

    render: function() {
      this.$el.html(this._template);
    },

    LeftArrow_tapped: function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (Global.isBrowserMode)
        if (this._currentPage <= 1) {
          return;
        }
      this.swipe.prev();
      Shared.FocusToItemScan();
      this._currentPage--;
    },

    RightArrow_tapped: function(e) {      
      e.preventDefault();
      e.stopPropagation();
      if (Global.isBrowserMode)
        if (this._currentPage >= _page) {
          return;
        }
      this.swipe.next();
      Shared.FocusToItemScan();
      this._currentPage++;
    },

    InitializeSwipe: function(target) {      
      this._currentPage = 1;
      this.swipe = new Swipe(document.getElementById(target), {
        callback: function() {          
          var _a = this.index + 1;
          $("#categoryContainerBullet em").css("color", "#CCC");
          $("#" + _a + "catBullet").css("color", "#6D6D6D");
        }
      });
      var _a = this.swipe.index + 1;
      $("#" + _a + "catBullet").css("color", "#6D6D6D");
    },

    LoadItems: function() {
      this._currentPage = 0;
      var _lastCategory = "";
      var _total = _collection.length;
      var _deletedCtr = 0;
      while (Global.CategoryDuplucates != _deletedCtr) {
        _collection.each(function(model) {
          if (model.get("CategoryCode") == _lastCategory) {
            _deletedCtr += 1;
            model.destroy();
          }

          _lastCategory = model.get("CategoryCode"); //console.log("Last Category : :"+_lastCategory);
        });
      }

      _remaining = _collection.length;
      var _a = _remaining / _limit;

      this.render();
      _page = Math.ceil(_a);
      for (var _i = 1; _i <= _page; _i++) {
        this.PaginateCategories(4, _i, _remaining);
        _remaining = _remaining - _limit;
      }
      var _id = this.$("#categoryList").attr("id");
      this.InitializeSwipe(_id);
      if (Global.isBrowserMode && _page > 1) this.ShowPageNavigator();
    },

    PaginateCategories: function(_limit, _x, _remaining) {
      var collection = _collection.paginate(_limit, _x, _remaining);
      $(".categoryListContainer").append("<li><div id=category-" + _x + "/></li>");
      $("#categoryContainerBullet").append("<em id=" + _x + "catBullet>&#8226;</em>");
      for (var i = 0; i < collection.length; i++) {
        var model = collection[i];
        this.categoryView = new CategoryView({
          model: model
        });
        $("#category-" + _x).append(this.categoryView.render().el);

        var _categoryDesc = model.get("FormattedCategoryDescription");
        if (_categoryDesc.length > 25) this.$('.cat-desc').attr('style', 'word-break: break-all');

        if (i === 3 || i === 6 || i === 9 || i === 12) {
          $("#" + model.cid).css({
            'margin-left': '0px',
            'margin-right': '0px'
          });
        }
      }
    },

    ShowPageNavigator: function() {
      $('#cat-arrow-right').removeAttr('style')
      $('#cat-arrow-left').removeAttr('style')
    },
  });
  return CategoriesView;
});
