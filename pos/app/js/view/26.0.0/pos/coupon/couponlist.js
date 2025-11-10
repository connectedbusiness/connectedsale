/**
 * Connected Business | 06-20-2012
 * Required: el, collection
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
  'view/26.0.0/pos/coupon/couponitem',
  'view/spinner',
  'text!template/26.0.0/pos/coupon/couponlist.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Service, Method,
  LookupCriteriaModel, CouponItemView, Spinner, template) {
  var CouponListView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      //"keyup #coupon-search" : "inputCouponSearch_KeyUp",
      "keypress #coupon-search": "inputCouponSearch_KeyPress",
      "blur #coupon-search": "HideClearBtn",
      " #coupon-searchClearBtn": "ClearText"
    },

    initialize: function() {
      this.collection.on('reset', this.AddAllCoupon, this);
      this.render();
    },

    render: function() {
      this.$el.html(this._template);
      this.$("#coupon-content").trigger("create");
      this.FetchCoupons();
    },

    FetchCoupons: function() {
      var _self = this;
      var _criteria = this.$("#coupon-search").val();
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
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.ResetCouponCollection(response.Coupons);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.HideActivityIndicator();
          model.RequestError(error, "Error Retrieving Coupons");
        }
      });
    },

    ResetCouponCollection: function(coupons) {
      this.collection.reset(coupons);
    },

    AddOneCoupon: function(coupon) {
      var couponView = new CouponItemView({
        model: coupon
      });
      this.$("#couponListContainer").append(couponView.render().el);
      $("#couponListContainer").listview("refresh");
      this.RefreshScroll();
    },

    RefreshScroll: function() {
      if (Global.isBrowserMode) {
        $("#coupon-content").css('overflow-y', 'auto');
        return;
      }
      if (this.myScroll) {
        this.myScroll.refresh();
      } else {
        this.myScroll = new iScroll('coupon-content');
      }
    },

    ShowNoData: function() {
      this.$(".no-data").show();
    },

    AddAllCoupon: function() {
      if (!this.collection.length > 0) {
        this.ShowNoData();
      }
      this.$("#couponListContainer").empty();
      this.collection.each(this.AddOneCoupon, this);
      this.HideActivityIndicator();
    },

    Show: function() {
      this.render();
    },

    //inputCouponSearch_KeyUp : function(e) {
    inputCouponSearch_KeyPress: function(e) {
      if (e.keyCode === 13) {
        this.FetchCoupons();
      } else {
        this.ShowClearBtn(e);
      }
    },

    ShowActivityIndicator: function() {
      $("#spin").remove();
      $("<div id='spin'></div>").appendTo(this.$("#coupon-content"));
      var _target = document.getElementById('spin');
      this._spinner = Spinner;
      this._spinner.opts.color = '#fff'; //The color of the spinner
      this._spinner.opts.lines = 13; // The number of lines to draw
      this._spinner.opts.length = 7; // The length of each line
      this._spinner.opts.width = 4; // The line thickness
      this._spinner.opts.radius = 10; // The radius of the inner circle
      /*added by Paulo Renz Ebron (Nov. 06, 2012) for spiiner bug option purposes.
			see details bug details at (http://203.177.136.156:8080/browse/INTMOBA-277)*/
      this._spinner.opts.top = 'auto'; // Top position relative to parent in px
      this._spinner.opts.left = 'auto'; // Left position relative to parent in px
      this._spinner.spin(_target);
      $("<h5>Loading...</h5>").appendTo($("#spin"));
    },

    HideActivityIndicator: function() {
      $("#spin").remove();
      this._spinner.stop();
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
            top: (_pos.top + 7),
            left: (_pos.left + (_width - 18))
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
    }
  });
  return CouponListView;
})
