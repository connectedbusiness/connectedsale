/**
 * Connected Business | 08-6-2012
 * Required: el
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'view/25.1.0/pos/keypad/keypad',
  'text!template/25.1.0/pos/drawerbalance/closingamount.tpl.html',
], function($, $$, _, Backbone, Global, Shared, KeypadView, template) {

  var ClosingAmountView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap #keypad-done-btn": "btnSave_tap",
      "tap #keypad-cancel-btn": "btnCancel_tap"
    },

    initialize: function() {
      this.AllowCancel = this.options.AllowCancel;
      this.render();
    },

    render: function() {

      this.$el.html(this._template({
        PaymentType: Global.PaymentType
      }));
      this.ToggleButtons();
      this.InitializePaymentDetail();
      $("#main-transaction-blockoverlay").show();
      setTimeout(function() {
        Shared.BlurItemScan(); // do something
      }, 200);

    },

    InitializePaymentDetail: function() {
      this.InitializeKeypadView();
    },

    Close: function() {
      this.Hide();
      $("#main-transaction-blockoverlay").hide();
    },

    Show: function(allowCancel) {
      this.AllowCancel = allowCancel;
      this.render();
      this.$el.show();
    },

    Hide: function() {
      $(document).unbind('keydown');
      this.$el.html("");
      this.$el.hide();
    },

    btnSave_tap: function(e) {
      e.preventDefault();
      this.trigger("SaveAmount", this.GetAmount());
      this.Close();
    },

    btnCancel_tap: function(e) {
      e.preventDefault();
      Global.ClosingWorkStation = false;
      this.Close();
    },

    InitializeKeypadView: function() {
      if (this.keypadView) {
        this.keypadView.remove();
      }

      this.keypadView = new KeypadView({
        el: $(".keypad")
      });
      this.keypadView.on('enterTriggered', function() {
        $('#keypad-done-btn').tap();
      }, this)
      this.keypadView.Show();
    },

    GetAmount: function() {
      if (this.keypadView) {
        return this.keypadView.GetAmount();
      }
      return 0;
    },

    ToggleButtons: function() {
      if (!this.AllowCancel) {
        this.$(".popover-btn").hide();
      }
    }

  });

  return ClosingAmountView;
});
