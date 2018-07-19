/**
 * Connected Business | 05-09-2013
 * Required: el, collection
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'shared/enum',
  'model/base',
  'view/15.0.1/secondarydisplay/cartitem',
  'view/15.0.1/secondarydisplay/summary',
  'view/15.0.1/secondarydisplay/kit',
  'text!template/15.0.1/secondarydisplay/cart.tpl.html',
  'js/libs/iscroll.js',
], function($, $$, _, Backbone, Global, Shared, Enum,
  BaseModel, CartItemView, SummaryView, KitView, template) {

  var CartView = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      this.collection.on("add", this.ModelAdded, this);
      this.collection.on("reset", this.ReinitializeCart, this);
      this.render();
    },

    render: function() {
      this.$el.html(this._template);
      this.InitializeSummary();
      //this.LoadiScroll();
    },

    InitializeSummary: function() {
      if (!this.summaryView) {
        this.InitializeSummaryModel();
        this.summaryView = new SummaryView({
          el: $(".cartSummary"),
          model: this.summaryModel
        });
      }
      this.summaryView.render();
    },

    InitializeSummaryModel: function() {
      this.summaryModel = new BaseModel({
        TotalQuantity: 0,
        Total: 0,
        TotalDiscount: 0,
        TaxRate: 0,
        Payment: 0,
        BalanceRate: 0,
        CurrencySymbol: Global.CurrencySymbol,
        Type: "Sale",
      });
    },

    ManageCartCSS: function() {
      $('.secondarydisplay-page div.rightpane div.cartSummary').css('width', '360px');
    },

    LoadiScroll: function() {
      var _contentID = 'cartContent',
        _tableID = 'cartListContainer',
        cartContentBottom = $('#' + _contentID).offset().top + $('#' + _contentID).height(),
        cartListBottom = $('#' + _tableID).offset().top + $('#' + _tableID).height();


      if (Global.isBrowserMode) {
        Shared.UseBrowserScroll('#cartContent');
        this.ManageCartCSS();
        if (cartListBottom > 570) $("#" + _contentID).animate({
          scrollTop: $('#' + _tableID)[0].scrollHeight
        }, 100);
        return;
      }

      if (this.myScroll) {
        this.myScroll.refresh();
        if (cartListBottom > 570) this.myScroll.scrollToElement('tbody:last-child', 100);
      } else this.myScroll = new iScroll(_contentID, {
        snap: true,
        momentum: true
      });
    },

    AddOneItemToCart: function(item) {
      var cartItemView = new CartItemView({
        model: item
      });
      this.$("#cartListContainer").append(cartItemView.render().el);

      if (item.get('ItemType') === Enum.ItemType.Kit) {
        var kitView = new KitView({
          id: item.get('ItemCode') + '-' + item.get('LineNum'),
          lineNum: item.get('LineNum'),
          collection: item.get('KitDetails')
        });

        this.$('#cartListContainer').append(kitView.render().el);
      }
    },

    ModelAdded: function(model) {
      this.AddOneItemToCart(model);
      this.RefreshCartTable();
    },

    RefreshCartTable: function() {
      this.$(".cartHeader .itemName").width(this.$("#cartListContainer .cart-details .itemName").width());
      this.$(".cartHeader .itemQty").width(this.$("#cartListContainer .cart-details .itemQty").width());
      this.$(".cartHeader .itemRemaining").width(this.$("#cartListContainer .cart-detailst .itemRemaining").width());
      this.$(".cartHeader .itemPrice").width(this.$("#cartListContainer .cart-details .itemPrice").width());
      this.$(".cartHeader .itemDiscount").width(this.$("#cartListContainer .cart-details .itemDiscount").width());
      this.$(".cartHeader .itemExtPrice").width(this.$("#cartListContainer .cart-details .itemExtPrice").width());
      this.$(".cartHeader .itemViewDetail").width(this.$("#cartListContainer .cart-details .itemViewDetail").width());
      this.LoadiScroll();
    },

    ClearCart: function() {
      this.$("#cartListContainer tbody").empty();

      if (this.myScroll) {
        this.myScroll.destroy();
        this.myScroll = null;
        this.$("#cartListContainer").removeAttr("style");
      }
    },

    ReinitializeCart: function() {
      this.ClearCart();
    },

    SetTotal: function(total) {
      this.$(".total-amount").html(total);
    },

    UpdateSummary: function(model) {
      this.summaryView.render(model);
    }
  });
  return CartView;
});
