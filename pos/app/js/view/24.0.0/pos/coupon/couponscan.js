/**
 * Connected Business | 06-20-2012
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
  'collection/coupons',
  'view/spinner',
  'text!template/24.0.0/pos/coupon/couponscan.tpl.html',
], function($, $$, _, Backbone, Global, Service, Method,
  LookupCriteriaModel, CouponCollection, Spinner, template) {

  var _view;
  var _closeView = function(button) {
    if (button === 1) {
      return;
    } else {
      _view.Close();
    }
  }

  var CouponListView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "keypress #text-coupon": "textCoupon_KeyPress",
      "tap .btn-done": "btnDone_tap",
      "blur #text-coupon": "HideClearBtn",
      "focus #text-coupon": "ShowClearBtn",
      "tap #text-couponClearBtn": "ClearText",
    },

    initialize: function() {
      this.render();
      this.SetFocusOnCoupon();
    },

    render: function() {
      this.$el.html(this._template);
      this.$("#coupon-scan-content").trigger("create");
    },

    FetchCoupons: function() {
      var _self = this;
      var _criteria = this.$("#text-coupon").val();
      var _couponLookup = new LookupCriteriaModel();
      var _rowsToSelect = 100;

      if (!_criteria) _criteria = "";

      _couponLookup.set({
        CustomerCode: Global.CustomerCode,
        CriteriaString: _criteria
      })

      this.ShowActivityIndicator();

      _couponLookup.url = Global.ServiceUrl + Service.SOP + Method.COUPONLOOKUP + _rowsToSelect;
      _couponLookup.save(null, {
        success: function(model, response) {
          _self.ResetCouponCollection(response.Coupons);
        },
        error: function(model, error, response) {
          model.RequestError(error, "Error Retrieving Coupons");
        }
      });
    },

    ResetCouponCollection: function(coupons) {
      this.HideActivityIndicator();
      if (coupons == null || coupons.length === 0 || coupons.length > 1) {
        var _criteria = this.$("#text-coupon").val();
        _view = this;
        var _errorMessage = "Coupon '" + _criteria + "' does not exist. Do you want to continue searching?";
        console.log(_errorMessage);
        navigator.notification.confirm(_errorMessage, _closeView, "Coupon Not Found", ['Yes', 'No']);
      } else {
        this.collection.reset(coupons);
        this.SelectCoupon();
      }
    },

    SelectCoupon: function() {
      this.collection.at(0).select();
      this.Close();
    },

    btnDone_tap: function(e) {
      e.preventDefault();
      this.$("#text-coupon").blur();
      if (this.CouponHasText()) {
        this.FetchCoupons();
      } else {
        this.Close();
      }
    },

    Show: function() {
      this.render();
      this.$el.show();
      this.SetFocusOnCoupon();
    },

    Close: function() {
      this.trigger("FormClosed", this);
      this.Hide();
    },

    Hide: function() {
      this.$el.hide();
    },

    CouponHasText: function() {
      var _criteria = this.$("#text-coupon").val();
      if (!_criteria || _criteria === "") {
        return false;
      }

      return true;
    },

    //textCoupon_KeyUp : function(e) {
    textCoupon_KeyPress: function(e) {
      if (e.keyCode === 13) {
        if (this.CouponHasText()) {
          this.$("#text-coupon").blur();
          this.FetchCoupons();
        }
      } else {
        this.ShowClearBtn(e);
      }
    },

    ShowClearBtn: function(e) {
      e.stopPropagation();
      var _id = e.target.id;
      var _val = $("#" + _id).val();
      var _strLength = _val.length;
      var _pos = $("#" + _id).position(); // retrieves the position of the given element
      var _width = $("#" + _id).width();
      //console.log(_id);
      if (_strLength <= 0) {
        this.HideClearBtn();
      } else {
        console.log(_id);
        if (_pos !== null || _pos !== "") {
          $("#" + _id + "ClearBtn").css({
            top: (_pos.top + 8),
            left: (_pos.left + (_width - 23))
          });
          $("#" + _id + "ClearBtn").show();
        }
      }
    },

    HideClearBtn: function() {
      $(".clearTextBtn").fadeOut();
    },

    ClearText: function(e) {
      var _id = e.target.id;
      var id = _id.substring(0, _id.indexOf('ClearBtn'));
      $("#" + id).val("");
      this.HideClearBtn();
    },

    ShowActivityIndicator: function() {
      $("#spin").remove();
      $("<div id='spin'></div>").appendTo(this.$("#coupon-scan-content"));
      var _target = document.getElementById('spin');
      this._spinner = Spinner;
      this._spinner.opts.color = '#fff'; //The color of the spinner
      this._spinner.opts.lines = 13; // The number of lines to draw
      this._spinner.opts.length = 7; // The length of each line
      this._spinner.opts.width = 4; // The line thickness
      this._spinner.opts.radius = 10; // The radius of the inner circle
      this._spinner.spin(_target);
      $("<h5>Searching...</h5>").appendTo($("#spin"));
    },

    HideActivityIndicator: function() {
      $("#spin").remove();
      this._spinner.stop();
    },

    SetFocusOnCoupon: function() {
      this.$("#text-coupon").focus();
    }
  });
  return CouponListView;
})
