/**
 * Connected Business | 06-20-2012
 * Required: el, model
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/enum',
  'shared/global',
  'shared/shared',
  'model/coupon',
  'collection/coupons',
  'view/26.0.0/pos/coupon/couponlist',
  'view/26.0.0/pos/coupon/couponscan',
  'text!template/26.0.0/pos/coupon/coupon.tpl.html',
  'text!template/26.0.0/pos/coupon/couponscan.tpl.html',
], function($, $$, _, Backbone, Enum, Global, Shared,
  CouponModel, CouponCollection, CouponListView, CouponScanView, template, ScanTemplate) {

  var _couponView;

  var CouponView = Backbone.View.extend({
    _template: _.template(template),
    _scanTemplate: _.template(ScanTemplate),

    events: {
      "tap .btn-Done": "btnDone_tap",
      "tap .li-coupon": "liCoupon_tap",
      "tap .btn-Back": "btnBack_tap",
      "tap #btn-remove-coupon": "btnRemove_tap"
    },

    initialize: function() {
      if (this.couponModel) {
        if (!Shared.IsNullOrWhiteSpace(this.couponModel.get("CustomerCode")) && this.couponModel.get("CustomerCode") != Global.CustomerCode) this.ClearCouponForm();
      }

      this.couponModel = this.model;
      this.render();
    },

    render: function() {
      if (this.AllowShowCouponForm()) {
        if (!this.couponModel || !this.couponModel.get("CouponID")) {
          this.CreateEmptyCoupon();
        }

        this.ManageBinding();
        this.$el.html(this._template(this.couponModel.toJSON()));
        this.$("#couponBody").trigger("create");
        this.$(".btn-Back").hide();
        $("#main-transaction-blockoverlay").show();
      }


    },

    ManageBinding: function() {
      var _discountPercent = this.couponModel.get("DiscountPercent");
      var _discountAmount = this.couponModel.get("DiscountAmount");
      var _minimumAmount = this.couponModel.get("RequiresMinimumOrderAmount");

      if (!this.couponModel.get("IsEmpty")) {
        _discountPercent = _discountPercent.toFixed(2) + " %";
        _discountAmount = (Global.CurrencySymbol || "$") + " " + _discountAmount.toFixed(2);
        _minimumAmount = (Global.CurrencySymbol || "$") + " " + _minimumAmount.toFixed(2);
      }

      this.couponModel.set({
        DiscountPercentDisplay: _discountPercent,
        DiscountAmountDisplay: _discountAmount,
        MinimumAmountDisplay: _minimumAmount
      }, {
        silent: true
      });

      if (this.couponModel.get("Description") == null) {
        this.couponModel.set({
          Description: this.couponModel.get("CouponCode")
        })
      }
    },

    Close: function() {
      this.Hide();
    },

    Show: function() {
      if (this.AllowShowCouponForm()) {
        if (Global.isBrowserMode) Shared.BlurItemScan();
        if (this.couponModel) {
          if (!Shared.IsNullOrWhiteSpace(this.couponModel.get("CustomerCode")) && this.couponModel.get("CustomerCode") != Global.CustomerCode) this.ClearCouponForm();
        }
        this.render();
        this.$el.show();
      }
    },

    Hide: function() {
      this.$el.hide();
      $("#main-transaction-blockoverlay").hide();
    },

    btnDone_tap: function(e) {
      e.stopPropagation();
      //$("#main-transaction-blockoverlay").hide();
      this.AcceptCoupon();
      Shared.FocusToItemScan();
    },

    liCoupon_tap: function(e) {
      e.preventDefault();
      if (this.AllowModifyCoupon()) {
        if (Global.Preference.ShowCouponList) {
          this.ShowCouponList();
        } else {
          this.ShowCouponScan();
        }
      }
    },

    btnBack_tap: function(e) {
      e.preventDefault();
      this.render();
    },

    btnRemove_tap: function(e) {
      e.preventDefault();
      this.RemoveCoupon();
    },

    ShowCouponList: function() {
      this.$("#couponBody").empty();
      this.InitializeCouponListView();
      this.$(".btn-Back").show();
    },

    ShowCouponScan: function() {
      this.InitializeCouponCollection();
      if (this.couponScanView) {
        this.couponScanView.Show();
      } else {
        this.couponScanView = new CouponScanView({
          el: $("#scanCouponContainer"),
          collection: this.couponCollection
        });
        this.couponScanView.on("FormClosed", this.Show, this);
      }
      this.Close();
      $("#main-transaction-blockoverlay").show();
    },

    InitializeCouponListView: function() {
      this.InitializeCouponCollection();
      var couponListView = new CouponListView({
        el: this.$("#couponBody"),
        collection: this.couponCollection
      })
    },

    InitializeCouponCollection: function() {
      if (!this.couponCollection) {
        this.couponCollection = new CouponCollection();
        this.couponCollection.on("selected", this.CouponSelected, this);
      }
    },

    CouponSelected: function(coupon) {
      this.LoadCoupon(coupon);
      this.render();
    },

    RemoveCoupon: function() {
      if (this.AllowModifyCoupon()) {
        if (!this.couponModel.get("IsEmpty")) {
          _couponView = this;
          navigator.notification.confirm("Are you sure you want to remove this coupon?", RemoveCoupon, "Remove Coupon", ['Yes', 'No']);
          //this.ClearCouponForm();
        }
      }
    },

    ClearCouponForm: function() {
      this.ClearCoupon();
      this.render();
      this.Close();
      this.trigger("RemoveCoupon");
      $("#main-transaction-blockoverlay").hide();
    },

    AcceptCoupon: function() {
      if (!this.couponModel.get("IsEmpty")) {
        this.trigger("AcceptCoupon", this.couponModel);
      } else {
        this.Close();
      }
    },

    ClearCoupon: function() {
      this.couponModel = null;
    },

    CreateEmptyCoupon: function() {
      this.couponModel = new CouponModel();
      this.couponModel.set({
        CouponCode: "Select a coupon...",
        Description: "",
        DiscountType: "",
        CouponComputation: "",
        DiscountPercent: "",
        DiscountAmount: "",
        RequiresMinimumOrderAmount: "",
        IsEmpty: true
      });
    },

    LoadCoupon: function(coupon) {
      this.couponModel = coupon;
    },

    AllowModifyCoupon: function() {
      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesPayment:
          return false;
          break;
        case Enum.TransactionType.SalesRefund:
          return false;
          break;
        default:
          return true;
          break;
      }
    },

    TransactionHasCoupon: function() {
      if (!this.couponModel || !this.couponModel.get("CouponID")) {
        return false;
      }
      return true;
    },

    AllowShowCouponForm: function() {
      if (!this.AllowModifyCoupon() && !this.TransactionHasCoupon()) {
        var _errorMessage = "The current transaction does not allow coupons."
        console.log(_errorMessage);
        navigator.notification.alert(_errorMessage, null, "Action Not Allowed", "OK");
        $("#main-transaction-blockoverlay").hide();
        return false;
      }
      return true;
    }

  });

  var RemoveCoupon = function(button) {
    if (button === 1) {
      _couponView.ClearCouponForm();
    } else {
      return;
    }
  }
  return CouponView;
});
